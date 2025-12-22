
import { InsiderPacket } from './types';
import { getPlayerInjuryStatus, getTeamRoster, buildDepthChartFromRoster, Tank01TeamRoster, getPlayerNews } from '../rapidapi';
import { calculateVolatility, normalizeInjuryStatus } from './volatility';

/**
 * Assemble Insider Packet using Tank01 RapidAPI
 * This version eliminates Sportradar dependency entirely
 */
export async function assembleInsiderPacket(
    playerName: string,
    teamAlias: string,
    existingGameStats?: any
): Promise<InsiderPacket | null> {

    // 1. Get Game Context from shared stats (already fetched in route handler)
    if (!existingGameStats || !existingGameStats.nextGame) {
        console.warn("Insider: No game context provided");
        return null;
    }

    const next = existingGameStats.nextGame;

    // Calculate week from game date (approximate)
    // NFL season starts around Sept 5, each week is ~7 days
    const gameDate = next.gameDate; // YYYYMMDD format
    const gameDateObj = new Date(
        parseInt(gameDate.substring(0, 4)),
        parseInt(gameDate.substring(4, 6)) - 1,
        parseInt(gameDate.substring(6, 8))
    );
    const seasonStart = new Date(2025, 8, 4); // Sept 4, 2025
    const weekNum = Math.ceil((gameDateObj.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

    const gameContext = {
        season: 2025,
        week: Math.max(1, Math.min(18, weekNum)), // Clamp to valid NFL weeks
        game_id: `tank01-${next.gameDate}`,
        team: teamAlias,
        opponent: next.opponent,
        home_away: next.location.toLowerCase().includes('home') ? 'home' as const : 'away' as const,
        kickoff_time: next.gameDate,
        days_rest: 7,
        short_week_flag: false,
        data_freshness_timestamp: new Date().toISOString()
    };

    // 2. Get Player Injury Status from Tank01
    let playerInfo = await getPlayerInjuryStatus(playerName);

    // 3. Get Team Roster for depth chart context
    const roster = await getTeamRoster(teamAlias);
    const depthChart = buildDepthChartFromRoster(roster);

    // 4. Find player in depth chart
    let depthPosition = 1;
    let backupPlayer: Tank01TeamRoster | undefined;
    let playerPos = playerInfo?.pos || 'UNK';

    // Search normalized position groups
    for (const [pos, players] of Object.entries(depthChart)) {
        const playerIndex = players.findIndex(p =>
            p.longName.toLowerCase().includes(playerName.toLowerCase()) ||
            playerName.toLowerCase().includes(p.longName.split(' ')[1]?.toLowerCase() || '')
        );
        if (playerIndex !== -1) {
            depthPosition = playerIndex + 1;
            playerPos = pos;
            backupPlayer = players[playerIndex + 1];
            break;
        }
    }

    // 5. Build availability data
    const injuryDesignation = playerInfo?.injury?.designation || 'Healthy';
    // Map Tank01 designation to our enum
    const normalizedDesignation: 'IR' | 'PUP' | 'NFI' | 'none' =
        injuryDesignation === 'IR' ? 'IR' :
            injuryDesignation === 'PUP' ? 'PUP' :
                injuryDesignation === 'NFI' ? 'NFI' : 'none';

    const availability = {
        player_id: playerInfo?.playerID || 'unknown',
        name: playerName,
        position: playerPos,
        team: teamAlias,
        injury_status: normalizeInjuryStatus(injuryDesignation),
        injury_designation: normalizedDesignation,
        injury_body_part: playerInfo?.injury?.injuryArea,
        injury_severity: playerInfo?.injury ? 'moderate' as const : 'unknown' as const,
        practice_participation: {} as Record<string, 'DNP' | 'LP' | 'FP'>,
        injury_trend: 'unchanged' as const,
        returning_from_injury_flag: false,
        snap_limit_expectation: (injuryDesignation === 'Questionable' ? 'unknown' : 'no') as 'yes' | 'no' | 'unknown',
        game_time_decision_flag: injuryDesignation === 'Questionable' || injuryDesignation === 'Doubtful'
    };

    // 6. Build depth context
    const depthContext = {
        depth_chart_position: depthPosition,
        direct_backup_player_id: backupPlayer?.playerID,
        backup_experience_flag: false,
        committee_risk_flag: depthPosition > 1 && playerPos === 'RB',
        positional_thinness_flag: false,
        emergency_elevation_flag: false
    };

    // 7. Check for team-wide injury concerns (O-Line, key defenders)
    const olPositions = ['OT', 'OG', 'C', 'LT', 'RT', 'LG', 'RG'];
    const olInjuries = roster.filter(p =>
        olPositions.includes(p.pos) &&
        p.injury?.designation &&
        p.injury.designation !== 'Healthy'
    );

    // 8. Compute Volatility
    const volatility = calculateVolatility(availability, depthContext);

    // 9. Build Final Packet
    const packet: InsiderPacket = {
        game_context: gameContext,
        player_availability: availability,
        depth_chart: depthContext,
        recent_usage: {
            snap_share_proxy: null,
            route_participation_proxy: null,
            carry_share: null,
            target_share: null,
            red_zone_usage: null,
            goal_line_usage: null,
            two_minute_usage: null,
            last3_vs_season_usage_delta: 0,
            role_expansion_flag: false,
            role_contraction_flag: false
        },
        offensive_line: {
            starting_ol_expected: 5 - olInjuries.length,
            ol_injuries: olInjuries.map(p => `${p.longName} (${p.injury?.designation || 'Unknown'})`),
            ol_replacements: [],
            ol_continuity_score: olInjuries.length === 0 ? 1.0 : Math.max(0.5, 1 - (olInjuries.length * 0.15)),
            protection_downgrade_flag: olInjuries.length >= 2,
            run_blocking_downgrade_flag: olInjuries.length >= 2
        },
        defensive_line: {
            cb1_status: 'Unknown',
            cb1_replacement_quality: 'N/A',
            edge_rusher_status: 'Unknown',
            interior_dl_status: 'Unknown',
            lb_run_def_status: 'Unknown',
            safety_deep_role_status: 'Unknown'
        },
        coaching: {
            head_coach: 'Unknown',
            offensive_coordinator: 'Unknown',
            defensive_coordinator: 'Unknown',
            recent_playcaller_change_flag: false,
            recent_scheme_change_notes: 'None'
        },
        volatility,
        data_quality: {
            missing_fields: [],
            stale_data_flags: [],
            conflicting_reports_flag: false,
            last_updated_by_source: 'Tank01 RapidAPI'
        }
    };

    // 8. Fetch and add recent news about the player
    try {
        const news = await getPlayerNews(playerName);
        if (news.length > 0) {
            (packet as any).recent_news = news.map(n => n.title);
            console.log(`[Insider] Added ${news.length} news headlines for ${playerName}`);
        }
    } catch (e) {
        console.warn('[Insider] Failed to fetch player news:', e);
    }

    return packet;
}
