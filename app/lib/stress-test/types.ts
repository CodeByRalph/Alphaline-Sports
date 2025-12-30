export type StressTestRecommendation = 'BET' | 'LEAN' | 'NO BET';

export interface StressTestScoringBreakdown {
    hedging: {
        count: number;
        penalty: number;
        words: string[];
    };
    contradiction: {
        count: number;
        penalty: number;
        words: string[];
    };
    confidence: {
        strongCount: number;
        weakCount: number;
        score: number;
        penalty: number;
    };
    completeness: {
        missedQuestions: number;
        penalty: number;
    };
    totalDelta: number;
}

export interface StressTestRecord {
    id: string; // stressTestId
    propId: string; // e.g., "Patrick Mahomes-Pass Yards-250-Over" or similar unique key
    snapshotId: string; // unique ID of the master agent analysis snapshot
    createdAt: number;

    baseScore: number;
    postScore: number;
    recommendation: StressTestRecommendation;

    script: {
        defense: string;
        skepticQuestions: string[];
        rebuttal: string;
    };

    audioUrls: {
        defense: string;
        skepticQuestions: string[];
        rebuttal: string;
    };

    scoringBreakdown: StressTestScoringBreakdown;
}

export interface StressTestRequest {
    propId: string;
    snapshotId: string;
    baseConfidence: number;
    pick: string; // e.g. "Over 250.5 Pass Yards"
    rationale: string[]; // bullets
    riskFactors: string[];
}

export interface StressTestResponse {
    status: 'loading' | 'success' | 'error';
    message?: string;
    data?: StressTestRecord;
}
