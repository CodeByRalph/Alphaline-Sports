import { NextResponse } from 'next/server';
import { AgentRole } from '@/app/types';
import { getPlayerLookingGlass } from '@/app/lib/rapidapi';
import { ScoutAgent } from '@/app/lib/ai/scout';
import { ScoutPacketAssembler } from '@/app/lib/scout-packet/assembler';
import { getCurrentNFLSeasonContext } from '@/app/lib/scout-packet/season-calendar';

export async function POST(request: Request) {
    // 1. Parse Request Body (Once)
    const body = await request.json();
    const { player, prop, agent }: { player: string; prop: string; agent: AgentRole } = body;
    const teamOverride = body.team; // Optional team alias

    try {
        // Fetch Live Data (Legacy Context for other agents)
        const stats = await getPlayerLookingGlass(player);
        const nextGame = stats?.nextGame;

        switch (agent) {
            case 'scout':
                // --- Scout Agent Flow ---
                const teamMap: Record<string, string> = {
                    'Lamar Jackson': 'BAL', 'Josh Allen': 'BUF', 'Patrick Mahomes': 'KC',
                    'Kyren Williams': 'LAR', 'Christian McCaffrey': 'SF', 'Tyreek Hill': 'MIA',
                    'CeeDee Lamb': 'DAL', 'Justin Jefferson': 'MIN', 'Dak Prescott': 'DAL'
                };

                // Fallback Logic: Override -> Map -> Legacy Stats Team -> Default
                const teamAlias = teamOverride || teamMap[player] || stats?.team || 'BAL';

                // Assemble Packet
                const lineValue = Number(body.line || body.value || 0);

                // Get dynamic season context
                const context = getCurrentNFLSeasonContext();

                const packet = await ScoutPacketAssembler.create({
                    playerName: player,
                    propLine: { value: lineValue, type: prop as any }, // Prop parsing needs improvement strictly speaking but OK for demo
                    season: context.season,
                    week: context.week,
                    teamAlias
                });

                // Analyze with AI
                const analysis = await ScoutAgent.analyze(packet);

                return NextResponse.json({
                    title: 'Scout Report',
                    content: analysis.analysis,
                    confidence: analysis.confidence * 10, // Scale 0-100
                    dataPoints: analysis.key_factors,
                    // Full packet attached for debug/frontend
                    packet: packet
                });

            case 'insider':
                await new Promise((resolve) => setTimeout(resolve, 1500));
                const insiderContext = nextGame
                    ? `Sources near the ${stats?.team} facility suggest a gameplan focused on exploiting the ${nextGame.opponent}'s secondary.`
                    : `Rumors suggest a heavy workload this week.`;

                return NextResponse.json({
                    title: 'Locker Room Intel',
                    content: `${insiderContext} Injury reports are clean for ${player}, but the ${nextGame?.opponent || 'Opponent'} defense is banged up at linebacker.`,
                    confidence: 85,
                    dataPoints: ['Practice: Full Cohesion', `Opponent: ${nextGame?.opponent || 'Unknown'}`, 'Gameplan: Aggressive'],
                });

            case 'meteorologist':
                await new Promise((resolve) => setTimeout(resolve, 1500));
                const weather = nextGame?.weather || 'Dome (Indoor)';
                const location = nextGame?.location || 'Unknown Venue';

                return NextResponse.json({
                    title: 'Forecast & Conditions',
                    content: `Kickoff at ${location} will see conditions: ${weather}. ${weather.includes('Rain') || weather.includes('Snow') || weather.includes('Wind') ? 'This could impact passing efficiency.' : 'Perfect conditions for offense.'}`,
                    confidence: 95,
                    dataPoints: [`Venue: ${location}`, `Conditions: ${weather}`, 'Impact: Neutral'],
                });

            case 'bookie':
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const bookieContext = nextGame ? `facing ${nextGame.opponent}` : 'in this matchup';

                return NextResponse.json({
                    title: 'The Verdict',
                    content: `Synthesizing the data: ${player} is ${bookieContext}. The weather (${nextGame?.weather || 'N/A'}) and defensive matchup (${nextGame?.oppDefenseRank || 'N/A'}) suggest a favorable spot. Sharp money is tracking towards the implied direction.`,
                    confidence: 88,
                    dataPoints: ['Sharp Action: High', 'Model skew: Positive', 'Public: Split'],
                });

            default:
                return NextResponse.json({ error: 'Invalid Agent' }, { status: 400 });
        }
    } catch (error) {
        console.error("Analysis Error", error);
        return NextResponse.json({
            title: 'Agent Offline',
            content: 'Connection lost to the neural network.',
            confidence: 0,
            dataPoints: ['Error'],
        }, { status: 500 });
    }
}
