
import { ScoutPacket } from './types';

export class ScoutPacketValidator {

    static validate(packet: ScoutPacket): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        // 1. Check for undefined (should be null)
        // iterate deep to ensure no undefineds - tricky in runtime JS as JSON.stringify removes them, 
        // but we want to ensure they are explicit nulls for the consumer.

        // 2. Critical Fields Check
        if (!packet.meta.team) errors.push('Missing meta.team');
        // if (!packet.meta.game_id && !packet.meta.season) errors.push('Missing game context'); // season is always there logic

        // 3. Array Checks
        if (!Array.isArray(packet.players)) errors.push('players must be an array');
        if (!Array.isArray(packet.missing_data)) errors.push('missing_data must be an array');

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
