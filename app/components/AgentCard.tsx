import React from 'react';
import { AgentReport } from '@/app/types';
import { Brain, FileText, CloudRain, ShieldCheck } from 'lucide-react';

interface AgentCardProps {
    report: AgentReport;
}

export const AgentCard: React.FC<AgentCardProps> = ({ report }) => {
    const { role, title, status, content, dataPoints, confidence } = report;

    const getIcon = () => {
        switch (role) {
            case 'scout': return <Brain className="text-blue-500 w-6 h-6" />;
            case 'insider': return <ShieldCheck className="text-purple-500 w-6 h-6" />;
            case 'meteorologist': return <CloudRain className="text-orange-500 w-6 h-6" />;
            default: return <FileText className="text-gray-500 w-6 h-6" />;
        }
    };

    const getBorderColor = () => {
        switch (role) {
            case 'scout': return 'border-blue-500/30';
            case 'insider': return 'border-purple-500/30';
            case 'meteorologist': return 'border-orange-500/30';
            default: return 'border-zinc-800';
        }
    };

    // Extract game context from structured data for display
    const getGameContext = (): { team: string; opponent: string; isHome: boolean; date?: string } | null => {
        const data = report.structuredData;
        if (!data) return null;

        // Scout packet format
        if (data.packet?.meta) {
            return {
                team: data.packet.meta.team,
                opponent: data.packet.meta.opponent || 'TBD',
                isHome: data.packet.meta.home_away === 'home',
                date: data.packet.meta.prop_line?.type ? undefined : undefined
            };
        }

        // Insider packet format (passed directly or nested)
        if (data.game_context) {
            return {
                team: data.game_context.team,
                opponent: data.game_context.opponent,
                isHome: data.game_context.home_away === 'home',
                date: data.game_context.kickoff_time
            };
        }

        // Meteorologist format
        if (data.game) {
            const location = data.game.location || '';
            return {
                team: data.player?.team || 'Team',
                opponent: data.game.opponent,
                isHome: location.toLowerCase().includes('home'),
                date: undefined
            };
        }

        return null;
    };

    // If working, show minimal indicator or static text? 
    // The prompt requested static styling. Let's keep the internal content logic but strip the container styling to match parent.
    // Actually the parent handles the container/header. The AgentCard should now just fill the body.

    if (status === 'working') {
        return (
            <div className="h-full flex flex-col justify-center items-center text-zinc-600 font-mono text-xs animate-pulse">
                <p>Establishing Uplink...</p>
                <div className="w-1/2 h-0.5 bg-zinc-800 mt-2 overflow-hidden">
                    <div className="w-full h-full bg-zinc-600 animate-slide-fast" />
                </div>
            </div>
        );
    }

    if (status === 'idle') {
        // Show static placeholders as requested
        return (
            <div className="h-full font-mono text-xs text-zinc-600 flex flex-col gap-2">
                <div className="flex justify-between border-b border-zinc-900 pb-1">
                    <span>STATUS</span>
                    <span className="text-zinc-500">STANDBY</span>
                </div>
                {role === 'scout' && (
                    <>
                        <div className="flex justify-between"><span>GAMES_INDEXED</span> <span>14,204</span></div>
                        <div className="flex justify-between"><span>ACTIVE_PLAYERS</span> <span>1,642</span></div>
                        <div className="flex justify-between"><span>DATA_STREAM</span> <span>CONNECTED</span></div>
                    </>
                )}
                {role === 'insider' && (
                    <>
                        <div className="truncate">› Schefter: 'Source confirms active...'</div>
                        <div className="truncate">› Rapoport: 'Monitor pre-game warmup...'</div>
                        <div className="truncate">› Team: 'Elevated from practice squad...'</div>
                    </>
                )}
                {role === 'meteorologist' && (
                    <>
                        <div className="flex justify-between"><span>WIND_SPEED</span> <span>-- MPH</span></div>
                        <div className="flex justify-between"><span>PRECIP_CHANCE</span> <span>0%</span></div>
                        <div className="flex justify-between"><span>STADIUM_TYPE</span> <span>DOME</span></div>
                    </>
                )}
            </div>
        )
    }

    // Active State - Simplified (No Card Container, Just Content)
    return (
        <div className="h-full flex flex-col gap-3 font-mono text-xs">
            {/* Game Context Badge */}
            {getGameContext() && (
                <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded text-[10px]">
                    <span className="text-zinc-500">MATCHUP:</span>
                    <span className="text-cyan-500 font-bold">{getGameContext()?.team}</span>
                    <span className="text-zinc-600">{getGameContext()?.isHome ? 'vs' : '@'}</span>
                    <span className="text-zinc-300">{getGameContext()?.opponent}</span>
                </div>
            )}

            {/* Data Feed Content */}
            <div className="flex-grow text-zinc-400 overflow-y-auto custom-scrollbar space-y-2">
                {role === 'meteorologist' && report.structuredData?.analysis ? (
                    <div className="flex flex-col gap-3">
                        <div className="border-b border-white/5 pb-2">
                            <div className="text-orange-500 font-bold uppercase tracking-wider">{report.structuredData.game.stadium}</div>
                            <div className="flex gap-4 text-[10px] text-zinc-500 uppercase mt-1">
                                <span>{report.structuredData.environment.type}</span>
                                <span>{report.structuredData.environment.field}</span>
                            </div>
                        </div>
                        <div className="text-zinc-300 pl-2 border-l border-orange-500/50">
                            {report.structuredData.environment.weather_summary}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {Object.entries(report.structuredData.analysis.impact_scores).map(([key, val]) => (
                                <div key={key} className="flex justify-between bg-zinc-900 px-2 py-1 rounded">
                                    <span className="text-[9px] uppercase text-zinc-600">{key.replace(/_/g, ' ')}</span>
                                    <span className={`text-[10px] font-bold ${Number(val) > 0.6 ? 'text-red-500' : 'text-green-500'}`}>{String(val)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {content.split('\n').map((line, i) => (
                            <p key={i} className="leading-relaxed">
                                <span className="text-cyan-500/30 mr-2">›</span>
                                {line}
                            </p>
                        ))}
                    </>
                )}
            </div>

            {/* Tags Footer */}
            <div className="flex flex-wrap gap-1 pt-2 border-t border-zinc-900">
                {dataPoints.map((point, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-zinc-900 text-[9px] text-zinc-500 uppercase rounded">
                        #{point.replace(/\s/g, '_')}
                    </span>
                ))}
            </div>
        </div>
    );
};
