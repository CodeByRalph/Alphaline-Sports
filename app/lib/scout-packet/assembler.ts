
import { ScoutPacket } from './types';
import * as Fetcher from './fetcher';
import { buildMeta, buildIdentityTendencies } from './builders/identity';
import { buildTeamOffense } from './builders/offense';
import { buildTeamDefense } from './builders/defense';
import { buildMatchupReality } from './builders/matchup';
import { buildPlayers } from './builders/players';
import { buildReliability } from './builders/others';

export interface PropLine {
    value: number;
    type: 'pass_yards' | 'rush_yards' | 'rec_yards' | 'touchdowns' | 'completions' | 'attempts' | 'receptions';
}

export interface CreateOptions {
    playerName?: string;
    propLine?: PropLine;
    season?: number;
    week?: number;
    teamAlias?: string; // Optional if playerName is provided
}

// Common team alias map for quick player lookup
const PLAYER_TEAM_MAP: Record<string, string> = {
    'dak prescott': 'DAL',
    'lamar jackson': 'BAL',
    'patrick mahomes': 'KC',
    'josh allen': 'BUF',
    'jalen hurts': 'PHI',
    'joe burrow': 'CIN',
    'kyren williams': 'LAR',
    'derrick henry': 'BAL',
    'jamarr chase': 'CIN',
    'ceedee lamb': 'DAL',
    'tyreek hill': 'MIA',
    'davante adams': 'NYJ',
    // Add more as needed
};

export class ScoutPacketAssembler {

    /**
     * Create a Scout Packet from player name + prop line OR team alias.
     */
    static async create(options: CreateOptions): Promise<ScoutPacket> {
        const season = options.season || 2025;
        const week = options.week || 15;

        // Resolve team from player name if not provided
        let teamAlias = options.teamAlias;
        let targetPlayerId: string | null = null;
        let targetPlayerName = options.playerName || null;

        if (options.playerName && !teamAlias) {
            // Try quick map first
            const normalizedName = options.playerName.toLowerCase().trim();
            teamAlias = PLAYER_TEAM_MAP[normalizedName];

            if (!teamAlias) {
                console.warn(`[Assembler] Player "${options.playerName}" not in quick map. Will search rosters.`);
                // Could implement cross-team search here, but expensive
                teamAlias = 'DAL'; // Default fallback
            }
        }

        teamAlias = teamAlias || 'BAL'; // Ultimate fallback

        console.log(`[Assembler] Creating packet for ${targetPlayerName || teamAlias} (Season ${season}, Week ${week})`);

        // 1. Resolve Game
        let resolvedGame = null;
        try {
            resolvedGame = await Fetcher.resolveGame(season, week, teamAlias);
        } catch (e) {
            console.warn(`[Assembler] Game resolution failed:`, e);
        }

        const finalOpponent = resolvedGame?.opponent_alias || null;
        const teamId = resolvedGame?.team_id || teamAlias;
        const oppId = resolvedGame?.opponent_id || null;

        // 2. Fetch Data (Sequential to respect Rate Limits)
        let teamStats = null;
        try {
            if (teamId) {
                teamStats = await Fetcher.getTeamSeasonStats(season, teamId);
            }
        } catch (e) { console.warn('Team stats fail', e); }

        let teamRoster = null;
        try {
            if (teamId) teamRoster = await Fetcher.getTeamRoster(teamId);
        } catch (e) { console.warn('Roster fail', e); }

        // Search for target player in roster
        if (targetPlayerName && teamRoster) {
            const match = Fetcher.searchPlayerInRoster(targetPlayerName, teamRoster);
            if (match) {
                targetPlayerId = match.player_id;
                console.log(`[Assembler] Found player: ${match.full_name} (${match.position})`);
            }
        }

        // Fetch Player Profile if we have a target player
        let playerProfile = null;
        if (targetPlayerId) {
            try {
                playerProfile = await Fetcher.getPlayerProfile(targetPlayerId);
            } catch (e) { console.warn('Player profile fail', e); }
        }

        let oppStats = null;
        if (oppId) {
            try {
                oppStats = await Fetcher.getTeamSeasonStats(season, oppId);
            } catch (e) { console.warn('Opponent stats fail', e); }
        }

        // 3. Build Components
        const meta = buildMeta(season, week, resolvedGame, teamAlias, targetPlayerName, options.propLine);
        const identity = buildIdentityTendencies(teamStats);
        const teamOffense = buildTeamOffense(teamStats);
        const teamDefense = buildTeamDefense(teamStats);
        const oppDefense = buildTeamDefense(oppStats);
        const matchup = buildMatchupReality(teamOffense, oppDefense);

        const reliability = buildReliability(teamStats);

        // Build players with focus on target player if available
        const players = buildPlayers(teamRoster, teamStats, [], playerProfile, targetPlayerName);

        // 4. Assemble
        const packet: ScoutPacket = {
            meta,
            team_identity_tendencies: identity,
            team_offense: teamOffense,
            team_defense: teamDefense,
            players,
            matchup_reality: matchup,
            reliability,
            missing_data: []
        };

        // 5. Populate missing_data
        packet.missing_data = this.findMissingPaths(packet);

        return packet;
    }

    private static findMissingPaths(obj: any, prefix = ''): string[] {
        let missing: string[] = [];
        if (obj === null || obj === undefined) return [prefix];

        if (Array.isArray(obj)) {
            // Don't iterate all array items to avoid spam, just check empty
            if (obj.length === 0 && prefix === 'players') missing.push('players (empty)');
            return missing;
        }

        if (typeof obj === 'object') {
            for (const key in obj) {
                const val = obj[key];
                const path = prefix ? `${prefix}.${key}` : key;
                if (val === null) {
                    missing.push(path);
                } else if (typeof val === 'object') {
                    missing = missing.concat(this.findMissingPaths(val, path));
                }
            }
        }
        return missing;
    }
}
