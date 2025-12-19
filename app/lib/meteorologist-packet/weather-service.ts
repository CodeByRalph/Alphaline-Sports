
interface PointResponse {
    properties: {
        gridId: string;
        gridX: number;
        gridY: number;
    }
}

interface ForecastResponse {
    properties: {
        periods: Array<{
            name: string;
            startTime: string;
            endTime: string;
            temperature: number;
            temperatureUnit: string;
            windSpeed: string;
            shortForecast: string;
            detailedForecast: string;
        }>
    }
}

export interface WeatherCondition {
    temperature: string;
    weather: string;
    wind: string;
    details: string;
}

const USER_AGENT = '(InformedWager/1.0.0; contact@informedwager.app)';

export async function getGameWeather(lat: number, long: number, gameTime: string): Promise<WeatherCondition | null> {
    try {
        // 1. Get Grid Point
        const pointUrl = `https://api.weather.gov/points/${lat},${long}`;
        const pointRes = await fetch(pointUrl, { headers: { 'User-Agent': USER_AGENT } });

        if (!pointRes.ok) throw new Error(`NWS Point Error: ${pointRes.status}`);

        const pointData: PointResponse = await pointRes.json();
        const { gridId, gridX, gridY } = pointData.properties;

        // 2. Get Forecast
        const forecastUrl = `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`;
        const forecastRes = await fetch(forecastUrl, { headers: { 'User-Agent': USER_AGENT } });

        if (!forecastRes.ok) throw new Error(`NWS Forecast Error: ${forecastRes.status}`);

        const forecastData: ForecastResponse = await forecastRes.json();
        const periods = forecastData.properties.periods;

        // 3. Find period matching game time
        // If gameTime is far in future (beyond 7 days), NWS won't have it.
        // If gameTime is strictly "Today", find period covering now/soon.

        const targetDate = new Date(gameTime);
        // Fallback: If parsing fails or generic string, try to match "today" or nearest period

        const match = periods.find(p => {
            const start = new Date(p.startTime);
            const end = new Date(p.endTime);
            return targetDate >= start && targetDate <= end;
        });

        // If no strict match (e.g. game is 10 days out), return null or generic
        // For this demo, if meaningful match isn't found, find the closest one or first one?
        // Let's safe guard:
        const period = match || periods[0]; // Fallback to current/first forecast if date not found (immediate demo)

        return {
            temperature: `${period.temperature}°${period.temperatureUnit}`,
            weather: period.shortForecast,
            wind: period.windSpeed,
            details: period.detailedForecast
        };

    } catch (e) {
        console.error("NWS Fetch Failed:", e);
        return null;
    }
}
