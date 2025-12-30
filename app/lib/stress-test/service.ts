import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { openai, MODEL } from '../ai/client';
import { StressTestRecord, StressTestRequest, StressTestResponse, StressTestScoringBreakdown, StressTestRecommendation } from './types';

const DATA_DIR = path.join(process.cwd(), 'app', 'data');
const DB_FILE = path.join(DATA_DIR, 'stress_tests.json');

// Ensure data directory exists
async function ensureDb() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (e) {
        // ignore
    }
}

// --- CONFIG ---
// Fallback Voice IDs (Standard ElevenLabs)
// Bookie: "Bill" (Strong, manly, sporty)
const VOICE_BOOKIE = 'pqHfZKP75CvOlQylNhV4';
// Skeptic: "Drew" (news reader/reporter)
const VOICE_SKEPTIC = '29vD33N1CtxCmqQRPOHJ';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// --- UTILS ---

function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

// --- SCORING LOGIC ---

const HEDGE_WORDS = ["maybe", "might", "could", "possibly", "likely", "generally", "i think", "i feel", "somewhat", "it depends", "uncertain", "not sure", "hard to say", "guess", "probably"];
const CONTRADICTION_WORDS = ["however", "but", "on the other hand", "that said", "alternatively", "still", "yet", "i was wrong", "actually", "i take that back"];
const STRONG_WORDS = ["will", "expect", "strongly", "clear", "high conviction", "favorable", "edge", "mispriced", "value", "probable"];
const WEAK_WORDS = ["if", "unless", "could", "maybe", "unclear", "coin flip"];

function calculateStressScore(baseConfidence: number, script: { defense: string; skepticQuestions: string[]; rebuttal: string }): { postScore: number; delta: number; breakdown: StressTestScoringBreakdown } {
    const text = (script.defense + ' ' + script.rebuttal).toLowerCase();
    const rebuttalLower = script.rebuttal.toLowerCase();
    const wordCount = text.split(/\s+/).length;

    // A) Hedging
    let hedgeCount = 0;
    const hedgeMatches = [];
    for (const word of HEDGE_WORDS) {
        const matches = (text.match(new RegExp(`\\b${word}\\b`, 'yi')) || []).length; // using y implied simple match? RegExp global needed
        // safer simple loop or match
        const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const found = text.match(regex);
        if (found) {
            hedgeCount += found.length;
            hedgeMatches.push(word);
        }
    }
    const hedgeRate = hedgeCount / Math.max(1, wordCount);
    // penaltyA = clamp(round(hedgeRate * 120), 0, 15)
    const penaltyA = clamp(Math.round(hedgeRate * 120), 0, 15);

    // B) Contradiction
    let backtrackCount = 0;
    const contraMatches = [];
    for (const phrase of CONTRADICTION_WORDS) {
        const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const found = text.match(regex);
        if (found) {
            backtrackCount += found.length;
            contraMatches.push(phrase);
        }
    }
    const penaltyB = clamp(backtrackCount * 2, 0, 10);

    // C) Confidence Language
    let strongCount = 0;
    let weakCount = 0;
    for (const w of STRONG_WORDS) {
        const regex = new RegExp(`\\b${w}\\b`, 'gi');
        const found = text.match(regex);
        if (found) strongCount += found.length;
    }
    for (const w of WEAK_WORDS) {
        const regex = new RegExp(`\\b${w}\\b`, 'gi');
        const found = text.match(regex);
        if (found) weakCount += found.length;
    }
    const scoreC = strongCount - weakCount;
    // penaltyC = clamp(5 - scoreC, -5, 10)  // negative means bonus up to -5
    const penaltyC = clamp(5 - scoreC, -5, 10);

    // D) Completeness (Rebuttal addressing questions)
    // Heuristic: Check if keywords from questions appear in rebuttal
    // This is hard to do deterministically without NLP.
    // For Hackathon, we'll assume the LLM did it right mainly, but check for question marks? No.
    // Let's skip complex NLP and just assume 0 penalty for now unless we implement keyword extraction.
    // Actually prompt requirement: "Match by topic keywords"
    // Simple approach: Extract nouns from questions?
    // Let's just create a mock "missedQuestions" based on length. If rebuttal is too short vs questions?
    // Or just randomness for "Effect"? No, must be deterministic.
    // Let's look for overlap of words > 4 chars.
    let missedQuestions = 0;
    const rebuttalWords = new Set(rebuttalLower.split(/\W+/).filter(w => w.length > 4));
    for (const q of script.skepticQuestions) {
        const qWords = q.toLowerCase().split(/\W+/).filter(w => w.length > 4);
        const overlap = qWords.filter(w => rebuttalWords.has(w));
        // If overlap is 0, maybe missed?
        if (overlap.length === 0 && qWords.length > 0) {
            missedQuestions++; // Strict!
        }
    }
    const penaltyD = Math.min(missedQuestions * 2, 5);

    const totalDelta = clamp(penaltyA + penaltyB + penaltyC + penaltyD, 0, 40);
    const postScore = clamp(baseConfidence - totalDelta, 0, 100);

    return {
        postScore,
        delta: totalDelta,
        breakdown: {
            hedging: { count: hedgeCount, penalty: penaltyA, words: [...new Set(hedgeMatches)] },
            contradiction: { count: backtrackCount, penalty: penaltyB, words: [...new Set(contraMatches)] },
            confidence: { strongCount, weakCount, score: scoreC, penalty: penaltyC },
            completeness: { missedQuestions, penalty: penaltyD },
            totalDelta
        }
    };
}

