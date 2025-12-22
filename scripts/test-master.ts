
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Types can be imported statically as they are erased at runtime
import { BetContext } from '../app/types';
import { ScoutPacket } from '../app/lib/scout-packet/types';
import { InsiderAnalysis } from '../app/lib/insider-packet/openai-service';
import { MeteorologistReport } from '../app/lib/meteorologist-packet/agent';

async function main() {
    // Dynamic import to ensure env vars are loaded first
    const { runMasterAgent } = await import('../app/lib/master-packet/agent');

    console.log("=== Testing Master Agent (The Bookie) ===\n");

    // --- CASE 1: The Perfect Storm (All Agree -> Over) ---
    console.log("--- CASE 1: Perfect Alignment (Over) ---");
    const bet1: BetContext = {
        playerName: "Kyren Williams",
        propType: "Rushing Yards",
        propLine: 85.5,
        propSide: "Over"
    };

    // Low effort mocks - just enough structure for the LLM to read
    const scout1 = {
        players: [{
            name: "Kyren Williams",
            usage: { carry_share: 0.85 },
            efficiency: { yards_per_carry: 5.2 },
            trends: { role_change_flags: [] }
        }],
        team_identity_tendencies: { offensive_identity: 'run', pace_plays_per_game: 68 },
        matchup_reality: { pass_funnel_flag: false }
    } as unknown as ScoutPacket;

    const insider1 = {
        availability_overview: { overall_availability_grade: 'Good', qb_status: 'full', offensive_line_status: 'stable' },
        key_player_statuses: [{ name: "Kyren Williams", availability_status: 'full', risk_flag: 'Low' }],
        risk_flags: { snap_limit_risk: false, committee_usage_risk: false },
        confidence_adjustment: { adjustment: 'none' }
    } as unknown as InsiderAnalysis;

    const weather1 = {
        environment: { weather_summary: "72°F, Dome", details: " Perfect conditions" }
    } as unknown as MeteorologistReport;

    const result1 = await runMasterAgent(bet1, scout1, insider1, weather1);
    console.log(JSON.stringify(result1, null, 2));


    // --- CASE 2: The Logic Trap (Scout says Yes, Insider says Risk -> Master should say No Edge/Under) ---
    console.log("\n--- CASE 2: The Trap (Scout Loves it, Insider Flags Injury) ---");
    const bet2: BetContext = {
        playerName: "Puka Nacua",
        propType: "Receiving Yards",
        propLine: 70.5,
        propSide: "Over"
    };

    const scout2 = {
        players: [{
            name: "Puka Nacua",
            usage: { target_share: 0.30, air_yards_share: 0.40 }, // Scout loves him
            efficiency: { yards_per_target: 10.5 },
            trends: { role_change_flags: [] }
        }],
        matchup_reality: { pass_funnel_flag: true } // Secondary is weak
    } as unknown as ScoutPacket;

    const insider2 = {
        availability_overview: { overall_availability_grade: 'Risk' },
        key_player_statuses: [{
            name: "Puka Nacua",
            availability_status: 'limited',
            risk_flag: 'High',
            primary_limitation: 'Knee Aggravation'
        }],
        risk_flags: { snap_limit_risk: true, committee_usage_risk: false, late_injury_uncertainty: true },
        confidence_adjustment: { adjustment: 'reduce_significantly', reason_codes: ['INJURY_FLARE_UP'] }
    } as unknown as InsiderAnalysis;

    const weather2 = weather1; // Weather is fine

    const result2 = await runMasterAgent(bet2, scout2, insider2, weather2);
    console.log(JSON.stringify(result2, null, 2));
}

main().catch(console.error);
