
import { SPORTRADAR_CONFIG } from './config';
import { getCached } from './cache';

// --- Internal Sportradar Types (Minimal for Fetching) ---
interface SportradarScheduleResponse {
    week: {
        id: string;
        sequence: number;
        title: string;
        games: Array<{
            id: string;
            status: string;
            scheduled: string;
            home: { id: string; name: string; alias: string };
            away: { id: string; name: string; alias: string };
        }>;
    };
}

interface SportradarBoxscoreResponse {
    id: string; // Game ID
    scheduled: string;
    status: string;
    home: {
        id: string;
        name: string;
        alias: string;
        statistics?: any; // To be typed more strictly in normalizer
    };
    away: {
        id: string;
        name: string;
        alias: string;
        statistics?: any;
    };
}

interface SportradarSeasonStatsResponse {
    season: {
        id: string;
        year: number;
        type: string;
    };
    teams: Array<{
        id: string;
        name: string;
        alias: string;
        statistics?: any; // To be typed
    }>;
}

// --- Fetcher Implementation ---

const { API_KEY, BASE_URL, CACHE_TTL } = SPORTRADAR_CONFIG;

// Global queue to ensure strict serial execution
let lastRequestTime = 0;
const MIN_DELAY_MS = 3000; // 3 seconds for trial API safety


export async function fetchSportradar<T>(endpoint: string): Promise<T> {
    // Wait until proper time slot
    const now = Date.now();
    const timeToWait = Math.max(0, MIN_DELAY_MS - (now - lastRequestTime));

    if (timeToWait > 0) {
        await new Promise(resolve => setTimeout(resolve, timeToWait));
    }

    // Double check/Update last request time immediately to block others
    lastRequestTime = Date.now();

    // Actually, for true concurrency safety we need a mutex, but since we are running sequential await in assembler, 
    // this delay-before-fetch pattern works if single-threaded logic is respected.
    // With the Assembler fixes, we are sequential.

    const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}`;
    console.log(`[Fetcher] Requesting: ${endpoint} (Waited ${timeToWait}ms)`);

    const response = await fetch(url);

    // Update again to capture end of request time? No, rate limit usually based on start.

    if (!response.ok) {
        if (response.status === 429) {
            throw new Error(`Sportradar Rate Limit Exceeded: ${response.statusText}`);
        }
        throw new Error(`Sportradar API Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get the specific game details for a team in a given week.
 * Resolves the game ID first from the weekly schedule.
 */
export async function resolveGame(season: number, week: number, teamAlias: string) {
    const schedule = await getWeeklySchedule(season, week);

    const game = schedule.week.games.find(
        g => g.home.alias === teamAlias || g.away.alias === teamAlias
    );

    if (!game) {
        console.warn(`No game found for ${teamAlias} in Week ${week}, Season ${season}`);
        return null;
    }

    const isHome = game.home.alias === teamAlias;

    return {
        game_id: game.id,
        team_id: isHome ? game.home.id : game.away.id,
        opponent_id: isHome ? game.away.id : game.home.id,
        opponent_alias: isHome ? game.away.alias : game.home.alias,
        home_away: isHome ? 'home' : 'away',
        scheduled: game.scheduled,
        status: game.status
    } as const;
}

/**
 * Fetch the Weekly Schedule
 */
export async function getWeeklySchedule(season: number, week: number): Promise<SportradarScheduleResponse> {
    // Endpoint: /games/{year}/{season_type}/{week}/schedule.json
    // Assuming REG season for now. Ideally should accept type.
    const seasonType = 'REG';
    const endpoint = `/games/${season}/${seasonType}/${week}/schedule.json`;

    return getCached(
        `schedule_${season}_${seasonType}_${week}`,
        () => fetchSportradar<SportradarScheduleResponse>(endpoint),
        CACHE_TTL.SCHEDULE
    );
}

/**
 * Fetch Boxscore (Game Stats)
 * Logic: If game is valid, fetch boxscore.
 */
export async function getGameBoxscore(gameId: string): Promise<SportradarBoxscoreResponse> {
    const endpoint = `/games/${gameId}/boxscore.json`;

    return getCached(
        `boxscore_${gameId}`,
        () => fetchSportradar<SportradarBoxscoreResponse>(endpoint),
        CACHE_TTL.GAME_STATS
    );
}

/**
 * Fetch Team Season Stats (for all teams or specific? V7 usually has /seasons/.../teams/statistics)
 * But often it's easier to fetch specific team seasonal stats if API allows.
 * V7 official: /seasons/{year}/{season_type}/teams/{team_id}/statistics.json
 */
export async function getTeamSeasonStats(season: number, teamId: string) {
    const seasonType = 'REG';
    const endpoint = `/seasons/${season}/${seasonType}/teams/${teamId}/statistics.json`;

    return getCached(
        `season_stats_${season}_${teamId}`,
        () => fetchSportradar<any>(endpoint), // Return raw, clean in normalizer
        CACHE_TTL.SEASON_STATS
    );
}

/**
 * Fetch Team Roster
 */
export async function getTeamRoster(teamId: string) {
    const endpoint = `/teams/${teamId}/full_roster.json`;
    return getCached(
        `roster_${teamId}`,
        () => fetchSportradar<any>(endpoint),
        CACHE_TTL.ROSTER
    );
}

/**
 * Fetch Player Profile (includes seasonal stats)
 * Endpoint: /players/{player_id}/profile.json
 */
export async function getPlayerProfile(playerId: string) {
    const endpoint = `/players/${playerId}/profile.json`;
    return getCached(
        `player_profile_${playerId}`,
        () => fetchSportradar<any>(endpoint),
        CACHE_TTL.ROSTER // Reuse roster TTL for player data
    );
}

/**
 * Search for a player by name within a roster.
 * Returns the first match with player_id, team_alias, position.
 */
export function searchPlayerInRoster(
    playerName: string,
    roster: any
): { player_id: string; team_alias: string; position: string; full_name: string } | null {
    if (!roster?.players) return null;

    const normalizedSearch = playerName.toLowerCase().trim();

    for (const player of roster.players) {
        const fullName = player.name?.toLowerCase() || '';
        // Match full name or partial (first + last)
        if (fullName === normalizedSearch || fullName.includes(normalizedSearch)) {
            return {
                player_id: player.id,
                team_alias: roster.alias || '',
                position: player.position || '',
                full_name: player.name || ''
            };
        }
    }
    return null;
}

/**
 * Get all NFL teams (for cross-team player search)
 * Endpoint: /league/hierarchy.json
 */
export async function getLeagueHierarchy() {
    const endpoint = `/league/hierarchy.json`;
    return getCached(
        `league_hierarchy`,
        () => fetchSportradar<any>(endpoint),
        CACHE_TTL.SEASON_STATS // Long-lived cache
    );
}
