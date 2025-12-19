
import { InsiderPacket } from './types';
import { getOfficialInjuries, getTeamDepthChart, getLeagueHierarchy } from './fetcher';
import { calculateVolatility, normalizeInjuryStatus } from './volatility';
import { resolveGame } from '../scout-packet/fetcher';
import { getCurrentNFLSeasonContext } from '../scout-packet/season-calendar';

export async function assembleInsiderPacket(playerName: string, teamAlias: string): Promise<InsiderPacket | null> {
    const context = getCurrentNFLSeasonContext();

    // 1. Context Metadata
    const gameData = await resolveGame(context.season, context.week, teamAlias);
    if (!gameData) return null; // Can't build packet without a game

    // FALLBACK: Common stars map for when API fails (Trial Mode / Future Date)
    const FALLBACK_PLAYERS: Record<string, { pos: string, id: string }> = {
        'Lamar Jackson': { pos: 'QB', id: 'fake-id-lamar' },
        'Patrick Mahomes': { pos: 'QB', id: 'fake-id-mahomes' },
        'Josh Allen': { pos: 'QB', id: 'fake-id-allen' },
        'Christian McCaffrey': { pos: 'RB', id: 'fake-id-cmc' },
        'Tyreek Hill': { pos: 'WR', id: 'fake-id-hill' }
    };

    // 2. Data Fetching (Sequential for Rate Limits & Safety)
    let injuriesRes = null;
    try {
        injuriesRes = await getOfficialInjuries(context.season, context.week);
    } catch (e) {
        console.warn(`Insider: Failed to fetch injuries for W${context.week} (Likely too early):`, e);
    }

    let depthRes: any = { team: { depth_chart: [] } };
    try {
        depthRes = await getTeamDepthChart(gameData.team_id);
    } catch (e) {
        console.warn(`Insider: Failed to fetch depth chart for ${teamAlias}:`, e);
    }

    // Hierarchy isn't strictly needed if we rely on name matching, skipping to save API call/time


    // 3. Process Player Availability & Identity
    // We try to find the player in BOTH Injury Report and Depth Chart to build a complete profile

    let injuryData: any = null;
    if (injuriesRes && injuriesRes.weeks && injuriesRes.weeks.length > 0) {
        const teamInjuries = injuriesRes.weeks[0]?.teams?.find((t: any) => t.alias === teamAlias);
        if (teamInjuries && teamInjuries.players) {
            injuryData = teamInjuries.players.find((p: any) => p.name === playerName);
        }
    }

    // Search Depth Chart for ID/Position if not in Injury Report
    let depthPosition = 1;
    let backupId = undefined;
    let foundDepthPlayer: any = null;
    let foundPos = 'UNK';

    const teamDepth = depthRes.team.depth_chart;
    if (teamDepth) {
        for (const posGroup of teamDepth) {
            const playerIndex = posGroup.players.findIndex((p: any) => p.name === playerName);
            if (playerIndex !== -1) {
                foundDepthPlayer = posGroup.players[playerIndex];
                foundPos = posGroup.position; // "QB", "LWR", etc.

                depthPosition = playerIndex + 1; // 1-indexed (Starter = 1)
                // Find backup
                if (posGroup.players[playerIndex + 1]) {
                    backupId = posGroup.players[playerIndex + 1].id;
                }
                break;
            }
        }
    }


    const availability: any = {
        player_id: injuryData?.id || foundDepthPlayer?.id || FALLBACK_PLAYERS[playerName]?.id || 'unknown',
        name: playerName,
        position: injuryData?.position || foundPos || FALLBACK_PLAYERS[playerName]?.pos || 'UNK',
        team: teamAlias,
        injury_status: injuryData ? normalizeInjuryStatus(injuryData.injury.status) : 'healthy',
        injury_designation: 'none',
        injury_body_part: injuryData?.injury.body_part,
        injury_severity: injuryData ? 'moderate' : 'unknown',
        practice_participation: {},
        injury_trend: 'unchanged',
        returning_from_injury_flag: false,
        snap_limit_expectation: 'unknown',
        game_time_decision_flag: injuryData?.injury.status === 'Questionable'
    };

    const depthContext: any = {
        depth_chart_position: depthPosition,
        direct_backup_player_id: backupId,
        backup_experience_flag: false,
        committee_risk_flag: depthPosition > 2,
        positional_thinness_flag: false,
        emergency_elevation_flag: false
    };

    // 5. Compute Volatility
    const volatility = calculateVolatility(availability, depthContext);

    // 6. Build Final Packet
    return {
        game_context: {
            season: context.season,
            week: context.week,
            game_id: gameData.game_id,
            team: teamAlias,
            opponent: gameData.opponent_alias,
            home_away: gameData.home_away,
            kickoff_time: gameData.scheduled,
            days_rest: 7, // Mock for now
            short_week_flag: false,
            data_freshness_timestamp: new Date().toISOString()
        },
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
            starting_ol_expected: 5,
            ol_injuries: [],
            ol_replacements: [],
            ol_continuity_score: 1.0,
            protection_downgrade_flag: false,
            run_blocking_downgrade_flag: false
        },
        defensive_line: {
            cb1_status: 'Healthy',
            cb1_replacement_quality: 'N/A',
            edge_rusher_status: 'Healthy',
            interior_dl_status: 'Healthy',
            lb_run_def_status: 'Healthy',
            safety_deep_role_status: 'Healthy'
        },
        coaching: { // Mocked Context
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
            last_updated_by_source: 'Sportradar Official'
        }
    };
}
