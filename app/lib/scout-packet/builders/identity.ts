
import { PacketMeta, TeamIdentityTendencies } from '../types';
import { safeNumber, safePct, extractStat } from '../normalizer';

/**
 * Build the basic metadata for the packet
 */
export function buildMeta(
    season: number,
    week: number,
    game: { game_id: string; opponent_alias: string; home_away: 'home' | 'away' } | null,
    team: string,
    playerName?: string | null,
    propLine?: { value: number; type: string } | null
): PacketMeta {
    return {
        season,
        week,
        game_id: game?.game_id || null,
        team,
        opponent: game?.opponent_alias || null,
        home_away: game?.home_away || null,
        data_freshness_timestamp: new Date().toISOString(),
        target_player: playerName || null,
        prop_line: propLine || null
    };
}

/**
 * Build Identity & Tendencies
 * Note: Most specifics like "rpo_rate" are not in standard boxscores/season stats without play-by-play parsing.
 * We will populate what we can and null the rest as per instructions.
 */
export function buildIdentityTendencies(seasonStats: any): TeamIdentityTendencies {
    // Try to derive identity from run/pass ratio if stats exist
    // Use 'record' for team totals
    const passAtt = extractStat(seasonStats, 'record.passing.attempts');
    const rushAtt = extractStat(seasonStats, 'record.rushing.attempts');
    const gamesPlayed = extractStat(seasonStats, 'record.games_played') || 1;

    let offensive_identity: 'run' | 'pass' | 'balanced' | null = null;
    let neutral_pass_rate: number | null = null;
    let pace_plays_per_game: number | null = null;

    if (passAtt !== null && rushAtt !== null) {
        const total = passAtt + rushAtt;
        if (total > 0) {
            const passRate = (passAtt / total);
            neutral_pass_rate = Number((passRate * 100).toFixed(1));

            if (passRate > 0.60) offensive_identity = 'pass';
            else if (passRate < 0.45) offensive_identity = 'run';
            else offensive_identity = 'balanced';

            // Pace proxy: total plays / games
            pace_plays_per_game = Number((total / gamesPlayed).toFixed(1));
        }
    }

    return {
        offensive_identity,
        neutral_pass_rate,
        pace_plays_per_game
    };
}
