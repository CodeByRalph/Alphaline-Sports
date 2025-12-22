
import { MasterPacket, BetContext } from '../../types';
import { ScoutPacket } from '../scout-packet/types';
import { InsiderAnalysis } from '../insider-packet/openai-service';
import { MeteorologistReport } from '../meteorologist-packet/agent';
import { generateMasterDecision } from './openai-service';

/**
 * The Master Agent (Bookie) - Final Decision Layer
 * 
 * Synthesizes data from Scout, Insider, and Meteorologist.
 * Produces a final betting recommendation and strict confidence score.
 */
export async function runMasterAgent(
    bet: BetContext,
    scout: ScoutPacket | null,
    insider: InsiderAnalysis | null,
    weather: MeteorologistReport | null
): Promise<MasterPacket> {

    // 1. Initial Logic Checks (Fail Fast)
    if (!scout && !insider) {
        // If we have literally nothing, we can't make a decision.
        return createFallbackPacket("Inconclusive", 0.0, "Critical Data Missing: Neither Scout nor Insider provided data.");
    }

    // 2. Pre-calculate edge signals to help LLM make calibrated decisions
    let edgeSignals: any = null;
    const scoutData = (scout as any)?.tank01_player_analysis;
    if (scoutData && bet.propLine) {
        const line = bet.propLine;
        const avgPassYards = scoutData.per_game_averages?.pass_yards || 0;
        const recentGames = scoutData.recent_games || [];

        // Calculate hit rate
        let hitsOver = 0;
        for (const game of recentGames) {
            const passYds = Number(game.pass_yards) || 0;
            if (passYds > line) hitsOver++;
        }
        const hitRate = recentGames.length > 0 ? hitsOver / recentGames.length : 0;

        // Calculate average vs line
        const avgVsLine = avgPassYards > 0 ? ((avgPassYards - line) / line * 100).toFixed(1) : 0;

        edgeSignals = {
            prop_line: line,
            player_average: avgPassYards,
            average_vs_line_pct: `${avgVsLine}%`,
            hit_rate_over: `${hitsOver}/${recentGames.length} (${(hitRate * 100).toFixed(0)}%)`,
            volume_floor: scoutData.volume_analysis?.floor,
            volume_ceiling: scoutData.volume_analysis?.ceiling,
            trend_direction: scoutData.trend_analysis?.trend_direction,
            opponent_defense: scoutData.opponent_matchup?.pass_defense_quality,
            suggested_confidence_floor: hitRate >= 0.6 ? 60 : hitRate >= 0.4 ? 45 : 30
        };

        console.log(`[MasterAgent] Edge signals: ${JSON.stringify(edgeSignals)}`);
    }

    // 3. Call OpenAI for Synthesis (now with edge signals)
    const decision = await generateMasterDecision(bet, scout, insider, weather, edgeSignals);

    if (decision) {
        // [NEW] Log to Ledger for Trust Tracking
        // specific dynamic import to avoid circular dep issues in some envs
        const { logPrediction } = await import('../ledger/service');
        await logPrediction(bet, decision);

        return decision;
    }

    // 3. Fallback if OpenAI Fails
    return createFallbackPacket("Inconclusive", 0.0, "System Error: Analysis engine failed to generate projection.");
}

function createFallbackPacket(
    projection: 'Above Line' | 'Below Line' | 'Inconclusive',
    confidence: number,
    reason: string
): MasterPacket {
    return {
        analysis: {
            projection,
            confidence_score: confidence
        },
        analysis_summary: [
            "Automated System Response",
            reason
        ],
        data_sources: {
            historical_data: "neutral",
            availability_data: "neutral",
            environmental_data: "neutral"
        },
        key_factors: [reason],
        data_limitations: ["Unable to complete full analysis."],
        confidence_explanation: "Insufficient data for projection."
    };
}
