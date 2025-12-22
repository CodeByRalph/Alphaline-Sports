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

    if (status === 'working') {
        return (
            <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md p-6 relative overflow-hidden flex flex-col justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                <div className="z-10 text-zinc-400 font-mono text-sm animate-pulse">Running Analysis...</div>
            </div>
        );
    }

    if (status === 'idle') {
        return (
            <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 flex items-center justify-center">
                <span className="text-zinc-600 font-mono text-sm">Waiting for target...</span>
            </div>
        )
    }

    return (
        <div className={`h-full group relative rounded-sm border ${getBorderColor()} bg-brand-black/90 px-5 py-4 flex flex-col gap-4 shadow-xl transition-all duration-300 hover:border-opacity-100 border-opacity-40`}>

            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-dashed border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                    {getIcon()}
                    <div className="flex flex-col">
                        <h3 className="font-extrabold text-sm text-zinc-100 tracking-wider font-mono uppercase">{role}_AGENT</h3>
                        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-tight">ID: {title.replace(/\s/g, '_').toUpperCase()}</p>
                    </div>
                </div>

                {/* Confidence Stat */}
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${confidence > 75 ? 'bg-brand-green' : confidence > 50 ? 'bg-brand-cyan' : 'bg-brand-orange'} animate-pulse`} />
                    <span className="text-xs font-mono font-bold text-zinc-300">{confidence}%</span>
                </div>
            </div>

            {/* Game Context Badge - Shows which game is being analyzed */}
            {getGameContext() && (
                <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded text-[10px] font-mono">
                    <span className="text-zinc-500">ANALYZING:</span>
                    <span className="text-brand-cyan font-bold">{getGameContext()?.team}</span>
                    <span className="text-zinc-600">{getGameContext()?.isHome ? 'vs' : '@'}</span>
                    <span className="text-zinc-300">{getGameContext()?.opponent}</span>
                    {getGameContext()?.date && (
                        <span className="text-zinc-600 ml-auto">{getGameContext()?.date}</span>
                    )}
                </div>
            )}


            {/* Data Feed Content */}
            <div className="flex-grow font-mono text-xs leading-6 text-zinc-400 overflow-y-auto custom-scrollbar">
                {role === 'meteorologist' && report.structuredData?.analysis ? (
                    <div className="flex flex-col gap-3">
                        {/* Stadium Header */}
                        <div className="border-b border-white/5 pb-2 mb-1">
                            <div className="text-brand-orange text-xs font-bold uppercase tracking-wider">{report.structuredData.game.stadium}</div>
                            <div className="flex justify-between text-[10px] text-zinc-500 uppercase mt-1">
                                <span>{report.structuredData.environment.type}</span>
                                <span>{report.structuredData.environment.field}</span>
                            </div>
                        </div>

                        {/* Weather Summary */}
                        <div className="text-zinc-300 font-bold border-l-2 border-brand-orange pl-2">
                            {report.structuredData.environment.weather_summary}
                        </div>

                        {/* Bullet Points */}
                        <ul className="space-y-1 mt-1">
                            {report.structuredData.analysis.user_weather_writeup.map((line: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-brand-orange mt-1">›</span>
                                    <span className="text-zinc-400">{line}</span>
                                </li>
                            ))}
                        </ul>

                        {/* Impact Grid */}
                        <div className="grid grid-cols-2 gap-2 mt-2 bg-zinc-900/50 p-2 rounded border border-white/5">
                            {Object.entries(report.structuredData.analysis.impact_scores).map(([key, val]) => (
                                <div key={key} className="flex flex-col">
                                    <span className="text-[9px] uppercase text-zinc-600 mb-1">{key.replace(/_/g, ' ')}</span>
                                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${Number(val) > 0.6 ? 'bg-red-500' : Number(val) > 0.3 ? 'bg-yellow-500' : 'bg-brand-green'}`}
                                            style={{ width: `${Number(val) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <span className="text-brand-cyan/50 mr-2">{'>'}</span>
                        {content}
                    </>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-800/50">
                {dataPoints.map((point, i) => (
                    <span key={i} className="px-2 py-0.5 bg-zinc-900/50 rounded-xs text-[10px] text-zinc-500 font-mono uppercase border border-zinc-800 truncate max-w-full">
                        #{point.replace(/\s/g, '_')}
                    </span>
                ))}
            </div>
        </div>
    );
};
