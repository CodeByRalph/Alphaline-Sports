
import fs from 'fs';
import path from 'path';
import { MasterPacket, BetContext } from '../../types';

const LEDGER_PATH = path.join(process.cwd(), 'app/data/ledger.jsonl');

export interface LedgerEntry {
    id: string;
    timestamp: string;
    bet: BetContext;
    analysis: MasterPacket['analysis'];
    actual_outcome?: 'Win' | 'Loss' | 'Push' | 'Void';
    pnl?: number;
}

export async function logPrediction(bet: BetContext, packet: MasterPacket) {
    // Log projection for tracking accuracy

    const entry: LedgerEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        bet,
        analysis: packet.analysis
    };

    try {
        await fs.promises.appendFile(LEDGER_PATH, JSON.stringify(entry) + '\n', 'utf8');
        console.log(`[Ledger] Recorded prediction for ${bet.playerName}`);
    } catch (err) {
        console.error("[Ledger] Failed to record prediction:", err);
    }
}

export async function getLedger(): Promise<LedgerEntry[]> {
    try {
        if (!fs.existsSync(LEDGER_PATH)) return [];
        const content = await fs.promises.readFile(LEDGER_PATH, 'utf8');
        return content.trim().split('\n').map(line => JSON.parse(line));
    } catch (err) {
        console.error("[Ledger] Failed to read ledger:", err);
        return [];
    }
}
