
import OpenAI from 'openai';
import { InsiderPacket } from './types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- Schema Definition (Strict 10-Section) ---
const INSIDER_SCHEMA = {
    type: "json_schema",
    json_schema: {
        name: "insider_analysis",
        strict: true,
        schema: {
            type: "object",
            properties: {
                availability_overview: {
                    type: "object",
                    properties: {
                        qb_status: { type: "string", enum: ["full", "limited", "out", "uncertain"] },
                        skill_positions_status: { type: "string", enum: ["stable", "mixed", "unstable"] },
                        offensive_line_status: { type: "string", enum: ["stable", "degraded", "unstable"] },
                        defensive_availability_status: { type: "string", enum: ["stable", "degraded"] },
                        overall_availability_grade: { type: "string", enum: ["Good", "Caution", "Risk"] }
                    },
                    required: ["qb_status", "skill_positions_status", "offensive_line_status", "defensive_availability_status", "overall_availability_grade"],
                    additionalProperties: false
                },
                key_player_statuses: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            player_id: { type: "string" },
                            name: { type: "string" },
                            position: { type: "string" },
                            availability_status: { type: "string", enum: ["full", "limited", "out", "uncertain"] },
                            expected_snap_level: { type: "string", enum: ["normal", "reduced", "emergency", "unknown"] },
                            primary_limitation: { type: "string" },
                            replacement_player_id: { type: "string" },
                            risk_flag: { type: "string", enum: ["Low", "Medium", "High"] },
                            notes: { type: "string" }
                        },
                        required: ["player_id", "name", "position", "availability_status", "expected_snap_level", "primary_limitation", "replacement_player_id", "risk_flag", "notes"],
                        additionalProperties: false
                    }
                },
                role_stability_summary: {
                    type: "object",
                    properties: {
                        overall_role_stability: { type: "string", enum: ["Stable", "Mixed", "Volatile"] },
                        committee_risk_present: { type: "boolean" },
                        recent_role_changes_detected: { type: "boolean" },
                        trust_distribution_shift: { type: "boolean" },
                        role_changes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    player_id: { type: "string" },
                                    change_type: { type: "string", enum: ["expanded", "reduced", "uncertain"] },
                                    driver: { type: "string", enum: ["injury", "depth_chart", "coach_decision"] },
                                    confidence: { type: "string", enum: ["Low", "Medium", "High"] }
                                },
                                required: ["player_id", "change_type", "driver", "confidence"],
                                additionalProperties: false
                            }
                        }
                    },
                    required: ["overall_role_stability", "committee_risk_present", "recent_role_changes_detected", "trust_distribution_shift", "role_changes"],
                    additionalProperties: false
                },
                replacement_risk_assessment: {
                    type: "object",
                    properties: {
                        critical_replacements: { type: "array", items: { type: "string" } },
                        replacement_quality: { type: "string", enum: ["Turnstile", "Weak", "Adequate", "Good", "Unknown"] },
                        positional_thinness_flags: { type: "array", items: { type: "string" } },
                        cascade_risk_present: { type: "boolean" }
                    },
                    required: ["critical_replacements", "replacement_quality", "positional_thinness_flags", "cascade_risk_present"],
                    additionalProperties: false
                },
                offensive_line_impact: {
                    type: "object",
                    properties: {
                        continuity_grade: { type: "string", enum: ["High", "Medium", "Low"] },
                        protection_risk: { type: "string", enum: ["Low", "Medium", "High"] },
                        run_blocking_risk: { type: "string", enum: ["Low", "Medium", "High"] },
                        notes: { type: "string" }
                    },
                    required: ["continuity_grade", "protection_risk", "run_blocking_risk", "notes"],
                    additionalProperties: false
                },
                defensive_availability_notes: {
                    type: "object",
                    properties: {
                        cb1_status: { type: "string" },
                        edge_rusher_status: { type: "string" },
                        lb_run_def_status: { type: "string" },
                        safety_deep_role_status: { type: "string" },
                        impact_level: { type: "string", enum: ["Low", "Medium", "High"] }
                    },
                    required: ["cb1_status", "edge_rusher_status", "lb_run_def_status", "safety_deep_role_status", "impact_level"],
                    additionalProperties: false
                },
                risk_flags: {
                    type: "object",
                    properties: {
                        late_injury_uncertainty: { type: "boolean" },
                        snap_limit_risk: { type: "boolean" },
                        committee_usage_risk: { type: "boolean" },
                        depth_instability_risk: { type: "boolean" },
                        ol_disruption_risk: { type: "boolean" },
                        conflicting_reports_risk: { type: "boolean" }
                    },
                    required: ["late_injury_uncertainty", "snap_limit_risk", "committee_usage_risk", "depth_instability_risk", "ol_disruption_risk", "conflicting_reports_risk"],
                    additionalProperties: false
                },
                confidence_adjustment: {
                    type: "object",
                    properties: {
                        adjustment: { type: "string", enum: ["none", "reduce_slightly", "reduce_significantly"] },
                        reason_codes: { type: "array", items: { type: "string" } },
                        summary: { type: "string" }
                    },
                    required: ["adjustment", "reason_codes", "summary"],
                    additionalProperties: false
                },
                data_quality: {
                    type: "object",
                    properties: {
                        missing_fields: { type: "array", items: { type: "string" } },
                        stale_data_present: { type: "boolean" },
                        conflicting_reports_present: { type: "boolean" },
                        last_updated_timestamp: { type: "string" }
                    },
                    required: ["missing_fields", "stale_data_present", "conflicting_reports_present", "last_updated_timestamp"],
                    additionalProperties: false
                },
                insider_brief: {
                    type: "array",
                    items: { type: "string" },
                    description: "4-6 plain, factual bullet points identifying availability and risk."
                }
            },
            required: [
                "availability_overview",
                "key_player_statuses",
                "role_stability_summary",
                "replacement_risk_assessment",
                "offensive_line_impact",
                "defensive_availability_notes",
                "risk_flags",
                "confidence_adjustment",
                "data_quality",
                "insider_brief"
            ],
            additionalProperties: false
        }
    }
};

