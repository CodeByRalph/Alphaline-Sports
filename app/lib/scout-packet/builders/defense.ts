import { TeamDefense } from '../types';
import { extractStat, safeNumber, safePct } from '../normalizer';

export function buildTeamDefense(seasonStats: any): TeamDefense {
    // In Sportradar, the 'opponents' key represents aggregate stats allowed.

    const sacks = extractStat(seasonStats, 'opponents.defense.sacks');

    const oppPassAtt = extractStat(seasonStats, 'opponents.passing.attempts');
    const oppPassYds = extractStat(seasonStats, 'opponents.passing.yards');
    const yards_per_dropback_allowed = safePct(oppPassYds, oppPassAtt);

    const oppRushAtt = extractStat(seasonStats, 'opponents.rushing.attempts');
    const oppRushYds = extractStat(seasonStats, 'opponents.rushing.yards');
    const yards_per_carry_allowed = safePct(oppRushYds, oppRushAtt);

    const oppPassLong = extractStat(seasonStats, 'opponents.passing.longest') || 0;
    const explosive_pass_rate_20plus_allowed = oppPassLong >= 20 ? 1 : 0;

    const oppRushLong = extractStat(seasonStats, 'opponents.rushing.longest') || 0;
    const explosive_run_rate_10plus_allowed = oppRushLong >= 10 ? 1 : 0;

    const opp3rdAtt = extractStat(seasonStats, 'opponents.efficiency.thirddown.attempts');
    const opp3rdSucc = extractStat(seasonStats, 'opponents.efficiency.thirddown.successes');
    const third_down_conv_rate_allowed = safePct(opp3rdSucc, opp3rdAtt);

    const oppRzAtt = extractStat(seasonStats, 'opponents.efficiency.redzone.attempts');
    const oppRzSucc = extractStat(seasonStats, 'opponents.efficiency.redzone.successes');
    const red_zone_td_rate_allowed = safePct(oppRzSucc, oppRzAtt);

    const oppGtgAtt = extractStat(seasonStats, 'opponents.efficiency.goaltogo.attempts');
    const oppGtgSucc = extractStat(seasonStats, 'opponents.efficiency.goaltogo.successes');
    const goal_to_go_td_rate_allowed = safePct(oppGtgSucc, oppGtgAtt);

    // TeamDefense is mapped from simplified TeamOffense + explicit defense keys
    return {
        // Mapped from TeamOffense (${K}_allowed)
        yards_per_dropback_allowed,
        explosive_pass_rate_20plus_allowed,
        team_adot_allowed: safePct(oppPassYds, extractStat(seasonStats, 'opponents.passing.completions')),
        sack_rate_allowed_allowed: safePct(sacks, oppPassAtt),

        yards_per_carry_allowed,
        explosive_run_rate_10plus_allowed,

        third_down_conv_rate_allowed,
        red_zone_td_rate_allowed,
        goal_to_go_td_rate_allowed,

        // Explicit Defense Keys
        sack_rate: safePct(sacks, oppPassAtt)
    };
}
