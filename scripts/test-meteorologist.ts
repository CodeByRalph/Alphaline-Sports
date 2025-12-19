
import * as dotenv from 'dotenv';
import * as path from 'path';

async function run() {
    // 1. Setup Env (Force load .env.local)
    // imports are hoisted, so we must config BEFORE importing modules that use env vars.
    // In ESM/TS, static imports run before this code. So we must use dynamic import inside run().
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

    // 2. Import Modules dynamically
    const { analyzeMeteorology } = await import('../app/lib/meteorologist-packet/agent');

    // 3. Test 1: Jared Goff (DET) playing Outdoors
    console.log("--- Test 1: Jared Goff (DET) playing Outdoors ---");
    const result1 = await analyzeMeteorology('Jared Goff');
    console.log(JSON.stringify(result1, null, 2));

    // 4. Test 2: Patrick Mahomes (KC) playing... anywhere?
    console.log("\n--- Test 2: Patrick Mahomes (KC) playing... anywhere? ---");
    const result2 = await analyzeMeteorology('Patrick Mahomes');
    console.log(JSON.stringify(result2, null, 2));
}

run().catch(console.error);

