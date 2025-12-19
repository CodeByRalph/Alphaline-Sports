
import { PlayerAvailability, DepthChartContext, RoleVolatility } from './types';

/**
 * Calculates a volatility score (0.0 - 1.0) based on availability and role.
 */
export function calculateVolatility(
    availability: PlayerAvailability,
    depth: DepthChartContext
): RoleVolatility {
    let snapVol = 0.1; // Baseline risk
    let usageVol = 0.1;
    let trustUncertainty = false;
    let roleStability = true;

    // 1. Injury Impact
    if (availability.injury_status !== 'healthy') {
        trustUncertainty = true;
        snapVol += 0.3;
        roleStability = false;

        if (availability.injury_status === 'doubtful' || availability.injury_status === 'questionable') {
            snapVol += 0.4; // High risk of 0 snaps or early exit
        }
    }

    if (availability.game_time_decision_flag) {
        snapVol = 0.9; // Max volatility
        trustUncertainty = true;
    }

    // 2. Depth Chart Impact
    if (depth.depth_chart_position > 1) {
        // Backup players have naturally higher volatility in usage
        usageVol += 0.3;
        roleStability = false;
    }

    if (depth.committee_risk_flag) {
        usageVol += 0.2;
        snapVol += 0.1;
    }

    // Clamp scores
    return {
        snap_volatility_score: Math.min(1.0, snapVol),
        usage_volatility_score: Math.min(1.0, usageVol),
        role_stability_flag: roleStability,
        committee_risk_flag: depth.committee_risk_flag,
        trust_uncertainty_flag: trustUncertainty
    };
}

export function normalizeInjuryStatus(status: string): PlayerAvailability['injury_status'] {
    const s = status.toLowerCase();
    if (s.includes('out')) return 'out';
    if (s.includes('doubt')) return 'doubtful';
    if (s.includes('quest')) return 'questionable';
    if (s.includes('prob')) return 'probable';
    return 'healthy';
}
