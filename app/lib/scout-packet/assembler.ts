
import { ScoutPacket } from './types';
import * as Fetcher from './fetcher';
import { buildMeta, buildIdentityTendencies } from './builders/identity';
import { buildTeamOffense } from './builders/offense';
import { buildTeamDefense } from './builders/defense';
import { buildMatchupReality } from './builders/matchup';
import { buildPlayers, buildPlayerFromTank01 } from './builders/players';
import { buildReliability } from './builders/others';
import { getTeamDefensiveStats } from '../rapidapi';

export interface PropLine {
    value: number;
    type: 'pass_yards' | 'rush_yards' | 'rec_yards' | 'touchdowns' | 'completions' | 'attempts' | 'receptions';
}

export interface CreateOptions {
    playerName?: string;
    propLine?: PropLine;
    season?: number;
    week?: number;
    teamAlias?: string;
    gameContext?: {
        opponent: string;
        gameDate: string;
        location: string;
    };
    // Tank01 player data for enriched analysis
    playerData?: {
        playerID: string;
        longName: string;
        team: string;
        pos?: string;
        games: Array<{
            gameID: string;
            gameDate: string;
            opp: string;
            [key: string]: any; // Stats vary by position
        }>;
    };
}

// Common team alias map for quick player lookup
const PLAYER_TEAM_MAP: Record<string, string> = {
    'dak prescott': 'DAL',
    'lamar jackson': 'BAL',
    'patrick mahomes': 'KC',
    'josh allen': 'BUF',
    'jalen hurts': 'PHI',
    'joe burrow': 'CIN',
    'kyren williams': 'LAR',
    'derrick henry': 'BAL',
    'jamarr chase': 'CIN',
    'ceedee lamb': 'DAL',
    'tyreek hill': 'MIA',
    'davante adams': 'NYJ',
    // Add more as needed
};

export class ScoutPacketAssembler {

