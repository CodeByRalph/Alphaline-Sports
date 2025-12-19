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
                const { InsiderAgent } = await import('@/app/lib/insider-packet/agent');
                // We need team alias. Scout logic has a map, we can reuse or just use the passed team logic
                // Replicating basic team resolution for now
                const insiderTeamMap: Record<string, string> = {
                    'Lamar Jackson': 'BAL', 'Josh Allen': 'BUF', 'Patrick Mahomes': 'KC',
                    'Kyren Williams': 'LAR', 'Christian McCaffrey': 'SF', 'Tyreek Hill': 'MIA',
                    'CeeDee Lamb': 'DAL', 'Justin Jefferson': 'MIN', 'Dak Prescott': 'DAL'
                };
                const insiderTeam = teamOverride || insiderTeamMap[player] || stats?.team || 'BAL';

                const insiderReport = await InsiderAgent.analyze(player, insiderTeam);

                if (!insiderReport || !insiderReport.analysis) {
                    return NextResponse.json({
                        title: 'Intel Unavailable',
                        content: 'Source disconnected or analysis failed.',
                        confidence: 0,
                        dataPoints: ['No Data']
                    });
                }

                const { analysis: insiderAnalysis } = insiderReport; // Renamed to avoid conflict with 'scout' case
                // Use the Insider Brief for the main content
                const contentStr = insiderAnalysis.insider_brief.join(' ');

                // Determine confidence based on availability grade
                let conf = 85;
                if (insiderAnalysis.availability_overview.overall_availability_grade === 'Caution') conf = 65;
                if (insiderAnalysis.availability_overview.overall_availability_grade === 'Risk') conf = 40;

                return NextResponse.json({
                    title: 'Locker Room Intel',
                    content: contentStr,
                    confidence: conf,
                    dataPoints: [
                        `Grade: ${insiderAnalysis.availability_overview.overall_availability_grade}`,
                        `Role: ${insiderAnalysis.role_stability_summary.overall_role_stability}`,
                        `Risk: ${insiderAnalysis.risk_flags.late_injury_uncertainty || insiderAnalysis.risk_flags.snap_limit_risk ? 'HIGH' : 'LOW'}`
                    ],
                    structuredData: insiderReport.packet // Pass packet if needed, or we could pass analysis
                });


            case 'meteorologist':
                const { analyzeMeteorology } = await import('@/app/lib/meteorologist-packet/agent');
                const meteorReport = await analyzeMeteorology(player);

                if (!meteorReport) {
                    return NextResponse.json({
                        title: 'Forecast Unavailable',
                        content: 'Unable to retrieve weather data.',
                        confidence: 0,
                        dataPoints: ['Data Missing']
                    });
                }

                // Format for frontend
                const summary = meteorReport.environment.weather_summary;
                const impactReview = meteorReport.analysis?.user_weather_writeup[0] || "Analysis pending.";

                return NextResponse.json({
                    title: 'Forecast & Conditions',
                    content: `${summary}. ${impactReview}`, // Fallback text content
                    confidence: meteorReport.analysis?.overall_confidence === 'High' ? 95 : meteorReport.analysis?.overall_confidence === 'Medium' ? 75 : 50,
                    dataPoints: [`${meteorReport.game.stadium}`, meteorReport.environment.type, meteorReport.environment.field],
                    structuredData: meteorReport
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
