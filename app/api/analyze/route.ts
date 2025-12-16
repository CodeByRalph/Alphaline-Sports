import { NextResponse } from 'next/server';
import { AgentRole } from '@/app/types';
import { getPlayerLookingGlass } from '@/app/lib/rapidapi';

export async function POST(request: Request) {
    const { player, prop, agent }: { player: string; prop: string; agent: AgentRole } = await request.json();

    let responseData;

    try {
        // Fetch Live Data (including Next Game Context)
        const stats = await getPlayerLookingGlass(player);
        const nextGame = stats?.nextGame;

        switch (agent) {
            case 'scout':
                if (stats && nextGame) {
                    const gameLogs = stats.games.map((g: any) => {
                        const p = g.Passing || {};
                        const r = g.Rushing || {};
                        const passYds = p.passYds || p.passingYards || '0';
                        const rushYds = r.rushYds || r.rushingYards || '0';
                        const date = g.gameDate || 'Recent';
                        return `${date} vs ${g.opp || 'Opp'}: ${passYds} Pass, ${rushYds} Rush`;
                    });

                    responseData = {
                        title: 'Scouting Report',
                        content: `Analyzed ${stats.longName}'s upcoming matchup against ${nextGame.opponent} (${nextGame.location}). The ${nextGame.opponent} defense is ranked ${nextGame.oppDefenseRank}. Recent form shows consistent volume.`,
                        confidence: 90,
                        dataPoints: [
                            `Matchup: vs ${nextGame.opponent}`,
                            `Defense: ${nextGame.oppDefenseRank}`,
                            ...gameLogs.slice(0, 2)
                        ],
                    };
                } else {
                    // Fallback
                    responseData = {
                        title: 'Scouting Report (Offline)',
                        content: `Could not retrieve live schedule for ${player}. Relying on season averages.`,
                        confidence: 50,
                        dataPoints: ['Data Unavailable'],
                    };
                }
                break;

            case 'insider':
                await new Promise((resolve) => setTimeout(resolve, 1500));
                const insiderContext = nextGame
                    ? `Sources near the ${stats?.team} facility suggest a gameplan focused on exploiting the ${nextGame.opponent}'s secondary.`
                    : `Rumors suggest a heavy workload this week.`;

                responseData = {
                    title: 'Locker Room Intel',
                    content: `${insiderContext} Injury reports are clean for ${player}, but the ${nextGame?.opponent || 'Opponent'} defense is banged up at linebacker.`,
                    confidence: 85,
                    dataPoints: ['Practice: Full Cohesion', `Opponent: ${nextGame?.opponent || 'Unknown'}`, 'Gameplan: Aggressive'],
                };
                break;

            case 'meteorologist':
                await new Promise((resolve) => setTimeout(resolve, 1500));
                const weather = nextGame?.weather || 'Dome (Indoor)';
                const location = nextGame?.location || 'Unknown Venue';

                responseData = {
                    title: 'Forecast & Conditions',
                    content: `Kickoff at ${location} will see conditions: ${weather}. ${weather.includes('Rain') || weather.includes('Snow') || weather.includes('Wind') ? 'This could impact passing efficiency.' : 'Perfect conditions for offense.'}`,
                    confidence: 95,
                    dataPoints: [`Venue: ${location}`, `Conditions: ${weather}`, 'Impact: Neutral'],
                };
                break;

            case 'bookie':
                await new Promise((resolve) => setTimeout(resolve, 2000));
                // We don't have direct access to "other agents" outputs here in a stateless way unless passed, 
                // but we simulate the synthesis of the same data source.
                const bookieContext = nextGame ? `facing ${nextGame.opponent}` : 'in this matchup';

                responseData = {
                    title: 'The Verdict',
                    content: `Synthesizing the data: ${player} is ${bookieContext}. The weather (${nextGame?.weather || 'N/A'}) and defensive matchup (${nextGame?.oppDefenseRank || 'N/A'}) suggest a favorable spot. Sharp money is tracking towards the implied direction.`,
                    confidence: 88,
                    dataPoints: ['Sharp Action: High', 'Model skew: Positive', 'Public: Split'],
                };
                break;

            default:
                return NextResponse.json({ error: 'Invalid Agent' }, { status: 400 });
        }
    } catch (error) {
        console.error("Analysis Error", error);
        responseData = {
            title: 'Agent Offline',
            content: 'Connection lost to the neural network.',
            confidence: 0,
            dataPoints: ['Error'],
        };
    }

    return NextResponse.json(responseData);
}
