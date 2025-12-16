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
        <div className={`rounded-xl border ${getBorderColor()} bg-zinc-900/50 backdrop-blur-md p-6 flex flex-col gap-4 shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
                {getIcon()}
                <div>
                    <h3 className="font-bold text-lg text-zinc-100 uppercase tracking-wide">{role}</h3>
                    <p className="text-zinc-400 text-xs uppercase tracking-wider">{title}</p>
                </div>
                <div className="ml-auto text-xs font-mono text-zinc-500">{confidence}% CONF</div>
            </div>

            <p className="text-zinc-300 text-sm leading-relaxed flex-grow">
                {content}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto pt-4">
                {dataPoints.map((point, i) => (
                    <span key={i} className="px-2 py-1 bg-zinc-800/80 rounded-full text-[10px] text-zinc-400 font-mono uppercase border border-zinc-700">
                        {point}
                    </span>
                ))}
            </div>
        </div>
    );
};
