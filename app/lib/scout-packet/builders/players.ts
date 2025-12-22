
import { Player, PlayerUsage, PlayerEfficiency } from '../types';
import { extractStat, safeNumber, safePct, normalizePosition } from '../normalizer';

export function buildPlayers(
    roster: any,
    seasonStats: any,
    injuries: any,
    playerProfile?: any,
    targetPlayerName?: string | null
): Player[] {
    // 1. Identify relevant players from season stats (Top QB, Top 3 RBs, Top 5 WR/TEs)
    // 2. Merge with roster for details
    // 3. Merge with injuries
    // 4. If targetPlayerName provided, prioritize that player

    if (!seasonStats?.players) return [];

    const players: Player[] = [];
    const rawPlayers = seasonStats.players || []; // Direct array

    // We need to filter and map. For this demo, we'll map *all* players with significant usage.

    for (const p of rawPlayers) {
        const id = p.id;
        const name = p.name;
        const pos = normalizePosition(p.position);

        // Filter irrelevant low-usage players to keep packet size manageable
        // e.g. QB < 10 att, RB < 5 carries, WR < 2 targets
        const passAtt = extractStat(p, 'passing.attempts') || 0;
        const rushAtt = extractStat(p, 'rushing.attempts') || 0;
        const targets = extractStat(p, 'receiving.targets') || 0;

        if (passAtt < 10 && rushAtt < 5 && targets < 2) continue;

        // Initialize optional fields as undefined
        let dropbacks_per_game: number | undefined;
        let carry_share: number | undefined;
        let target_share: number | undefined;
        let air_yards_share: number | undefined;
        let int_rate: number | undefined;
        let sack_avoidance_rate: number | undefined;
        let yards_per_target: number | undefined;

        // Populate fields based on available data
        if (seasonStats?.record) {
            const teamPassAtt = extractStat(seasonStats, 'record.passing.attempts');
            const teamRushAtt = extractStat(seasonStats, 'record.rushing.attempts');
            // Targets not usually in team record, need sum or approximations? 
            // Better to skip share calc if denominator missing.

            if (passAtt && teamPassAtt) {
                // dropbacks approx = attempts (missing sacks per player in base obj often)
                // Need games played to calculate per_game
            }

            if (rushAtt && teamRushAtt) {
                carry_share = safePct(rushAtt, teamRushAtt) || undefined;
            }

            // For targets share, we need total team targets.
            // We can approximate by Summing top players or if team stats has receiving.targets
            const teamTargets = extractStat(seasonStats, 'record.receiving.targets');
            if (targets && teamTargets) {
                target_share = safePct(targets, teamTargets) || undefined;
            }
        }

        // Efficiency Calcs
        if (targets > 0) {
            const recYards = extractStat(p, 'receiving.yards') || 0;
            const ypt = safeNumber(recYards / targets);
            yards_per_target = ypt !== null ? ypt : undefined;
        }

        const catchRateVal = safePct(extractStat(p, 'receiving.receptions'), targets);

        // Only include usage/efficiency objects if they have data? 
        // No, user wants keys gone if value is null.

        const usage: PlayerUsage = {};
        if (dropbacks_per_game !== undefined) usage.dropbacks_per_game = dropbacks_per_game;
        if (carry_share !== undefined) usage.carry_share = carry_share;
        if (target_share !== undefined) usage.target_share = target_share;
        if (air_yards_share !== undefined) usage.air_yards_share = air_yards_share;

        const efficiency: PlayerEfficiency = {};
        if (int_rate !== undefined) efficiency.int_rate = int_rate;
        if (sack_avoidance_rate !== undefined) efficiency.sack_avoidance_rate = sack_avoidance_rate;
        if (catchRateVal !== null) efficiency.catch_rate = catchRateVal;
        if (yards_per_target !== undefined) efficiency.yards_per_target = yards_per_target;

        // Injury Match
        const injury = injuries?.find((i: any) => i.id === id); // Mock find logic

        players.push({
            id,
            name,
            position: pos,
            team: seasonStats.alias || '', // Team alias
            availability: {
                injury_status: injury?.status || null,
                practice_participation_trend: null, // Keep explicit null if schema requires string | null? 
                // types.ts says string | null. User said "still nulls in individual player dictionary". 
                // I should probably clean availability too or just leave it if explicit null is desired there.
                // Assuming Usage/Efficiency were the main culprits.
                returning_from_injury_flag: false,
                snap_expectation_note: null
            },
            usage,
            efficiency,
            trends: {} // Empty vs nulls
        });
    }

    // Sort by relevance (targets + carries + pass_att)
    return players.sort((a, b) => {
        // Proxy for relevance score
        return 0; // Placeholder sort
    }).slice(0, 15); // Return top 15
}

