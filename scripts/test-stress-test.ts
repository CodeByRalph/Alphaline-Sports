
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { runStressTest } from '../app/lib/stress-test/service';
import { StressTestRequest } from '../app/lib/stress-test/types';

async function main() {
    console.log("Running Stress Test Verification...");

    const request: StressTestRequest = {
        propId: 'Patrick Mahomes-Pass Yards-250-Over',
        snapshotId: 'test-snapshot-' + Date.now(),
        baseConfidence: 85,
        pick: 'Over 250.5 Pass Yards',
        rationale: [
            'Mahomes averages 285 yards vs heavy blitz',
            'Raiders secondary ranked 28th',
            'Kelce is fully healthy',
        ],
        riskFactors: [
            'Rain expected in 2nd half',
            'Chiefs might run if up big'
        ]
    };

    try {
        const result = await runStressTest(request);
        console.log("\n--- STRESS TEST RESULT ---");
        console.log("Recommend:", result.recommendation);
        console.log("Base:", result.baseScore, "-> Post:", result.postScore);
        console.log("Delta:", result.baseScore - result.postScore);
        console.log("\n--- SCRIPT ---");
        console.log("DEFENSE:", result.script.defense.substring(0, 50) + "...");
        console.log("Q1:", result.script.skepticQuestions[0]);
        console.log("REBUTTAL:", result.script.rebuttal.substring(0, 50) + "...");
        console.log("\n--- BREAKDOWN ---");
        console.log(JSON.stringify(result.scoringBreakdown, null, 2));
        console.log("\n--- AUDIO ---");
        console.log(result.audioUrls);

    } catch (e) {
        console.error("Verification Failed:", e);
    }
}

main();
