
import { STADIUMS } from './stadiums';
import { getGameWeather } from './weather-service';
import { getPlayerLookingGlass } from '../rapidapi';
import { generateWeatherImpact, MeteorologistAnalysis } from './openai-service';

export interface MeteorologistReport {
    player: {
        name: string;
        team: string;
        position: string;
    };
    game: {
        opponent: string;
        location: string; // "Home vs NE", "Away @ GB"
        stadium: string;
        city: string;
    };
    environment: {
        type: 'Dome' | 'Outdoor' | 'Retractable';
        field: 'Grass' | 'Turf' | 'Hybrid';
        weather_summary: string; // "72°F, Sunny, 5mph Wind" (Computed)
        details: string; // "Clear skies with light winds..."
    };
    analysis?: MeteorologistAnalysis | null;
}

export async function analyzeMeteorology(playerName: string): Promise<MeteorologistReport | null> {
    // 1. Scout User
    const scoutData = await getPlayerLookingGlass(playerName);
    if (!scoutData || !scoutData.nextGame) {
        console.warn("Meteorologist: No active player/game data found for", playerName);
        return null;
    }

    const { team, nextGame } = scoutData;
    const isHome = nextGame.location.toLowerCase().includes('home');
    const stadiumKey = isHome ? team : nextGame.opponent; // Get correct team key for stadium look up

    // Handle relocation/special cases? (JAX in London etc) -> For now assume home stadium of "Home" team
    // Map RapidAPI team abbreviation to our Stadium map keys if diff? (Usually they match standard 2/3 char)

    const stadium = STADIUMS[stadiumKey] || STADIUMS[team]; // Fallback to player's team if opponent unknown? Risk of error.

    if (!stadium) {
        return {
            player: { name: scoutData.longName, team: scoutData.team, position: scoutData.pos || 'UNK' },
            game: { opponent: nextGame.opponent, location: nextGame.location, stadium: 'Unknown', city: 'Unknown' },
            environment: { type: 'Outdoor', field: 'Grass', weather_summary: 'Data Unavailable', details: 'Stadium not found in database.' },
            analysis: null
        };
    }

    // 2. Determine Weather Needs
    let weatherSummary = "Indoors (Controlled)";
    let details = "Climate controlled dome/retractable roof closed.";

    // Even retractable might be open, but we assume closed if weather is bad?
    // Logic: If Dome -> No API Call.
    // If Outdoor or Retractable -> Call API (Retractable usually open only in good weather, so outdoor forecast applies effectively)

    if (stadium.type === 'Outdoor' || stadium.type === 'Retractable') {
        const forecast = await getGameWeather(stadium.lat, stadium.long, nextGame.gameDate);
        if (forecast) {
            weatherSummary = `${forecast.weather}, ${forecast.temperature}`;
            details = `${forecast.details} Wind: ${forecast.wind}`;
        } else {
            weatherSummary = "Forecast Unavailable";
            details = "NWS API could not resolve forecast for this location/time.";
        }
    }

    // 3. Generate LLM Analysis
    const gameContext = `Player: ${scoutData.longName} (${scoutData.pos}, ${scoutData.team}). Game: ${nextGame.location} vs ${nextGame.opponent}. Stadium: ${stadium.name} (${stadium.city}).`;
    const environmentData = {
        type: stadium.type,
        field: stadium.field,
        summary: weatherSummary,
        details: details
    };

    const analysis = await generateWeatherImpact(gameContext, environmentData);

    return {
        player: {
            name: scoutData.longName,
            team: scoutData.team,
            position: scoutData.pos || ''
        },
        game: {
            opponent: nextGame.opponent,
            location: nextGame.location,
            stadium: stadium.name,
            city: `${stadium.city}, ${stadium.state}`
        },
        environment: {
            type: stadium.type,
            field: stadium.field,
            weather_summary: weatherSummary,
            details: details
        },
        analysis
    };
}