function getRecommendation(score: number): StressTestRecommendation {
    if (score >= 70) return 'BET';
    if (score >= 55) return 'LEAN';
    return 'NO BET';
}

// --- EXTERNAL SERVICES ---

async function generateScript(request: StressTestRequest): Promise<{ defense: string; skepticQuestions: string[]; rebuttal: string }> {
    const prompt = `
    Generate a "Conviction Stress Test" script for a sports bet.
    
    BET: ${request.pick}
    RATIONALE: ${request.rationale.join('; ')}
    RISK FACTORS: ${request.riskFactors.join('; ')}
    BASE CONFIDENCE: ${request.baseConfidence.toFixed(1)}

    ROLES:
    1. BOOKIE (Voice A): Defends the pick. SUPER CONCISE. "Sporty/Manly" tone. Max 60 words. No fluff.
    2. SKEPTIC (Voice B): Cross-examination. 2 rapid-fire questions/counterfactuals based on risks. Each 1 sentence max.
    3. BOOKIE (Voice A): Rebuttal. Address risks, final verdict. Punchy. Max 40 words.

    OUTPUT FORMAT JSON:
    {
      "defense": "string",
      "skepticQuestions": ["q1", "q2"],
      "rebuttal": "string"
    }
    `;

    const completion = await openai.chat.completions.create({
        model: MODEL || 'gpt-4o',
        messages: [{ role: 'system', content: 'You are a scriptwriter for a sports betting debate. Keep it FAST and INTENSE.' }, { role: 'user', content: prompt }],
        response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
}

async function generateAudio(text: string, voiceId: string): Promise<string> {
    if (!ELEVENLABS_API_KEY) throw new Error("Missing ElevenLabs API Key");

    // HACKATHON: Mock if no key or dev mode? No, prompt says "use existing key".
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text,
            model_id: "eleven_turbo_v2", // Low latency
            voice_settings: { stability: 0.5, similarity_boost: 0.7 }
        })
    });

    if (!response.ok) {
        console.error("ElevenLabs Error", await response.text());
        throw new Error("TTS Generation Failed");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to public/audio cache
    const fileName = `stress_${crypto.randomBytes(8).toString('hex')}.mp3`;
    const publicAudioDir = path.join(process.cwd(), 'public', 'audio-cache');
    try {
        await fs.mkdir(publicAudioDir, { recursive: true });
        await fs.writeFile(path.join(publicAudioDir, fileName), buffer);
    } catch (e) {
        console.error("Failed to save audio", e);
        throw e; // fail
    }

    return `/audio-cache/${fileName}`;
}

// --- MAIN SERVICE ---

export async function runStressTest(request: StressTestRequest): Promise<StressTestRecord> {
    await ensureDb();

    // 1. Check Cache
    try {
        const data = await fs.readFile(DB_FILE, 'utf-8');
        const db = JSON.parse(data) as StressTestRecord[];
        const cached = db.find(r => r.snapshotId === request.snapshotId && r.propId === request.propId);
        if (cached) return cached;
    } catch (e) {
        // file might not exist or empty
    }

    // 2. Generate Script
    const script = await generateScript(request);

    // 3. Generate Audio (Parallel)
    // Warning: This consumes credits.
    const [defAudio, q1Audio, q2Audio, rebAudio] = await Promise.all([
        generateAudio(script.defense, VOICE_BOOKIE),
        generateAudio(script.skepticQuestions[0] || "Next question.", VOICE_SKEPTIC),
        generateAudio(script.skepticQuestions[1] || "Any other risks?", VOICE_SKEPTIC),
        generateAudio(script.rebuttal, VOICE_BOOKIE),
    ]);

    const audioUrls = {
        defense: defAudio,
        skepticQuestions: [q1Audio, q2Audio].filter(url => !!url), // filter valid?
        rebuttal: rebAudio
    };

    // 4. Score
    // calculateStressScore returns { postScore, delta, breakdown }
    const { postScore, breakdown } = calculateStressScore(request.baseConfidence, script);

    // 5. Create Record
    const record: StressTestRecord = {
        id: crypto.randomUUID(),
        propId: request.propId,
        snapshotId: request.snapshotId,
        createdAt: Date.now(),
        baseScore: request.baseConfidence,
        postScore,
        recommendation: getRecommendation(postScore),
        script,
        audioUrls,
        scoringBreakdown: breakdown
    };

    // 6. Save Cache
    try {
        let db: StressTestRecord[] = [];
        try {
            const data = await fs.readFile(DB_FILE, 'utf-8');
            db = JSON.parse(data);
        } catch (e) { }
        db.push(record);
        await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
    } catch (e) {
        console.error("Failed to save stress test DB", e);
    }

    return record;
}
