
import { ScoutPacketAssembler } from '../app/lib/scout-packet/assembler';
import { ScoutPacketValidator } from '../app/lib/scout-packet/validator';

async function main() {
    console.log('Running Scout Packet Verification...');

    // Test Case: Dak Prescott with pass yards prop
    const options = {
        playerName: 'Dak Prescott',
        propLine: { value: 250, type: 'pass_yards' as const },
        season: 2025,
        week: 15
    };

    try {
        console.time('Assembler');
        const packet = await ScoutPacketAssembler.create(options);
        console.timeEnd('Assembler');

        console.log('--- Packet Generated ---');
        console.log(`Team: ${packet.meta.team} vs ${packet.meta.opponent}`);
        console.log(`Offensive Identity: ${packet.team_identity_tendencies.offensive_identity}`);
        console.log(`Players Found: ${packet.players.length}`);

        const validation = ScoutPacketValidator.validate(packet);
        console.log('--- Validation ---');
        console.log(`Valid: ${validation.valid}`);
        if (!validation.valid) {
            console.error('Errors:', validation.errors);
        }

        if (packet.missing_data.length > 0) {
            console.log('--- Missing Data ---');
            console.log(packet.missing_data.slice(0, 20));
            console.log(`Total Count: ${packet.missing_data.length}`);
        }

        // Output full packet JSON
        console.log('--- Full Packet JSON ---');
        console.log(JSON.stringify(packet, null, 2));

    } catch (error) {
        console.error('Verification Failed:', error);
    }
}

main();
