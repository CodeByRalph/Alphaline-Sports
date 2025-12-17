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
                // New Sportradar Integration
                // Defaulting to 2025 Week 15 for demo purposes if not specified
                // Try to resolve team from player map or input (simplification for demo)
                const teamMap: Record<string, string> = {
                    'Lamar Jackson': 'BAL',
                    'Josh Allen': 'BUF',
                    'Patrick Mahomes': 'KC',
                    'Kyren Williams': 'LAR',
                    'Christian McCaffrey': 'SF',
                    'Tyreek Hill': 'MIA',
                    'CeeDee Lamb': 'DAL',
                    'Justin Jefferson': 'MIN'
                };

                // If the frontend sends 'team' in the body, use it. Otherwise, try map.
                const inputBody = await request.clone().json();
                const teamAlias = inputBody.team || teamMap[player] || 'BAL'; // Fallback to BAL for demo safety

                const { ScoutPacketAssembler } = await import('@/app/lib/scout-packet/assembler');
                const packet = await ScoutPacketAssembler.create(2025, 15, teamAlias);

                if (packet) {
                    const nextGame = packet.meta.opponent ? `vs ${packet.meta.opponent}` : 'Unresolved Matchup';

                    responseData = {
                        title: 'Scout Packet (Sportradar v1)',
                        content: `Generated packet for ${packet.meta.team} ${nextGame}. Offense Identity: ${packet.team_identity_tendencies.offensive_identity || 'N/A'}.`,
                        confidence: 95,
                        dataPoints: [
                            `Trend: ${packet.team_identity_tendencies.offensive_identity}`,
                            `Opponent: ${packet.meta.opponent || 'N/A'}`,
                            `Freshness: ${new Date(packet.meta.data_freshness_timestamp).toLocaleTimeString()}`
                        ],
                        // Full packet hidden in debug or extended view? 
                        // For now, we return the standard structure but maybe attach the full packet as raw data if the frontend supported it.
                        // We will log it for verification.
                    };
                    console.log('Generated Scout Packet:', JSON.stringify(packet, null, 2));
                } else {
                    responseData = {
                        title: 'Scout Report (Failed)',
                        content: 'Could not generate scout packet.',
                        confidence: 0,
                        dataPoints: ['Error']
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
