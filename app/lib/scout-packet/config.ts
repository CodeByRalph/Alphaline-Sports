
export const SPORTRADAR_CONFIG = {
    API_KEY: process.env.SPORTRADAR_API_KEY || 'OEMQmZAxZcGMWJYJiPf1qIsXPxlnbcQwSTMcNTHZ', // Fallback for demo, but should be in env
    BASE_URL: 'https://api.sportradar.us/nfl/official/trial/v7/en',
    CACHE_TTL: {
        SCHEDULE: 60 * 60 * 24, // 24 hours
        ROSTER: 60 * 60 * 24, // 24 hours
        GAME_STATS: 60 * 5, // 5 minutes (live-ish)
        SEASON_STATS: 60 * 60, // 1 hour
    },
    // Mapping for team aliases if needed (Sportradar usually uses standard 2 or 3 letter codes)
};
