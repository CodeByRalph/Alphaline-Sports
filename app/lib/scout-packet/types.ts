export interface ScoutPacket {
    meta: PacketMeta;
    team_identity_tendencies: TeamIdentityTendencies;
    team_offense: TeamOffense;
    team_defense: TeamDefense;
    players: Player[];
    matchup_reality: MatchupReality;
    reliability: Reliability;
    missing_data: string[];
}

export interface PacketMeta {
    season: number;
    week: number;
    game_id: string | null;
    team: string;
    opponent: string | null;
    home_away: 'home' | 'away' | null;
    data_freshness_timestamp: string;
    target_player: string | null;
    prop_line: { value: number; type: string } | null;
}

export interface TeamIdentityTendencies {
    offensive_identity: 'run' | 'pass' | 'balanced' | null;
    neutral_pass_rate: number | null;
    pace_plays_per_game: number | null;
}

export interface TeamOffense {
    // Passing
    yards_per_dropback: number | null;
    explosive_pass_rate_20plus: number | null;
    team_adot: number | null;
    sack_rate_allowed: number | null;

    // Rushing
    yards_per_carry: number | null;
    explosive_run_rate_10plus: number | null;

    // Situational
    third_down_conv_rate: number | null;
    red_zone_td_rate: number | null;
    goal_to_go_td_rate: number | null;
}

export type TeamDefense = {
    [K in keyof TeamOffense as `${K}_allowed`]: number | null;
} & {
    // Defense specific (available from season stats)
    sack_rate: number | null;
};

// Trenches removed - requires PBP data

export interface Player {
    id: string; // Sportradar ID
    name: string;
    position: string;
    team: string; // Abbreviation

    availability: {
        injury_status: string | null; // e.g., 'Questionable', 'Out'
        practice_participation_trend: string | null;
        returning_from_injury_flag: boolean;
        snap_expectation_note: string | null;
    };

    usage: PlayerUsage;
    efficiency: PlayerEfficiency;

    trends: {
        last3_vs_season_deltas?: Record<string, number>;
        role_change_flags?: string[];
    };
}

export interface PlayerUsage {
    // QB
    dropbacks_per_game?: number; // Approximation: Attempts + Sacks

    // RB
    carry_share?: number;
    target_share?: number;

    // WR/TE
    air_yards_share?: number;
}

export interface PlayerEfficiency {
    // QB
    int_rate?: number;
    sack_avoidance_rate?: number;

    // WR/TE
    catch_rate?: number;
    yards_per_target?: number;
}

export interface MatchupReality {
    pass_funnel_flag: boolean | null;
}

// OpponentAdjustments removed - requires SOS calculation

export interface Reliability {
    sample_sizes: {
        games: number;
        pass_attempts?: number;
        rush_attempts?: number;
    };
}

// Internal Types for Sportradar Responses (Partial)
export interface SportradarScheduleGame {
    id: string;
    scheduled: string;
    home: { id: string; alias: string };
    away: { id: string; alias: string };
}
