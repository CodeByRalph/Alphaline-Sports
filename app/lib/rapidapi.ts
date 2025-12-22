const HOST = process.env.RAPIDAPI_HOST!;
const KEY = process.env.RAPIDAPI_KEY!;

interface GameLog {
    gameID: string;
    gameDate: string;
    weekName: string;
    team: string; // The player's team in this log
    opp: string;  // Opponent abbreviation
    // Stats are nested differently per position, handled in UI/Analysis
    [key: string]: any;
}

interface PlayerStats {
    playerID: string;
    longName: string;
    team: string; // Player's current team
    pos?: string;
    games: GameLog[];
    nextGame?: NextGameContext;
}

interface NextGameContext {
    opponent: string;
    gameDate: string;
    location: string;
    weather: string;
    oppDefenseRank: string; // "14th vs Pass", etc.
}

export async function getPlayerLookingGlass(playerName: string): Promise<PlayerStats | null> {
    try {
        // 1. Get Player Info
        const infoUrl = `https://${HOST}/getNFLPlayerInfo?playerName=${encodeURIComponent(playerName)}`;
        const infoRes = await fetch(infoUrl, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        const infoData = await infoRes.json();

        if (!infoData.body || infoData.body.length === 0) return null;

        const player = infoData.body[0];
        const playerID = player.playerID;
        const teamAbv = player.team;

        // 2. Get Games for current season (Defaulting to 2025 as per current time context)
        let season = '2025';
        let gamesUrl = `https://${HOST}/getNFLGamesForPlayer?playerID=${playerID}&season=${season}`;
        let gamesRes = await fetch(gamesUrl, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        let gamesData = await gamesRes.json();

        // If 2025 empty, fallback to 2024
        if (!gamesData.body || Object.keys(gamesData.body).length === 0) {
            season = '2024';
            gamesUrl = `https://${HOST}/getNFLGamesForPlayer?playerID=${playerID}&season=${season}`;
            gamesRes = await fetch(gamesUrl, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
            gamesData = await gamesRes.json();
        }

        const gamesMap = gamesData.body || {};
        let games = Object.values(gamesMap) as GameLog[];

        // Filter out preseason games (games before September)
        // gameID format: YYYYMMDD_AWAY@HOME
        games = games.filter(g => {
            const gameDate = g.gameID?.substring(0, 8); // YYYYMMDD
            if (!gameDate) return false;
            const month = parseInt(gameDate.substring(4, 6));
            // Regular season is September (09) through February (02)
            // Exclude August (08) and earlier which are preseason
            return month >= 9 || month <= 2;
        });

        console.log(`[Tank01] Found ${games.length} regular season games (filtered preseason)`);

        // Sort games by date (most recent first)
        games.sort((a, b) => (b.gameID > a.gameID ? 1 : -1));

        // 3. Get Upcoming Game Schedule for Team
        // Use 2025 explicitly if possible for schedule to match current date
        const nextGame = await getUpcomingGame(teamAbv, '2025');

        return {
            playerID,
            longName: player.longName,
            team: player.team,
            pos: player.pos,
            games: games.slice(0, 10), // Last 10 played games for better sample
            nextGame
        };

    } catch (e) {
        console.error("RapidAPI connection error:", e);
        return null;
    }
}

async function getUpcomingGame(teamAbv: string, season: string): Promise<NextGameContext | undefined> {
    // Use dynamic schedule lookup for all teams
    try {
        // Need to find schedule. Endpoint: getNFLTeamSchedule
        const url = `https://${HOST}/getNFLTeamSchedule?teamAbv=${teamAbv}&season=${season}`;
        const res = await fetch(url, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        const data = await res.json();

        const schedule = data.body?.schedule || [];

        // Find first game that is effectively "today" or in the future.
        // Use dynamic date calculation
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}${month}${day}`; // YYYYMMDD format

        // Tank01 schedule format usually has gameDate as YYYYMMDD string.
        // We want the first game where gameDate >= today.
        const next = schedule.find((g: any) => g.gameDate >= today);

        if (!next) {
            console.log(`No upcoming games found for ${teamAbv} after ${today}`);
            return undefined;
        }

        const isHome = next.home === teamAbv;
        const opponent = isHome ? next.away : next.home;
        // Fix location string to be cleaner
        const location = isHome ? `Home vs ${opponent}` : `Away @ ${opponent}`;

        // Mock Weather & Defense based on Opponent/Location
        const weather = getWeatherMock(location, next.gameDate);
        const oppDefenseRank = getDefenseMock(opponent);

        return {
            opponent,
            gameDate: next.gameDate,
            location,
            weather,
            oppDefenseRank
        };
    } catch (e) {
        console.warn("Failed to get schedule", e);
        return undefined;
    }
}

function getWeatherMock(location: string, date: string): string {
    // Simple hash-based determiner or random for "Live" feel
    const conditions = ['Clear, 55°F', 'Cloudy, 42°F', 'Drizzle, 60°F', 'Sunny, 72°F', 'Dome (Indoor)'];
    const isDome = location.includes('DET') || location.includes('MIN') || location.includes('LV') || location.includes('IND') || location.includes('HOU') || location.includes('NO') || location.includes('ATL') || location.includes('DAL') || location.includes('ARI');

    if (isDome) return "Indoors (Dome)";
    return conditions[Math.floor(Math.random() * conditions.length)];
}

function getDefenseMock(team: string): string {
    // Randomize or hardcode some reputation
    const rank = Math.floor(Math.random() * 32) + 1;
    const type = Math.random() > 0.5 ? 'Pass' : 'Rush';
    const quality = rank < 10 ? 'Elite' : rank > 25 ? 'Vulnerable' : 'Average';
    return `#${rank} vs ${type} (${quality})`;
}

// --- NEW: Tank01 Insider Agent Support ---

export interface Tank01InjuryData {
    playerID: string;
    longName: string;
    team: string;
    pos: string;
    injury?: {
        designation?: string; // 'Questionable', 'Out', 'Doubtful', 'IR'
        injuryArea?: string;  // 'Knee', 'Ankle', etc.
        description?: string;
    };
}

export interface Tank01TeamRoster {
    playerID: string;
    longName: string;
    pos: string;
    team: string;
    jerseyNum?: string;
    depth?: number;
    injury?: {
        designation?: string;
        injuryArea?: string;
    };
}

/**
 * Get player injury status from Tank01
 * Endpoint: /getNFLPlayerInfo (injury included in player data)
 */
export async function getPlayerInjuryStatus(playerName: string): Promise<Tank01InjuryData | null> {
    try {
        const url = `https://${HOST}/getNFLPlayerInfo?playerName=${encodeURIComponent(playerName)}`;
        const res = await fetch(url, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        const data = await res.json();

        if (!data.body || data.body.length === 0) return null;

        const player = data.body[0];
        return {
            playerID: player.playerID,
            longName: player.longName,
            team: player.team,
            pos: player.pos || 'UNK',
            injury: player.injury ? {
                designation: player.injury.designation,
                injuryArea: player.injury.injuryArea,
                description: player.injury.description
            } : undefined
        };
    } catch (e) {
        console.error("Tank01 injury fetch error:", e);
        return null;
    }
}

/**
 * Get team roster with injuries from Tank01
 * Endpoint: /getNFLTeamRoster
 */
export async function getTeamRoster(teamAbv: string): Promise<Tank01TeamRoster[]> {
    try {
        const url = `https://${HOST}/getNFLTeamRoster?teamAbv=${teamAbv}&getStats=false`;
        const res = await fetch(url, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        const data = await res.json();

        const roster = data.body?.roster || [];
        return roster.map((p: any) => ({
            playerID: p.playerID,
            longName: p.longName,
            pos: p.pos,
            team: p.team || teamAbv,
            jerseyNum: p.jerseyNum,
            depth: p.depth,
            injury: p.injury ? {
                designation: p.injury.designation,
                injuryArea: p.injury.injuryArea
            } : undefined
        }));
    } catch (e) {
        console.error("Tank01 roster fetch error:", e);
        return [];
    }
}

/**
 * Get team depth chart approximation from roster
 * Groups players by position and sorts by depth/jersey
 */
export function buildDepthChartFromRoster(roster: Tank01TeamRoster[]): Record<string, Tank01TeamRoster[]> {
    const depthChart: Record<string, Tank01TeamRoster[]> = {};

    for (const player of roster) {
        const pos = normalizePosition(player.pos);
        if (!depthChart[pos]) {
            depthChart[pos] = [];
        }
        depthChart[pos].push(player);
    }

    // Sort each position group by depth (if available) or jersey number
    for (const pos of Object.keys(depthChart)) {
        depthChart[pos].sort((a, b) => {
            if (a.depth && b.depth) return a.depth - b.depth;
            return 0;
        });
    }

    return depthChart;
}

function normalizePosition(pos: string): string {
    // Normalize position abbreviations
    const map: Record<string, string> = {
        'LWR': 'WR', 'RWR': 'WR', 'SWR': 'WR',
        'LT': 'OT', 'RT': 'OT',
        'LG': 'OG', 'RG': 'OG',
        'MLB': 'LB', 'ILB': 'LB', 'OLB': 'LB',
        'FS': 'S', 'SS': 'S',
        'LCB': 'CB', 'RCB': 'CB', 'NCB': 'CB',
        'LDE': 'DE', 'RDE': 'DE',
        'LDT': 'DT', 'RDT': 'DT', 'NT': 'DT'
    };
    return map[pos] || pos;
}

// --- NEW: Team Defensive Stats for Scout ---

export interface TeamDefensiveStats {
    team: string;
    passYardsAllowedPerGame: number;
    rushYardsAllowedPerGame: number;
    pointsAllowedPerGame: number;
    sacks: number;
    interceptions: number;
    passDefenseRank?: string;
    rushDefenseRank?: string;
}

/**
 * Get team defensive stats from Tank01
 * Used by Scout to analyze opponent matchup
 */
export async function getTeamDefensiveStats(teamAbv: string): Promise<TeamDefensiveStats | null> {
    try {
        // Tank01 endpoint for team info which may include season stats
        const url = `https://${HOST}/getNFLTeamSchedule?teamAbv=${teamAbv}&season=2025`;
        const res = await fetch(url, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        const data = await res.json();

        const schedule = data.body?.schedule || [];

        // Calculate defensive stats from completed games
        let gamesPlayed = 0;
        let totalPassYardsAllowed = 0;
        let totalRushYardsAllowed = 0;
        let totalPointsAllowed = 0;

        for (const game of schedule) {
            // Only count completed games
            if (game.gameStatus === 'Completed' || game.gameStatus?.includes('Final')) {
                gamesPlayed++;
                const isHome = game.home === teamAbv;
                // Points allowed = opponent's score
                const oppScore = isHome ? Number(game.awayPts || 0) : Number(game.homePts || 0);
                totalPointsAllowed += oppScore;
            }
        }

        if (gamesPlayed === 0) {
            console.log(`[Tank01] No completed games found for ${teamAbv}`);
            return null;
        }

        // Estimate defensive stats (Tank01 schedule has limited defensive detail)
        // These are approximations - real data would need a dedicated stats endpoint
        const avgPointsAllowed = Math.round(totalPointsAllowed / gamesPlayed);

        // Approximate pass/rush yards from league averages adjusted by points
        // League avg: ~220 pass yds, ~110 rush yds per game
        const leagueAvgPassYds = 220;
        const leagueAvgRushYds = 110;
        const pointsFactor = avgPointsAllowed / 21; // 21 is ~league avg

        return {
            team: teamAbv,
            passYardsAllowedPerGame: Math.round(leagueAvgPassYds * pointsFactor),
            rushYardsAllowedPerGame: Math.round(leagueAvgRushYds * pointsFactor),
            pointsAllowedPerGame: avgPointsAllowed,
            sacks: 0, // Would need dedicated endpoint
            interceptions: 0, // Would need dedicated endpoint
            passDefenseRank: avgPointsAllowed < 18 ? 'Elite' : avgPointsAllowed < 24 ? 'Average' : 'Vulnerable',
            rushDefenseRank: avgPointsAllowed < 18 ? 'Elite' : avgPointsAllowed < 24 ? 'Average' : 'Vulnerable'
        };
    } catch (e) {
        console.error(`[Tank01] Error fetching defensive stats for ${teamAbv}:`, e);
        return null;
    }
}

// --- NEW: Player News for Insider Agent ---

export interface PlayerNewsItem {
    title: string;
    link: string;
    playerIDs?: string[];
    source?: string;
}

/**
 * Get recent news for a player from Tank01
 * Useful for determining starting status, injuries, depth chart changes
 */
export async function getPlayerNews(playerName: string): Promise<PlayerNewsItem[]> {
    try {
        // Tank01 player news endpoint
        const url = `https://${HOST}/getNFLNews?playerID=&topNews=false&fantasyNews=false&recentNews=true&maxItems=10`;
        const res = await fetch(url, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        const data = await res.json();

        const allNews = data.body || [];

        // Filter news to find items mentioning the player
        const playerNewsPattern = new RegExp(playerName.replace(/\s+/g, '\\s*'), 'i');
        const relevantNews = allNews.filter((item: any) =>
            playerNewsPattern.test(item.title) || playerNewsPattern.test(item.link)
        );

        console.log(`[Tank01] Found ${relevantNews.length} news items for ${playerName}`);

        return relevantNews.slice(0, 5).map((item: any) => ({
            title: item.title,
            link: item.link,
            playerIDs: item.playerIDs,
            source: item.source
        }));
    } catch (e) {
        console.error(`[Tank01] Error fetching news for ${playerName}:`, e);
        return [];
    }
}

/**
 * Get general NFL news (top headlines)
 */
export async function getTopNFLNews(): Promise<PlayerNewsItem[]> {
    try {
        const url = `https://${HOST}/getNFLNews?topNews=true&fantasyNews=false&recentNews=false&maxItems=5`;
        const res = await fetch(url, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        const data = await res.json();

        const news = data.body || [];
        return news.slice(0, 5).map((item: any) => ({
            title: item.title,
            link: item.link,
            source: item.source
        }));
    } catch (e) {
        console.error('[Tank01] Error fetching top NFL news:', e);
        return [];
    }
}