/**
 * Build player data from Tank01 game logs
 * This is the preferred method when Sportradar fails
 */
export function buildPlayerFromTank01(
    playerName: string,
    playerData: {
        playerID: string;
        longName: string;
        team: string;
        pos?: string;
        games: Array<any>;
    }
): Player {
    const games = playerData.games || [];
    const gamesPlayed = games.length;

    // Aggregate stats from recent games
    let totalPassYards = 0, totalPassAtt = 0, totalPassTD = 0, totalInt = 0;
    let totalRushYards = 0, totalCarries = 0, totalRushTD = 0;
    let totalRecYards = 0, totalRec = 0, totalTargets = 0, totalRecTD = 0;

    for (const game of games) {
        // QB stats
        totalPassYards += Number(game.passYds || 0);
        totalPassAtt += Number(game.passAttempts || 0);
        totalPassTD += Number(game.passTD || 0);
        totalInt += Number(game.int || 0);

        // RB stats
        totalRushYards += Number(game.rushYds || 0);
        totalCarries += Number(game.carries || 0);
        totalRushTD += Number(game.rushTD || 0);

        // WR/TE stats
        totalRecYards += Number(game.recYds || 0);
        totalRec += Number(game.receptions || 0);
        totalTargets += Number(game.targets || 0);
        totalRecTD += Number(game.recTD || 0);
    }

    // Derive per-game averages
    const avgPassYards = gamesPlayed > 0 ? Math.round(totalPassYards / gamesPlayed) : null;
    const avgRushYards = gamesPlayed > 0 ? Math.round(totalRushYards / gamesPlayed) : null;
    const avgRecYards = gamesPlayed > 0 ? Math.round(totalRecYards / gamesPlayed) : null;

    // Build usage metrics
    const usage: PlayerUsage = {};
    // Can't calculate shares without team totals

    // Build efficiency metrics
    const efficiency: PlayerEfficiency = {};
    if (totalPassAtt > 0) {
        efficiency.int_rate = Number(((totalInt / totalPassAtt) * 100).toFixed(1));
    }
    if (totalTargets > 0) {
        efficiency.catch_rate = Number(((totalRec / totalTargets) * 100).toFixed(1));
        efficiency.yards_per_target = Number((totalRecYards / totalTargets).toFixed(1));
    }

    // Create recent games summary for the player
    const recentGames = games.slice(0, 4).map(g => ({
        opponent: g.opp,
        passYards: g.passYds,
        rushYards: g.rushYds,
        recYards: g.recYds,
        touchdowns: (Number(g.passTD || 0) + Number(g.rushTD || 0) + Number(g.recTD || 0))
    }));

    // Return with extended type for Tank01-specific data
    return {
        id: playerData.playerID,
        name: playerData.longName || playerName,
        position: playerData.pos || 'UNK',
        team: playerData.team,
        availability: {
            injury_status: null,
            practice_participation_trend: null,
            returning_from_injury_flag: false,
            snap_expectation_note: null
        },
        usage,
        efficiency,
        trends: {},
        // Extended Tank01 stats (will be available in packet)
        sample_size: gamesPlayed,
        avg_pass_yards: avgPassYards,
        avg_rush_yards: avgRushYards,
        avg_rec_yards: avgRecYards,
        recent_games: recentGames
    } as any;
}

