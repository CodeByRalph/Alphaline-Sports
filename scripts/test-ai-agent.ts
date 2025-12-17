
import { ScoutPacketAssembler } from '../app/lib/scout-packet/assembler';
import { ScoutAgent } from '../app/lib/ai/scout';

async function main() {
    console.log('--- Testing AI Integration ---');

    // 1. Generate Packet
    console.log('Generating packet for Dak Prescott...');
    const packet = await ScoutPacketAssembler.create({
        playerName: 'Dak Prescott',
        propLine: { value: 245.5, type: 'pass_yards' },
        season: 2025,
        week: 15
    });

    console.log('Packet generated. Sending to Scout Agent...');
    console.time('AI Analysis');

    // 2. Analyze with AI
    const analysis = await ScoutAgent.analyze(packet);

    console.timeEnd('AI Analysis');
    console.log('\n--- Scout Analysis Result ---');
    console.log(JSON.stringify(analysis, null, 2));
}

main();
