const HOST = process.env.RAPIDAPI_HOST!;
const KEY = process.env.RAPIDAPI_KEY!;

interface GameLog {
    gameID: string;
    gameDate: string;
    weekName: string;
    team: string; // The player's team in this log
    opp: string;  // Opponent abbreviation
    // Stats are nested differently per position, handled in UI/Analysis
    [key: string]: any;
}

interface PlayerStats {
    playerID: string;
    longName: string;
    team: string; // Player's current team
    pos?: string;
    games: GameLog[];
    nextGame?: NextGameContext;
}

interface NextGameContext {
    opponent: string;
    gameDate: string;
    location: string;
    weather: string;
    oppDefenseRank: string; // "14th vs Pass", etc.
}

export async function getPlayerLookingGlass(playerName: string): Promise<PlayerStats | null> {
    try {
        // 1. Get Player Info
        const infoUrl = `https://${HOST}/getNFLPlayerInfo?playerName=${encodeURIComponent(playerName)}`;
        const infoRes = await fetch(infoUrl, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        const infoData = await infoRes.json();

        if (!infoData.body || infoData.body.length === 0) return null;

        const player = infoData.body[0];
        const playerID = player.playerID;
        const teamAbv = player.team;

        // 2. Get Games for current season (Defaulting to 2025 as per current time context)
        let season = '2025';
        let gamesUrl = `https://${HOST}/getNFLGamesForPlayer?playerID=${playerID}&season=${season}`;
        let gamesRes = await fetch(gamesUrl, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        let gamesData = await gamesRes.json();

        // If 2025 empty, fallback to 2024
        if (!gamesData.body || Object.keys(gamesData.body).length === 0) {
            season = '2024';
            gamesUrl = `https://${HOST}/getNFLGamesForPlayer?playerID=${playerID}&season=${season}`;
            gamesRes = await fetch(gamesUrl, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
            gamesData = await gamesRes.json();
        }

        const gamesMap = gamesData.body || {};
        const games = Object.values(gamesMap) as GameLog[];

        // Sort games by date (approximate)
        games.sort((a, b) => (b.gameDate > a.gameDate ? 1 : -1)); // Descending

        // 3. Get Upcoming Game Schedule for Team
        // Use 2025 explicitly if possible for schedule to match current date
        const nextGame = await getUpcomingGame(teamAbv, '2025');

        return {
            playerID,
            longName: player.longName,
            team: player.team,
            pos: player.pos,
            games: games.slice(0, 4), // Last 4 played games
            nextGame
        };

    } catch (e) {
        console.error("RapidAPI connection error:", e);
        return null;
    }
}

async function getUpcomingGame(teamAbv: string, season: string): Promise<NextGameContext | undefined> {
    // MANUAL OVERRIDE for Simulation Scenario (User Request: LAR vs DAL on 12/21/2025 AT Dallas)
    if (teamAbv === 'LAR') {
        const opponent = 'DAL';
        const gameDate = '20251221';
        const location = `Away @ ${opponent}`; // Corrected: User specified game is IN Dallas
        const weather = "Retractable Roof (Likely Closed)"; // Dallas AT&T Stadium typical
        const oppDefenseRank = "#5 vs Rush (Elite)"; // Cowboys defense mock

        return {
            opponent,
            gameDate,
            location,
            weather,
            oppDefenseRank
        };
    }

    try {
        // Need to find schedule. Endpoint: getNFLTeamSchedule
        const url = `https://${HOST}/getNFLTeamSchedule?teamAbv=${teamAbv}&season=${season}`;
        const res = await fetch(url, { headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST } });
        const data = await res.json();

        const schedule = data.body?.schedule || [];

        // Find first game that is effectively "today" or in the future.
        // Current Time: 2025-12-15
        const today = '20251215';

        // Tank01 schedule format usually has gameDate as YYYYMMDD string.
        // We want the first game where gameDate >= today.
        const next = schedule.find((g: any) => g.gameDate >= today);

        if (!next) {
            console.log(`No upcoming games found for ${teamAbv} after ${today}`);
            return undefined;
        }

        const isHome = next.home === teamAbv;
        const opponent = isHome ? next.away : next.home;
        // Fix location string to be cleaner
        const location = isHome ? `Home vs ${opponent}` : `Away @ ${opponent}`;

        // Mock Weather & Defense based on Opponent/Location
        const weather = getWeatherMock(location, next.gameDate);
        const oppDefenseRank = getDefenseMock(opponent);

        return {
            opponent,
            gameDate: next.gameDate,
            location,
            weather,
            oppDefenseRank
        };
    } catch (e) {
        console.warn("Failed to get schedule", e);
        return undefined;
    }
}

function getWeatherMock(location: string, date: string): string {
    // Simple hash-based determiner or random for "Live" feel
    const conditions = ['Clear, 55°F', 'Cloudy, 42°F', 'Drizzle, 60°F', 'Sunny, 72°F', 'Dome (Indoor)'];
    const isDome = location.includes('DET') || location.includes('MIN') || location.includes('LV') || location.includes('IND') || location.includes('HOU') || location.includes('NO') || location.includes('ATL') || location.includes('DAL') || location.includes('ARI');

    if (isDome) return "Indoors (Dome)";
    return conditions[Math.floor(Math.random() * conditions.length)];
}

function getDefenseMock(team: string): string {
    // Randomize or hardcode some reputation
    const rank = Math.floor(Math.random() * 32) + 1;
    const type = Math.random() > 0.5 ? 'Pass' : 'Rush';
    const quality = rank < 10 ? 'Elite' : rank > 25 ? 'Vulnerable' : 'Average';
    return `#${rank} vs ${type} (${quality})`;
}
