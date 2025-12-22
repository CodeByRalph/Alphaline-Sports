
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Dynamic import for the Master Agent to ensure env vars confirm first
const loadAgent = async () => (await import('../app/lib/master-packet/agent')).runMasterAgent;

import { BetContext } from '../app/types';
import { ScoutPacket } from '../app/lib/scout-packet/types';
import { InsiderAnalysis } from '../app/lib/insider-packet/openai-service';
import { MeteorologistReport } from '../app/lib/meteorologist-packet/agent';

// --- MOCK BUILDERS ---
function mockScout(name: string, projectedUsage: 'High' | 'Medium' | 'Low', matchup: 'Good' | 'Bad'): ScoutPacket {
    return {
        players: [{
            name,
            usage: {
                carry_share: projectedUsage === 'High' ? 0.75 : projectedUsage === 'Medium' ? 0.50 : 0.30,
                target_share: projectedUsage === 'High' ? 0.28 : projectedUsage === 'Medium' ? 0.18 : 0.10,
            },
            efficiency: { yards_per_carry: 4.5 },
        }],
        matchup_reality: { pass_funnel_flag: matchup === 'Good' } // Simplified
    } as unknown as ScoutPacket;
}

function mockInsider(status: 'Healthy' | 'Injured' | 'Decoy', risk: 'Low' | 'High'): InsiderAnalysis {
    return {
        availability_overview: { overall_availability_grade: risk === 'High' ? 'Risk' : 'Good' },
        key_player_statuses: [{
            name: "Player",
            availability_status: status === 'Healthy' ? 'full' : 'limited',
            risk_flag: risk
        }],
        risk_flags: { snap_limit_risk: status === 'Decoy' },
        confidence_adjustment: { adjustment: risk === 'High' ? 'reduce_significantly' : 'none' }
    } as unknown as InsiderAnalysis;
}

function mockWeather(condition: 'Nice' | 'Windy' | 'Snow'): MeteorologistReport {
    return {
        environment: {
            weather_summary: condition,
            details: condition === 'Windy' ? "25mph gusts" : "Clear"
        }
    } as unknown as MeteorologistReport;
}

async function runCalibration() {
    const runAgent = await loadAgent();
    console.log("=== THE TRUST CALIBRATION BENCH ===\n");

    const benchmarks = [
        {
            name: "Tests: THE SMASH SPOT",
            desc: "Star RB, Healthy, Bad Defense. Should be HIGH Confidence OVER.",
            bet: { playerName: "Star RB", propType: "Rushing Yards", propLine: 80.5, propSide: "Over" } as BetContext,
            scout: mockScout("Star RB", "High", "Good"),
            insider: mockInsider("Healthy", "Low"),
            weather: mockWeather("Nice"),
            expect: "Over > 0.80"
        },
        {
            name: "Tests: THE DECOY TRAP",
            desc: "Star WR, 'Active' but High Risk Insider Flag. Should be UNDER or NO EDGE.",
            bet: { playerName: "Injured WR", propType: "Receiving Yards", propLine: 65.5, propSide: "Over" } as BetContext,
            scout: mockScout("Injured WR", "High", "Good"), // Scout sees usage history
            insider: mockInsider("Decoy", "High"), // Insider knows he's hurt
            weather: mockWeather("Nice"),
            expect: "No Edge / Under (< 0.50 Conf)"
        },
        {
            name: "Tests: THE WIND GAME",
            desc: "Deep threat WR in 25mph wind. Should be UNDER or Downgraded.",
            bet: { playerName: "Fast WR", propType: "Receiving Yards", propLine: 55.5, propSide: "Over" } as BetContext,
            scout: mockScout("Fast WR", "Medium", "Good"),
            insider: mockInsider("Healthy", "Low"),
            weather: mockWeather("Windy"),
            expect: "Under"
        }
    ];

    for (const test of benchmarks) {
        console.log(`\n🔎 RUNNING: ${test.name}`);
        console.log(`   Context: ${test.desc}`);
        const result = await runAgent(test.bet, test.scout, test.insider, test.weather);

        console.log(`   🤖 RESULT: ${result.analysis.projection} (Conf: ${result.analysis.confidence_score})`);
        console.log(`   📝 REASON: ${result.confidence_explanation.substring(0, 100)}...`);

        // Simple assertion log (visual)
        console.log(`   Expected: ${test.expect} | Actual: ${result.analysis.projection}`);
    }
}

runCalibration();
