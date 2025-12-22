import OpenAI from 'openai';
import { MasterPacket, BetContext, ScoutPacket, AgentReport } from '../../types';
import { InsiderAnalysis } from '../insider-packet/openai-service';
import { MeteorologistReport } from '../meteorologist-packet/agent';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- Schema Definition ---
const MASTER_SCHEMA = {
    type: "json_schema",
    json_schema: {
        name: "master_analysis",
        strict: true,
        schema: {
            type: "object",
            properties: {
                analysis: {
                    type: "object",
                    properties: {
                        // Neutral terminology: projection vs the line
                        projection: { type: "string", enum: ["Above Line", "Below Line", "Inconclusive"] },
                        confidence_score: { type: "number" }
                    },
                    required: ["projection", "confidence_score"],
                    additionalProperties: false
                },
                analysis_summary: {
                    type: "array",
                    items: { type: "string" }
                },
                data_sources: {
                    type: "object",
                    properties: {
                        historical_data: { type: "string", enum: ["supports_above", "neutral", "supports_below"] },
                        availability_data: { type: "string", enum: ["favorable", "neutral", "limiting"] },
                        environmental_data: { type: "string", enum: ["favorable", "neutral", "limiting"] }
                    },
                    required: ["historical_data", "availability_data", "environmental_data"],
                    additionalProperties: false
                },
                key_factors: {
                    type: "array",
                    items: { type: "string" }
                },
                data_limitations: {
                    type: "array",
                    items: { type: "string" }
                },
                confidence_explanation: { type: "string" }
            },
            required: [
                "analysis",
                "analysis_summary",
                "data_sources",
                "key_factors",
                "data_limitations",
                "confidence_explanation"
            ],
            additionalProperties: false
        }
    }
};

// --- System Prompt ---
const SYSTEM_PROMPT = `
You are a SPORTS DATA ANALYST. You synthesize data from multiple sources to provide statistical projections.
This is a DATA ANALYSIS tool, NOT betting advice. Do not tell users what to bet or whether to bet.

**Your Role:**
- Analyze player statistics and provide data-driven projections
- Express how confident you are in the data, not in a betting outcome
- Present facts objectively without recommending action

**CRITICAL: Confidence Calibration**
Confidence reflects DATA QUALITY and SIGNAL STRENGTH, not a betting recommendation.
- 0.70-1.00: Strong historical data, clear trend, consistent performance
- 0.50-0.69: Moderate data support, some variability
- 0.30-0.49: Limited or conflicting data
- 0.00-0.29: Insufficient data for meaningful projection

**Inputs:**
1. Player Context (Name, Statistical Category, Reference Line)
2. Scout Data (Historical performance, efficiency metrics, trends, opponent context)
3. Insider Data (Availability status, team dynamics)
4. Environmental Data (Weather conditions if applicable)

**Analysis Protocol:**

1. **Statistical Summary**:
   - Compare player's historical average to the reference line
   - Note the percentage above or below
   - Identify the floor and ceiling from recent performance

2. **Trend Analysis**:
   - Compare recent performance (last 3 games) vs season average
   - Note if trending up, down, or stable

3. **Context Factors**:
   - Player availability and health status
   - Opponent defensive context (Elite/Average/Vulnerable)
   - Environmental conditions

4. **Multi-Factor Projection**:
   Weight these factors to determine direction:
   - **Historical hit rate**: How often has the player exceeded this line value?
   - **Average vs Line**: Is the season average above or below the reference?
   - **Recent trend**: Is performance improving, declining, or stable?
   - **Opponent matchup**: Does the defense favor or limit this stat category?
   - **Availability**: Is the player fully healthy or limited?
   
   Choose projection based on the BALANCE of these factors:
   - "Above Line": Multiple factors support exceeding the value
   - "Below Line": Multiple factors support falling short
   - "Inconclusive": Factors are mixed or cancel each other out

5. **Confidence Reflects Data Strength**:
   - High confidence (0.70+): Most factors align, data is consistent
   - Medium confidence (0.50-0.69): Some alignment, but one or more concerns
   - Low confidence (0.30-0.49): Factors are conflicting or data is limited
   - Very low (<0.30): Cannot make a meaningful projection

6. **Explain Your Analysis**:
   - Cite specific statistics for each factor you weighed
   - Explain which factors pulled in which direction
   - Note why the final projection reflects the balance

**Output Guidelines:**
- Never say "bet", "wager", "play", or "fade"
- Use "projection", "data suggests", "factors indicate"
- Explain the reasoning behind your projection direction
- Be honest about conflicting signals

**CRITICAL: confidence_score must be a decimal between 0.00 and 1.00**
`;



export async function generateMasterDecision(
    bet: BetContext,
    scout: ScoutPacket | null,
    insider: InsiderAnalysis | null,
    weather: MeteorologistReport | null,
    edgeSignals?: any
): Promise<MasterPacket | null> {
    try {
        const inputPayload = {
            bet_context: bet,
            scout_packet: scout,
            insider_analysis: insider,
            meteorologist_report: weather,
            // Pre-calculated edge signals to help LLM calibrate confidence
            edge_signals: edgeSignals || null
        };

        const completion = await openai.chat.completions.create({
            model: "gpt-5",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Analyze this Packet Set and provide a Final Decision:\n${JSON.stringify(inputPayload, null, 2)}`
                },
            ],
            // @ts-ignore
            response_format: MASTER_SCHEMA,
        });

        const content = completion.choices[0].message.content;
        if (!content) return null;

        const result = JSON.parse(content) as MasterPacket;

        // Normalize confidence score if LLM returned percentage instead of decimal
        if (result.analysis.confidence_score > 1) {
            result.analysis.confidence_score = result.analysis.confidence_score / 100;
        }

        return result;

    } catch (e) {
        console.error("OpenAI Master Decision Failed:", e);
        return null;
    }
}
