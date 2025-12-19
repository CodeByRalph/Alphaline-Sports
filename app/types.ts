
import { MeteorologistReport } from './lib/meteorologist-packet/agent';

export type AgentRole = 'scout' | 'insider' | 'meteorologist' | 'bookie';

export interface AgentReport {
    role: AgentRole;
    title: string;
    status: 'idle' | 'working' | 'completed';
    content: string;
    confidence: number;
    dataPoints: string[];
    structuredData?: MeteorologistReport | any;
}
