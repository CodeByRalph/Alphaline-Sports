import { TeamOffense } from '../types';
import { extractStat, safeNumber, safePct } from '../normalizer';

export function buildTeamOffense(seasonStats: any): TeamOffense {
    // Sportradar Season Stats v7 Structure:
    // teamStats -> record -> { passing, rushing, ... }

    const gamesPlayed = extractStat(seasonStats, 'record.games_played') || 1;

    // --- Passing ---
    const passAtt = extractStat(seasonStats, 'record.passing.attempts');
    const passComp = extractStat(seasonStats, 'record.passing.completions');
    const passYds = extractStat(seasonStats, 'record.passing.yards');
    const passTds = extractStat(seasonStats, 'record.passing.touchdowns');
    const sacks = extractStat(seasonStats, 'record.passing.sacks');
    const passLong = extractStat(seasonStats, 'record.passing.longest') || 0;

    // Computed
    const yards_per_dropback = safePct(passYds, passAtt);

    // Proxy for explosive pass rate: use yards per attempt > 12 as "efficient" indicator
    // Or check if longest pass > 20 as a flag
    const explosive_pass_rate_20plus = passLong >= 20 ? 1 : 0; // Binary flag if any 20+ play exists

    // Team ADOT proxy: yards / completions (not true ADOT but close)
    const team_adot = safePct(passYds, passComp);

    // --- Rushing ---
    const rushAtt = extractStat(seasonStats, 'record.rushing.attempts');
    const rushYds = extractStat(seasonStats, 'record.rushing.yards');
    const yards_per_carry = safePct(rushYds, rushAtt);
    const rushLong = extractStat(seasonStats, 'record.rushing.longest') || 0;

    const explosive_run_rate_10plus = rushLong >= 10 ? 1 : 0; // Binary flag

    // --- Situational ---
    const thirdDownAtt = extractStat(seasonStats, 'record.efficiency.thirddown.attempts');
    const thirdDownConv = extractStat(seasonStats, 'record.efficiency.thirddown.successes');
    const third_down_conv_rate = safePct(thirdDownConv, thirdDownAtt);

    const rzAtt = extractStat(seasonStats, 'record.efficiency.redzone.attempts');
    const rzSuccess = extractStat(seasonStats, 'record.efficiency.redzone.successes');
    const red_zone_td_rate = safePct(rzSuccess, rzAtt);

    const gtgAtt = extractStat(seasonStats, 'record.efficiency.goaltogo.attempts');
    const gtgSuccess = extractStat(seasonStats, 'record.efficiency.goaltogo.successes');
    const goal_to_go_td_rate = safePct(gtgSuccess, gtgAtt);

    return {
        yards_per_dropback,
        explosive_pass_rate_20plus,
        team_adot,
        sack_rate_allowed: safePct(sacks, passAtt),

        yards_per_carry,
        explosive_run_rate_10plus,

        third_down_conv_rate,
        red_zone_td_rate,
        goal_to_go_td_rate
    };
}
