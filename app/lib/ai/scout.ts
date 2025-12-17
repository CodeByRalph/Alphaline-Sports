import { openai, MODEL } from './client';
import { SCOUT_SYSTEM_PROMPT } from './prompts';
import { ScoutPacket } from '../scout-packet/types';

export interface ScoutAnalysis {
    verdict: 'OVER' | 'UNDER' | 'PASS';
    confidence: number;
    analysis: string;
    key_factors: string[];
}

export class ScoutAgent {
    static async analyze(packet: ScoutPacket): Promise<ScoutAnalysis> {
        try {
            const completion = await openai.chat.completions.create({
                model: MODEL,
                messages: [
                    { role: 'system', content: SCOUT_SYSTEM_PROMPT },
                    { role: 'user', content: JSON.stringify(packet) }
                ],
                response_format: { type: 'json_object' }
            });

            console.log(`[OpenAI Response] Model: ${completion.model}, Usage: ${JSON.stringify(completion.usage)}`);

            const content = completion.choices[0].message.content;
            if (!content) throw new Error('No content from OpenAI');

            const result = JSON.parse(content) as ScoutAnalysis;
            return result;

        } catch (error) {
            console.error('Error in Scout Agent analysis:', error);
            // Fallback response
            return {
                verdict: 'PASS',
                confidence: 0,
                analysis: 'Failed to generate analysis due to technical error.',
                key_factors: ['System Error']
            };
        }
    }
}