    /**
     * Create a Scout Packet from player name + prop line OR team alias.
     */
    static async create(options: CreateOptions): Promise<ScoutPacket> {
        const season = options.season || 2025;
        const week = options.week || 15;

        // Resolve team from player name if not provided
        let teamAlias = options.teamAlias;
        let targetPlayerId: string | null = null;
        let targetPlayerName = options.playerName || null;

        if (options.playerName && !teamAlias) {
            // Try quick map first
            const normalizedName = options.playerName.toLowerCase().trim();
            teamAlias = PLAYER_TEAM_MAP[normalizedName];

            if (!teamAlias) {
                console.warn(`[Assembler] Player "${options.playerName}" not in quick map. Will search rosters.`);
                // Could implement cross-team search here, but expensive
                teamAlias = 'DAL'; // Default fallback
            }
        }

        teamAlias = teamAlias || 'BAL'; // Ultimate fallback

        console.log(`[Assembler] Creating packet for ${targetPlayerName || teamAlias} (Season ${season}, Week ${week})`);

        // 1. Resolve Game - PRIORITY: Use shared gameContext if provided (from Tank01)
        let resolvedGame = null;
        let finalOpponent: string | null = null;

        if (options.gameContext) {
            // Use shared Tank01 context for alignment with other agents
            finalOpponent = options.gameContext.opponent;
            const isHome = options.gameContext.location.toLowerCase().includes('home');
            resolvedGame = {
                game_id: `tank01-${options.gameContext.gameDate}`,
                opponent_alias: options.gameContext.opponent,
                home_away: (isHome ? 'home' : 'away') as 'home' | 'away'
            };
            console.log(`[Assembler] Using shared game context: ${teamAlias} ${isHome ? 'vs' : '@'} ${finalOpponent}`);
        } else {
            // Fallback to Sportradar
            try {
                resolvedGame = await Fetcher.resolveGame(season, week, teamAlias);
                finalOpponent = resolvedGame?.opponent_alias || null;
            } catch (e) {
                console.warn(`[Assembler] Game resolution failed:`, e);
            }
        }

        const teamId = resolvedGame?.team_id || teamAlias;
        const oppId = resolvedGame?.opponent_id || null;

        // 2. Fetch Data - SKIP Sportradar when Tank01 data is available
        let teamStats = null;
        let teamRoster = null;
        let playerProfile = null;
        let oppStats = null;

        // Check if Tank01 data is available - if so, skip ALL Sportradar calls
        const hasTank01Data = options.playerData && options.playerData.games && options.playerData.games.length > 0;

        if (hasTank01Data) {
            console.log(`[Assembler] Using Tank01 data - skipping Sportradar (${options.playerData!.games.length} games available)`);
        } else {
            // Only make Sportradar calls if we DON'T have Tank01 player data
            console.log('[Assembler] No Tank01 data - attempting Sportradar fallback');
            try {
                if (teamId) {
                    teamStats = await Fetcher.getTeamSeasonStats(season, teamId);
                }
            } catch (e) { console.warn('Team stats fail', e); }

            try {
                if (teamId) teamRoster = await Fetcher.getTeamRoster(teamId);
            } catch (e) { console.warn('Roster fail', e); }

            // Search for target player in roster
            if (targetPlayerName && teamRoster) {
                const match = Fetcher.searchPlayerInRoster(targetPlayerName, teamRoster);
                if (match) {
                    targetPlayerId = match.player_id;
                    console.log(`[Assembler] Found player: ${match.full_name} (${match.position})`);
                }
            }

            // Fetch Player Profile if we have a target player
            if (targetPlayerId) {
                try {
                    playerProfile = await Fetcher.getPlayerProfile(targetPlayerId);
                } catch (e) { console.warn('Player profile fail', e); }
            }

            if (oppId) {
                try {
                    oppStats = await Fetcher.getTeamSeasonStats(season, oppId);
                } catch (e) { console.warn('Opponent stats fail', e); }
            }
        }

        // 3. Build Components
        const meta = buildMeta(season, week, resolvedGame, teamAlias, targetPlayerName, options.propLine);
        const identity = buildIdentityTendencies(teamStats);
        const teamOffense = buildTeamOffense(teamStats);
        const teamDefense = buildTeamDefense(teamStats);
        const oppDefense = buildTeamDefense(oppStats);
        const matchup = buildMatchupReality(teamOffense, oppDefense);

        const reliability = buildReliability(teamStats);

        // Build players - PRIORITY: Use Tank01 data if provided
        let players;
        if (options.playerData && targetPlayerName) {
            // Build player from Tank01 game logs
            const tank01Player = buildPlayerFromTank01(targetPlayerName, options.playerData);
            players = [tank01Player];
            console.log(`[Assembler] Using Tank01 player data: ${options.playerData.games.length} games`);
        } else {
            // Fallback to Sportradar
            players = buildPlayers(teamRoster, teamStats, [], playerProfile, targetPlayerName);
        }

        // 4. Assemble
        const packet: ScoutPacket = {
            meta,
            team_identity_tendencies: identity,
            team_offense: teamOffense,
            team_defense: teamDefense,
            players,
            matchup_reality: matchup,
            reliability,
            missing_data: []
        };

        // 5. Add Tank01 game history if available (for LLM to analyze)
        if (hasTank01Data && options.playerData) {
            const games = options.playerData.games;
            const gamesPlayed = games.length;

            // Calculate comprehensive stats from game logs
            let totalPassYards = 0, totalPassAtt = 0, totalPassComp = 0, totalPassTD = 0, totalInt = 0;
            let totalRushYards = 0, totalCarries = 0, totalRushTD = 0;
            let totalRecYards = 0, totalRec = 0, totalRecTD = 0;
            let minPassYards = Infinity, maxPassYards = 0;

            for (const g of games) {
                const passYds = Number(g.Passing?.passYds || 0);
                totalPassYards += passYds;
                totalPassAtt += Number(g.Passing?.passAttempts || 0);
                totalPassComp += Number(g.Passing?.passCompletions || 0);
                totalPassTD += Number(g.Passing?.passTD || 0);
                totalInt += Number(g.Passing?.int || 0);
                totalRushYards += Number(g.Rushing?.rushYds || 0);
                totalCarries += Number(g.Rushing?.carries || 0);
                totalRushTD += Number(g.Rushing?.rushTD || 0);
                totalRecYards += Number(g.Receiving?.recYds || 0);
                totalRec += Number(g.Receiving?.receptions || 0);
                totalRecTD += Number(g.Receiving?.recTD || 0);

                // Track min/max for volume floor/ceiling
                if (passYds > 0) {
                    minPassYards = Math.min(minPassYards, passYds);
                    maxPassYards = Math.max(maxPassYards, passYds);
                }
            }

            // Calculate efficiency metrics
            const yardsPerAttempt = totalPassAtt > 0 ? (totalPassYards / totalPassAtt).toFixed(1) : 'N/A';
            const completionPct = totalPassAtt > 0 ? ((totalPassComp / totalPassAtt) * 100).toFixed(1) : 'N/A';
            const tdIntRatio = totalInt > 0 ? (totalPassTD / totalInt).toFixed(1) : totalPassTD > 0 ? `${totalPassTD}:0` : 'N/A';

            // Recent trend (last 3 vs overall)
            const last3 = games.slice(0, 3);
            const last3PassYards = last3.reduce((sum, g) => sum + Number(g.Passing?.passYds || 0), 0);
            const last3Avg = last3.length > 0 ? Math.round(last3PassYards / last3.length) : 0;
            const seasonAvg = gamesPlayed > 0 ? Math.round(totalPassYards / gamesPlayed) : 0;
            const trendDelta = last3Avg - seasonAvg;

            // Fetch opponent defense stats
            let oppDefense = null;
            if (options.gameContext?.opponent) {
                oppDefense = await getTeamDefensiveStats(options.gameContext.opponent);
            }

            // Add enriched data directly to packet for LLM
            (packet as any).tank01_player_analysis = {
                player_name: options.playerData.longName,
                position: options.playerData.pos,
                team: options.playerData.team,
                sample_size: gamesPlayed,

                // Season Totals
                season_totals: {
                    pass_yards: totalPassYards,
                    pass_attempts: totalPassAtt,
                    pass_completions: totalPassComp,
                    pass_td: totalPassTD,
                    interceptions: totalInt,
                    rush_yards: totalRushYards,
                    rush_td: totalRushTD,
                    rec_yards: totalRecYards,
                    receptions: totalRec,
                    rec_td: totalRecTD
                },

                // Per-Game Averages
                per_game_averages: {
                    pass_yards: seasonAvg,
                    rush_yards: gamesPlayed > 0 ? Math.round(totalRushYards / gamesPlayed) : 0,
                    rec_yards: gamesPlayed > 0 ? Math.round(totalRecYards / gamesPlayed) : 0,
                    pass_attempts: gamesPlayed > 0 ? (totalPassAtt / gamesPlayed).toFixed(1) : 0
                },

                // Efficiency Metrics
                efficiency: {
                    yards_per_attempt: yardsPerAttempt,
                    completion_percentage: completionPct,
                    td_int_ratio: tdIntRatio,
                    pass_td_rate: totalPassAtt > 0 ? ((totalPassTD / totalPassAtt) * 100).toFixed(1) + '%' : 'N/A',
                    int_rate: totalPassAtt > 0 ? ((totalInt / totalPassAtt) * 100).toFixed(1) + '%' : 'N/A'
                },

                // Volume Analysis
                volume_analysis: {
                    floor: minPassYards === Infinity ? 0 : minPassYards,
                    ceiling: maxPassYards,
                    range: maxPassYards - (minPassYards === Infinity ? 0 : minPassYards),
                    consistency_note: maxPassYards - minPassYards > 150 ? 'High variance' : 'Consistent volume'
                },

                // Trend Analysis
                trend_analysis: {
                    last_3_avg: last3Avg,
                    season_avg: seasonAvg,
                    trend_delta: trendDelta,
                    trend_direction: trendDelta > 20 ? 'TRENDING_UP' : trendDelta < -20 ? 'TRENDING_DOWN' : 'STABLE'
                },

                // Opponent Defense (if available)
                opponent_matchup: oppDefense ? {
                    opponent: options.gameContext?.opponent,
                    pass_yards_allowed_per_game: oppDefense.passYardsAllowedPerGame,
                    points_allowed_per_game: oppDefense.pointsAllowedPerGame,
                    pass_defense_quality: oppDefense.passDefenseRank,
                    matchup_note: oppDefense.passDefenseRank === 'Vulnerable'
                        ? 'Favorable matchup for passing'
                        : oppDefense.passDefenseRank === 'Elite'
                            ? 'Difficult matchup for passing'
                            : 'Average matchup'
                } : null,

                // Recent Games Detail
                recent_games: games.map((g: any) => ({
                    gameID: g.gameID,
                    pass_yards: g.Passing?.passYds,
                    pass_attempts: g.Passing?.passAttempts,
                    pass_completions: g.Passing?.passCompletions,
                    pass_td: g.Passing?.passTD,
                    interceptions: g.Passing?.int,
                    qb_rating: g.Passing?.rtg,
                    rush_yards: g.Rushing?.rushYds,
                    carries: g.Rushing?.carries
                }))
            };

            console.log(`[Assembler] Added tank01_player_analysis: ${gamesPlayed} games, avg ${seasonAvg} pass yds, YPA ${yardsPerAttempt}, trend ${trendDelta > 0 ? '+' : ''}${trendDelta}`);
        }

        // 6. Populate missing_data
        packet.missing_data = this.findMissingPaths(packet);

        return packet;
    }

    private static findMissingPaths(obj: any, prefix = ''): string[] {
        let missing: string[] = [];
        if (obj === null || obj === undefined) return [prefix];

        if (Array.isArray(obj)) {
            // Don't iterate all array items to avoid spam, just check empty
            if (obj.length === 0 && prefix === 'players') missing.push('players (empty)');
            return missing;
        }

        if (typeof obj === 'object') {
            for (const key in obj) {
                const val = obj[key];
                const path = prefix ? `${prefix}.${key}` : key;
                if (val === null) {
                    missing.push(path);
                } else if (typeof val === 'object') {
                    missing = missing.concat(this.findMissingPaths(val, path));
                }
            }
        }
        return missing;
    }
}
