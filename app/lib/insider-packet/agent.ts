
import { assembleInsiderPacket } from './assembler';
import { generateInsiderAnalysis, InsiderAnalysis } from './openai-service';
import { InsiderPacket } from './types';

export interface InsiderReport {
    packet: InsiderPacket;
    analysis: InsiderAnalysis | null;
}

export const InsiderAgent = {
    analyze: async (playerName: string, teamAlias: string, context?: any): Promise<InsiderReport | null> => {
        // 1. Build the Packet (Data)
        const packet = await assembleInsiderPacket(playerName, teamAlias, context);

        if (!packet) {
            console.error("Insider Agent: Failed to assemble packet.");
            return null;
        }

        // 2. Generate Analysis (Intelligence)
        const analysis = await generateInsiderAnalysis(packet);

        return {
            packet,
            analysis
        };
    }
};
