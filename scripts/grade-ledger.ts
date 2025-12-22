
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const LEDGER_PATH = path.join(process.cwd(), 'app/data/ledger.jsonl');

interface LedgerEntry {
    id: string;
    timestamp: string;
    bet: {
        playerName: string;
        propType: string;
        propLine: number;
        propSide: 'Over' | 'Under';
    };
    decision: {
        recommendation: 'Over' | 'Under' | 'No Edge';
        confidence_score: number;
    };
    actual_outcome?: 'Win' | 'Loss' | 'Push';
}

async function gradeLedger() {
    if (!fs.existsSync(LEDGER_PATH)) {
        console.log("No ledger found at", LEDGER_PATH);
        return;
    }

    const content = fs.readFileSync(LEDGER_PATH, 'utf8');
    const entries: LedgerEntry[] = content.trim().split('\n').map(line => JSON.parse(line));
    const ungraded = entries.filter(e => !e.actual_outcome && e.decision.recommendation !== 'No Edge');

    if (ungraded.length === 0) {
        console.log("All active bets are graded! (or only 'No Edge' records exist)");
        printScorecard(entries);
        return;
    }

    console.log(`\nFound ${ungraded.length} ungraded bets. Let's resolve them.`);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const updatedEntries = [...entries];

    for (const entry of ungraded) {
        console.log(`\n-----------------------------------`);
        console.log(`Bet: ${entry.bet.playerName} - ${entry.bet.propType} (${entry.bet.propSide} ${entry.bet.propLine})`);
        console.log(`Prediction: ${entry.decision.recommendation} (Conf: ${entry.decision.confidence_score})`);

        await new Promise<void>(resolve => {
            rl.question('Did this Win (w), Lose (l), or Push (p)? ', (ans) => {
                const outcome = ans.toLowerCase().startsWith('w') ? 'Win' :
                    ans.toLowerCase().startsWith('l') ? 'Loss' : 'Push';

                // Update in memory
                const index = updatedEntries.findIndex(e => e.id === entry.id);
                updatedEntries[index].actual_outcome = outcome;
                resolve();
            });
        });
    }

    rl.close();

    // Save back to file
    fs.writeFileSync(LEDGER_PATH, updatedEntries.map(e => JSON.stringify(e)).join('\n') + '\n');

    console.log("\n✅ Ledger Updated!");
    printScorecard(updatedEntries);
}

function printScorecard(entries: LedgerEntry[]) {
    const graded = entries.filter(e => e.actual_outcome && e.decision.recommendation !== 'No Edge');
    const wins = graded.filter(e => e.actual_outcome === 'Win').length;
    const losses = graded.filter(e => e.actual_outcome === 'Loss').length;
    const pushes = graded.filter(e => e.actual_outcome === 'Push').length;
    const total = wins + losses;

    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) + '%' : '0.0%';

    console.log("\n=== 🏆 TRUST SCORECARD ===");
    console.log(`Total Graded Bets: ${graded.length}`);
    console.log(`Wins: ${wins} | Losses: ${losses} | Pushes: ${pushes}`);
    console.log(`--------------------------`);
    console.log(`WIN RATE: ${winRate}`);
    console.log(`--------------------------`);
}

gradeLedger();
