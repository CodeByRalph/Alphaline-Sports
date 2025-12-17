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

            {/* Data Feed Content */}
            <div className="flex-grow font-mono text-xs leading-6 text-zinc-400">
                <span className="text-brand-cyan/50 mr-2">{'>'}</span>
                {content}
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
