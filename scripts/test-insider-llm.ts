
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force load .env.local 
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    const { InsiderAgent } = await import('../app/lib/insider-packet/agent');

    console.log("--- Test: Insider Agent (LLM Analysis) ---");


    // Test: Lamar Jackson (Usually Healthy starter)
    // Team: BAL
    const result = await InsiderAgent.analyze('Lamar Jackson', 'BAL');

    if (result && result.analysis) {
        console.log("Analysis Generated Successfully:");
        console.log("Overview:", result.analysis.availability_overview);
        console.log("Brief:", result.analysis.insider_brief);
        console.log("Risk Flags:", result.analysis.risk_flags);
    } else {
        console.error("Analysis Failed or returned null.");
        console.log(JSON.stringify(result, null, 2));
    }
}

run().catch(console.error);