export interface InsiderAnalysis {
    availability_overview: {
        qb_status: 'full' | 'limited' | 'out' | 'uncertain';
        skill_positions_status: 'stable' | 'mixed' | 'unstable';
        offensive_line_status: 'stable' | 'degraded' | 'unstable';
        defensive_availability_status: 'stable' | 'degraded';
        overall_availability_grade: 'Good' | 'Caution' | 'Risk';
    };
    key_player_statuses: Array<{
        player_id: string;
        name: string;
        position: string;
        availability_status: 'full' | 'limited' | 'out' | 'uncertain';
        expected_snap_level: 'normal' | 'reduced' | 'emergency' | 'unknown';
        primary_limitation: string;
        replacement_player_id: string;
        risk_flag: 'Low' | 'Medium' | 'High';
        notes: string;
    }>;
    role_stability_summary: {
        overall_role_stability: 'Stable' | 'Mixed' | 'Volatile';
        committee_risk_present: boolean;
        recent_role_changes_detected: boolean;
        trust_distribution_shift: boolean;
        role_changes: Array<{
            player_id: string;
            change_type: 'expanded' | 'reduced' | 'uncertain';
            driver: 'injury' | 'depth_chart' | 'coach_decision';
            confidence: 'Low' | 'Medium' | 'High';
        }>;
    };
    replacement_risk_assessment: {
        critical_replacements: string[];
        replacement_quality: 'Turnstile' | 'Weak' | 'Adequate' | 'Good' | 'Unknown';
        positional_thinness_flags: string[];
        cascade_risk_present: boolean;
    };
    offensive_line_impact: {
        continuity_grade: 'High' | 'Medium' | 'Low';
        protection_risk: 'Low' | 'Medium' | 'High';
        run_blocking_risk: 'Low' | 'Medium' | 'High';
        notes: string;
    };
    defensive_availability_notes: {
        cb1_status: string;
        edge_rusher_status: string;
        lb_run_def_status: string;
        safety_deep_role_status: string;
        impact_level: 'Low' | 'Medium' | 'High';
    };
    risk_flags: {
        late_injury_uncertainty: boolean;
        snap_limit_risk: boolean;
        committee_usage_risk: boolean;
        depth_instability_risk: boolean;
        ol_disruption_risk: boolean;
        conflicting_reports_risk: boolean;
    };
    confidence_adjustment: {
        adjustment: 'none' | 'reduce_slightly' | 'reduce_significantly';
        reason_codes: string[];
        summary: string;
    };
    data_quality: {
        missing_fields: string[];
        stale_data_present: boolean;
        conflicting_reports_present: boolean;
        last_updated_timestamp: string;
    };
    insider_brief: string[];
}

// --- System Prompt ---
const SYSTEM_PROMPT = `
You are the Insider Agent. Your job is to assess Availability, Role Stability, and Hidden Risk.
You NEVER create upside. You only confirm stability or flag risk.

**Mandates:**
- Input: An 'InsiderPacket' containing official injury data and depth charts.
- Output: A strict analysis evaluating if the player will actually play their normal role.
- If unsure: Lower confidence, raise a risk flag, say 'uncertain'.
- NO betting advice. NO efficiency metrics. NO weather predictions.

**Key Logic:**
- If injury_status is NOT 'Healthy' -> Risk is present.
- If days_rest < 6 -> Fatigue risk.
- If backup is playing -> Volatility is High.
`;

export async function generateInsiderAnalysis(
    packet: InsiderPacket
): Promise<InsiderAnalysis | null> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                {
                    role: "user",
                    content: `Analyze this Insider Packet:\n${JSON.stringify(packet)}`
                },
            ],
            // @ts-ignore
            response_format: INSIDER_SCHEMA,
        });

        const content = completion.choices[0].message.content;
        if (!content) return null;

        return JSON.parse(content) as InsiderAnalysis;

    } catch (e) {
        console.error("OpenAI Insider Analysis Failed:", e);
        return null; // Fail gracefully
    }
}
