import { Reliability } from '../types';

export function buildReliability(seasonStats: any): Reliability {
    const gamesPlayed = seasonStats?.record?.games_played || 0;
    const passAttempts = seasonStats?.record?.passing?.attempts || undefined;
    const rushAttempts = seasonStats?.record?.rushing?.attempts || undefined;

    return {
        sample_sizes: {
            games: gamesPlayed,
            pass_attempts: passAttempts,
            rush_attempts: rushAttempts
        }
    };
}
