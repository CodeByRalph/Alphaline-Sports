
export interface Stadium {
    id: string;
    name: string;
    city: string;
    state: string;
    team: string; // Home team abbreviation
    lat: number;
    long: number;
    type: 'Dome' | 'Retractable' | 'Outdoor';
    field: 'Grass' | 'Turf' | 'Hybrid';
}

export const STADIUMS: Record<string, Stadium> = {
    ARI: { id: 'ARI', name: 'State Farm Stadium', city: 'Glendale', state: 'AZ', team: 'ARI', lat: 33.5276, long: -112.2626, type: 'Retractable', field: 'Grass' },
    ATL: { id: 'ATL', name: 'Mercedes-Benz Stadium', city: 'Atlanta', state: 'GA', team: 'ATL', lat: 33.7554, long: -84.4009, type: 'Retractable', field: 'Turf' },
    BAL: { id: 'BAL', name: 'M&T Bank Stadium', city: 'Baltimore', state: 'MD', team: 'BAL', lat: 39.2780, long: -76.6227, type: 'Outdoor', field: 'Grass' },
    BUF: { id: 'BUF', name: 'Highmark Stadium', city: 'Orchard Park', state: 'NY', team: 'BUF', lat: 42.7738, long: -78.7870, type: 'Outdoor', field: 'Turf' },
    CAR: { id: 'CAR', name: 'Bank of America Stadium', city: 'Charlotte', state: 'NC', team: 'CAR', lat: 35.2258, long: -80.8528, type: 'Outdoor', field: 'Turf' },
    CHI: { id: 'CHI', name: 'Soldier Field', city: 'Chicago', state: 'IL', team: 'CHI', lat: 41.8623, long: -87.6167, type: 'Outdoor', field: 'Grass' },
    CIN: { id: 'CIN', name: 'Paycor Stadium', city: 'Cincinnati', state: 'OH', team: 'CIN', lat: 39.0955, long: -84.5161, type: 'Outdoor', field: 'Turf' },
    CLE: { id: 'CLE', name: 'Cleveland Browns Stadium', city: 'Cleveland', state: 'OH', team: 'CLE', lat: 41.5061, long: -81.6995, type: 'Outdoor', field: 'Grass' },
    DAL: { id: 'DAL', name: 'AT&T Stadium', city: 'Arlington', state: 'TX', team: 'DAL', lat: 32.7473, long: -97.0945, type: 'Retractable', field: 'Turf' },
    DEN: { id: 'DEN', name: 'Empower Field at Mile High', city: 'Denver', state: 'CO', team: 'DEN', lat: 39.7439, long: -105.0201, type: 'Outdoor', field: 'Grass' },
    DET: { id: 'DET', name: 'Ford Field', city: 'Detroit', state: 'MI', team: 'DET', lat: 42.3400, long: -83.0456, type: 'Dome', field: 'Turf' },
    GB: { id: 'GB', name: 'Lambeau Field', city: 'Green Bay', state: 'WI', team: 'GB', lat: 44.5013, long: -88.0619, type: 'Outdoor', field: 'Hybrid' },
    HOU: { id: 'HOU', name: 'NRG Stadium', city: 'Houston', state: 'TX', team: 'HOU', lat: 29.6847, long: -95.4107, type: 'Retractable', field: 'Turf' },
    IND: { id: 'IND', name: 'Lucas Oil Stadium', city: 'Indianapolis', state: 'IN', team: 'IND', lat: 39.7601, long: -86.1639, type: 'Retractable', field: 'Turf' },
    JAX: { id: 'JAX', name: 'EverBank Stadium', city: 'Jacksonville', state: 'FL', team: 'JAX', lat: 30.3240, long: -81.6373, type: 'Outdoor', field: 'Grass' },
    KC: { id: 'KC', name: 'Arrowhead Stadium', city: 'Kansas City', state: 'MO', team: 'KC', lat: 39.0489, long: -94.4839, type: 'Outdoor', field: 'Grass' },
    LAC: { id: 'LAC', name: 'SoFi Stadium', city: 'Inglewood', state: 'CA', team: 'LAC', lat: 33.9534, long: -118.3390, type: 'Dome', field: 'Turf' },
    LAR: { id: 'LAR', name: 'SoFi Stadium', city: 'Inglewood', state: 'CA', team: 'LAR', lat: 33.9534, long: -118.3390, type: 'Dome', field: 'Turf' },
    LV: { id: 'LV', name: 'Allegiant Stadium', city: 'Las Vegas', state: 'NV', team: 'LV', lat: 36.0909, long: -115.1833, type: 'Dome', field: 'Grass' },
    MIA: { id: 'MIA', name: 'Hard Rock Stadium', city: 'Miami Gardens', state: 'FL', team: 'MIA', lat: 25.9580, long: -80.2389, type: 'Outdoor', field: 'Grass' },
    MIN: { id: 'MIN', name: 'U.S. Bank Stadium', city: 'Minneapolis', state: 'MN', team: 'MIN', lat: 44.9735, long: -93.2575, type: 'Dome', field: 'Turf' },
    NE: { id: 'NE', name: 'Gillette Stadium', city: 'Foxborough', state: 'MA', team: 'NE', lat: 42.0909, long: -71.2643, type: 'Outdoor', field: 'Turf' },
    NO: { id: 'NO', name: 'Caesars Superdome', city: 'New Orleans', state: 'LA', team: 'NO', lat: 29.9511, long: -90.0812, type: 'Dome', field: 'Turf' },
    NYG: { id: 'NYG', name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', team: 'NYG', lat: 40.8128, long: -74.0742, type: 'Outdoor', field: 'Turf' },
    NYJ: { id: 'NYJ', name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', team: 'NYJ', lat: 40.8128, long: -74.0742, type: 'Outdoor', field: 'Turf' },
    PHI: { id: 'PHI', name: 'Lincoln Financial Field', city: 'Philadelphia', state: 'PA', team: 'PHI', lat: 39.9008, long: -75.1675, type: 'Outdoor', field: 'Grass' },
    PIT: { id: 'PIT', name: 'Acrisure Stadium', city: 'Pittsburgh', state: 'PA', team: 'PIT', lat: 40.4468, long: -80.0158, type: 'Outdoor', field: 'Grass' },
    SEA: { id: 'SEA', name: 'Lumen Field', city: 'Seattle', state: 'WA', team: 'SEA', lat: 47.5952, long: -122.3316, type: 'Outdoor', field: 'Turf' },
    SF: { id: 'SF', name: 'Levi\'s Stadium', city: 'Santa Clara', state: 'CA', team: 'SF', lat: 37.4033, long: -121.9702, type: 'Outdoor', field: 'Grass' },
    TB: { id: 'TB', name: 'Raymond James Stadium', city: 'Tampa', state: 'FL', team: 'TB', lat: 27.9759, long: -82.5029, type: 'Outdoor', field: 'Grass' },
    TEN: { id: 'TEN', name: 'Nissan Stadium', city: 'Nashville', state: 'TN', team: 'TEN', lat: 36.1665, long: -86.7713, type: 'Outdoor', field: 'Turf' },
    WAS: { id: 'WAS', name: 'Northwest Stadium', city: 'Landover', state: 'MD', team: 'WAS', lat: 38.9076, long: -76.8645, type: 'Outdoor', field: 'Grass' },
};
