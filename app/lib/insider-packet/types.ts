
// 1️⃣ Game & Context Metadata
export interface InsiderGameContext {
    season: number;
    week: number;
    game_id: string;
    team: string; // Alias
    opponent: string; // Alias
    home_away: 'home' | 'away';
    kickoff_time: string;
    days_rest: number;
    short_week_flag: boolean;
    data_freshness_timestamp: string;
}

// 2️⃣ Player Availability & Injury Status
export interface PlayerAvailability {
    player_id: string;
    name: string;
    position: string;
    team: string;
    injury_status: 'out' | 'doubtful' | 'questionable' | 'probable' | 'healthy';
    injury_designation: 'IR' | 'PUP' | 'NFI' | 'none';
    injury_body_part?: string;
    injury_severity: 'minor' | 'moderate' | 'major' | 'unknown';
    practice_participation: Record<string, 'DNP' | 'LP' | 'FP'>; // Keyed by date or Day string (Wed/Thu/Fri)
    injury_trend: 'improving' | 'unchanged' | 'worsening';
    returning_from_injury_flag: boolean;
    snap_limit_expectation: 'yes' | 'no' | 'unknown';
    game_time_decision_flag: boolean;
}

// 3️⃣ Depth Chart & Replacement Context
export interface DepthChartContext {
    depth_chart_position: number;
    direct_backup_player_id?: string;
    backup_experience_flag: boolean; // True if backup has meaningful snaps
    committee_risk_flag: boolean;
    positional_thinness_flag: boolean; // True if multiple backups are also hurt
    emergency_elevation_flag: boolean;
}

// 4️⃣ Recent Usage & Role Signals (No Efficiency)
export interface RecentUsageRole {
    snap_share_proxy: number | null; // 0.0-1.0
    route_participation_proxy: number | null;
    carry_share: number | null;
    target_share: number | null;
    red_zone_usage: number | null;
    goal_line_usage: number | null;
    two_minute_usage: number | null;
    last3_vs_season_usage_delta: number; // Positive = trending up
    role_expansion_flag: boolean;
    role_contraction_flag: boolean;
}

// 5️⃣ Offensive Line Availability
export interface OffensiveLineStatus {
    starting_ol_expected: number; // 0-5
    ol_injuries: string[]; // List of names
    ol_replacements: string[];
    ol_continuity_score: number; // 0.0-1.0
    protection_downgrade_flag: boolean;
    run_blocking_downgrade_flag: boolean;
}

// 6️⃣ Defensive Availability
export interface DefensiveStatus {
    cb1_status: string; // "Healthy", "Out", "Shadowing"
    cb1_replacement_quality: 'Elite' | 'Average' | 'Poor' | 'N/A';
    edge_rusher_status: string;
    interior_dl_status: string;
    lb_run_def_status: string;
    safety_deep_role_status: string;
}

// 7️⃣ Coaching & Role Stability Context
export interface CoachingContext {
    head_coach: string;
    offensive_coordinator: string;
    defensive_coordinator: string;
    recent_playcaller_change_flag: boolean;
    recent_scheme_change_notes: string;
    historical_tendency_with_injuries?: string;
}

// 8️⃣ Role Volatility & Risk Indicators
export interface RoleVolatility {
    snap_volatility_score: number; // 0.0-1.0 (Low to High Risk)
    usage_volatility_score: number;
    role_stability_flag: boolean;
    committee_risk_flag: boolean;
    trust_uncertainty_flag: boolean; // "Risk Present"
}

// 9️⃣ Data Quality & Uncertainty
export interface DataQuality {
    missing_fields: string[];
    stale_data_flags: string[];
    conflicting_reports_flag: boolean;
    last_updated_by_source: string;
}

// --- MASTER PACKET ---
export interface InsiderPacket {
    game_context: InsiderGameContext;
    player_availability: PlayerAvailability;
    depth_chart: DepthChartContext;
    recent_usage: RecentUsageRole;
    offensive_line: OffensiveLineStatus;
    defensive_line: DefensiveStatus;
    coaching: CoachingContext;
    volatility: RoleVolatility;
    data_quality: DataQuality;
}
