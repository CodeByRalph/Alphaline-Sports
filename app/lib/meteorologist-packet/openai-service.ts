
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface MeteorologistAnalysis {
    user_weather_writeup: string[];
    impact_scores: {
        passing_penalty: number;
        rushing_boost: number;
        kicking_penalty: number;
        ball_security_risk: number;
        visibility_risk: number;
        pace_slowdown_risk: number;
    };
    overall_confidence: 'High' | 'Medium' | 'Low';
    confidence_drivers: string[];
    data_quality: {
        forecast_age: string;
        missing_fields: string[];
        assumptions: string[];
    };
}

// Strict JSON Schema for GPT-4o
const ANALYSIS_SCHEMA = {
    type: "json_schema",
    json_schema: {
        name: "weather_impact_analysis",
        strict: true,
        schema: {
            type: "object",
            properties: {
                user_weather_writeup: {
                    type: "array",
                    items: { type: "string" },
                    description: "4–7 concise bullet points describing game-time weather and its football impact. No betting language."
                },
                impact_scores: {
                    type: "object",
                    properties: {
                        passing_penalty: { type: "number", description: "0.0 = No Penalty (Perfect), 1.0 = Max Penalty" },
                        rushing_boost: { type: "number", description: "0.0 = No Boost, 1.0 = Max Boost" },
                        kicking_penalty: { type: "number", description: "0.0 = No Penalty, 1.0 = Max Penalty" },
                        ball_security_risk: { type: "number", description: "0.0 = Safe, 1.0 = High Fumble/Drop Risk" },
                        visibility_risk: { type: "number", description: "0.0 = Clear, 1.0 = Blind conditions" },
                        pace_slowdown_risk: { type: "number", description: "0.0 = Fast Track, 1.0 = Mud Bowl/Slugfest" }
                    },
                    required: ["passing_penalty", "rushing_boost", "kicking_penalty", "ball_security_risk", "visibility_risk", "pace_slowdown_risk"],
                    additionalProperties: false
                },
                overall_confidence: {
                    type: "string",
                    enum: ["High", "Medium", "Low"]
                },
                confidence_drivers: {
                    type: "array",
                    items: { type: "string" },
                    description: "Short list explaining why the confidence level was assigned"
                },
                data_quality: {
                    type: "object",
                    properties: {
                        forecast_age: { type: "string", description: "e.g. 'Live (NWS)' or 'Historical Approximation'" },
                        missing_fields: { type: "array", items: { type: "string" } },
                        assumptions: { type: "array", items: { type: "string" } }
                    },
                    required: ["forecast_age", "missing_fields", "assumptions"],
                    additionalProperties: false
                }
            },
            required: ["user_weather_writeup", "impact_scores", "overall_confidence", "confidence_drivers", "data_quality"],
            additionalProperties: false
        }
    }
};

// --- System Prompt ---
const SYSTEM_PROMPT = `
You are the Expert Football Meteorologist Agent.

**Role:**
Interpret weather data using rule-based football logic.
Translate raw weather conditions into on-field impacts.

**Constraints (MUST FOLLOW):**
- DO NOT use betting odds, lines, spreads, totals, or props.
- DO NOT recommend or suggest bets.
- DO NOT infer player or team performance beyond weather effects.
- DO NOT hallucinate missing weather data.
- DO NOT use external tools.
- DO NOT output raw tables.
- Be conservative when uncertainty is high.
- All numeric scores must be between 0.0 and 1.0.

**Outputs:**
- user_weather_writeup: 4-7 plain language bullet points.
- impact_scores: Normalized 0.0-1.0.
- overall_confidence: High/Medium/Low based on forecast stability.
`;

export async function generateWeatherImpact(
    gameContext: string,
    environmentData: any
): Promise<MeteorologistAnalysis | null> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Analyze this game environment:\n\nContext: ${gameContext}\n\nEnvironment Data: ${JSON.stringify(environmentData)}`
                },
            ],
            // @ts-ignore - SDK types might trail functionality slightly but this is valid for gpt-4o
            response_format: ANALYSIS_SCHEMA,
        });

        const content = completion.choices[0].message.content;
        if (!content) return null;

        return JSON.parse(content) as MeteorologistAnalysis;

    } catch (e) {
        console.error("OpenAI Weather Analysis Failed:", e);
        return null; // Fail gracefully
    }
}
