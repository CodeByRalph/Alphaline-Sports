
import { MatchupReality, TeamOffense, TeamDefense } from '../types';

export function buildMatchupReality(
    teamOffense: TeamOffense,
    oppDefense: TeamDefense
): MatchupReality {

    // Example Logic: Pass Funnel check
    // If Team Offense allows pressure but Opp Defense has low pressure rate?
    // Or: Opponent allows high Pass Success Rate?
    // Conservative logic: ONLY if we have data.

    let pass_funnel_flag: boolean | null = null;

    if (oppDefense.yards_per_dropback_allowed !== null && oppDefense.yards_per_carry_allowed !== null) {
        // Very crude funnel logic: if they allow > 7.5 YPA but < 3.5 YPC
        if (oppDefense.yards_per_dropback_allowed > 7.5 && oppDefense.yards_per_carry_allowed < 3.8) {
            pass_funnel_flag = true;
        } else {
            pass_funnel_flag = false;
        }
    }

    return {
        pass_funnel_flag
    };
}
