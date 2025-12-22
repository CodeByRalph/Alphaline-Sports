
import { MeteorologistReport } from './lib/meteorologist-packet/agent';
export type { ScoutPacket } from './lib/scout-packet/types';

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

export interface BetContext {
    playerName: string;
    propType: string; // e.g. "Passing Yards", "Anytime TD"
    propLine: number;
    propSide: 'Over' | 'Under';
}

export interface MasterPacket {
    analysis: {
        projection: 'Above Line' | 'Below Line' | 'Inconclusive';
        confidence_score: number; // 0.00 - 1.00
    };
    analysis_summary: string[];
    data_sources: {
        historical_data: 'supports_above' | 'neutral' | 'supports_below';
        availability_data: 'favorable' | 'neutral' | 'limiting';
        environmental_data: 'favorable' | 'neutral' | 'limiting';
    };
    key_factors: string[];
    data_limitations: string[];
    confidence_explanation: string;
}

