
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force load .env.local 
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    // Dynamic import to ensure config loads first
    const { analyzeMeteorology } = await import('../app/lib/meteorologist-packet/agent');

    console.log("--- Test: OpenAI Integration (Requires Valid API Key) ---");
    // Test with Outdoor player to force interesting weather analysis if possible, 
    // or fallback to Dome to ensure "Perfect Conditions" analysis works.

    // Patrick Mahomes is playing Outdoors in our previous mock (Nissan Stadium, Rain)
    const result = await analyzeMeteorology('Patrick Mahomes');

    if (result && result.analysis) {
        console.log("Analysis Generated Successfully:");
        console.log("Writeup:", result.analysis.user_weather_writeup);
        console.log("Scores:", result.analysis.impact_scores);
        console.log("Confidence:", result.analysis.overall_confidence);
        console.log("Data Quality:", result.analysis.data_quality);
    } else {
        console.error("Analysis Failed or returned null.");
        console.log(JSON.stringify(result, null, 2));
    }
}

run().catch(console.error);
