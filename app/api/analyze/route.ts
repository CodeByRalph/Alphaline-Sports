import { NextResponse } from 'next/server';
import { AgentRole } from '@/app/types';

export async function POST(request: Request) {
    const { player, prop, agent }: { player: string; prop: string; agent: AgentRole } = await request.json();

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let responseData;

    switch (agent) {
        case 'scout':
            responseData = {
                title: 'Statistical Deep Dive',
                content: `${player} has averaged 305 passing yards in his last 4 games against this defensive scheme. Look for him to exploit the seam routes early. The secondary gives up 7.5 YPA.`,
                confidence: 85,
                dataPoints: ['Last 4 Avg: 305 Yds', 'Def Rank: 28th vs Pass', 'YPA Allowed: 7.5'],
            };
            break;

        case 'insider':
            responseData = {
                title: 'Touchdown Whisperer',
                content: `Sources say ${player} looked explosive in practice this week. The opposing starting safety is a game-time decision with a hamstring issue, which could open up deep balls.`,
                confidence: 78,
                dataPoints: ['Practice: Full Participant', 'Opp Safety: Quest (Hamstring)', 'Weather: Clear'],
            };
            break;

        case 'meteorologist':
            responseData = {
                title: 'Atmospheric Factors',
                content: `Game time temp is 45°F with 10mph crosswinds. This slightly favors the run game, but elite QBs like ${player} barely notice wind under 15mph. No precipitation expected.`,
                confidence: 90,
                dataPoints: ['Temp: 45°F', 'Wind: 10mph SW', 'Precip: 0%'],
            };
            break;

        case 'bookie':
            responseData = {
                title: 'The Final Verdict',
                content: `Money is pouring in on the OVER. With the Scout confirming volume and the Insider noting favorable matchups, the model projects ${player} to clear ${prop} by a significant margin.`,
                confidence: 88,
                dataPoints: ['Sharp Money: 65% on Over', 'Line Move: -110 to -125', 'Model Proj: +15% vs Line'],
            };
            break;

        default:
            return NextResponse.json({ error: 'Invalid Agent' }, { status: 400 });
    }

    return NextResponse.json(responseData);
}
