
import { fetchSportradar } from '../scout-packet/fetcher';
import { SPORTRADAR_CONFIG } from '../scout-packet/config';

// --- Types ---
interface SportradarInjuriesResponse {
    weeks: Array<{
        week: {
            title: string;
            sequence: number;
        };
        teams: Array<{
            id: string;
            name: string;
            alias: string;
            players: Array<{
                id: string;
                name: string;
                position: string;
                injury: {
                    status: string; // 'Questionable', etc.
                    status_date: string;
                    practice_status: string; // 'Did Not Participate'
                    body_part: string;
                };
            }>;
        }>;
    }>;
}

interface SportradarDepthChartResponse {
    team: {
        id: string;
        name: string;
        alias: string;
        depth_chart: Array<{
            position_width: number;
            position: string; // "LWR", "RWR", "QB"
            players: Array<{
                id: string;
                name: string;
                jersey: string;
                depth: number;
            }>;
        }>;
    };
}

// --- Fetchers ---

/**
 * Fetch Official Injury Report for a given week
 * Endpoint: /seasons/{year}/{season_type}/{week}/injuries.json
 */
export async function getOfficialInjuries(season: number, week: number): Promise<SportradarInjuriesResponse> {
    const seasonType = 'REG';
    const endpoint = `/seasons/${season}/${seasonType}/${week}/injuries.json`;

    // We reuse the Scout fetcher to share the Rate Limiter workflow
    return fetchSportradar<SportradarInjuriesResponse>(endpoint);
}

/**
 * Fetch Team Depth Chart
 * Endpoint: /teams/{team_id}/depth_chart.json
 */
export async function getTeamDepthChart(teamId: string): Promise<SportradarDepthChartResponse> {
    const endpoint = `/teams/${teamId}/depth_chart.json`;
    return fetchSportradar<SportradarDepthChartResponse>(endpoint);
}

/**
 * Fetch League Hierarchy (to get Team IDs from Aliases if needed)
 * Reusing Scout's cache if possible, but for now direct fetch
 */
export async function getLeagueHierarchy() {
    return fetchSportradar<any>('/league/hierarchy.json');
}
