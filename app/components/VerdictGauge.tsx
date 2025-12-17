import React from 'react';
import { AgentReport } from '@/app/types';
import { DollarSign, AlertTriangle } from 'lucide-react';

interface VerdictGaugeProps {
    report: AgentReport;
}

export const VerdictGauge: React.FC<VerdictGaugeProps> = ({ report }) => {
    const { status, confidence, content, dataPoints } = report;

    if (status !== 'completed') return null;

    const isBet = confidence > 75;
    const color = isBet ? 'text-green-500' : 'text-red-500';
    const bgColor = isBet ? 'bg-green-500' : 'bg-red-500';
    const borderColor = isBet ? 'border-green-500' : 'border-red-500';

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="w-full animate-in fade-in zoom-in duration-500">
                {/* Gauge Visualization */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="96" cy="96" r="88" strokeWidth="8" stroke="#18181b" fill="transparent" />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                strokeWidth="8"
                                strokeLinecap="round"
                                fill="transparent"
                                strokeDasharray={552} // 2 * PI * 88
                                strokeDashoffset={552 - (552 * confidence) / 100}
                                className={`${confidence > 50 ? 'text-brand-green' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                stroke="currentColor"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-black text-white tracking-tighter shadow-black drop-shadow-lg">{confidence}</span>
                            <span className="text-xs uppercase font-mono text-zinc-500 tracking-widest mt-1">Confidence</span>
                        </div>
                    </div>

                    <div className={`mt-6 px-4 py-1.5 border border-dashed text-lg font-mono uppercase tracking-widest ${isBet ? 'border-brand-green text-brand-green bg-brand-green/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                        {isBet ? 'RECOMMENDATION: BET' : 'RECOMMENDATION: FADE'}
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-left space-y-4">
                    <h2 className="text-2xl font-black italic text-zinc-100">THE VERDICT</h2>
                    <p className="text-md text-zinc-400 font-mono leading-relaxed border-l border-brand-cyan/20 pl-4">
                        {content}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {dataPoints.map((point, i) => (
                            <span key={i} className="px-2 py-0.5 bg-zinc-800/50 text-[10px] font-mono uppercase text-zinc-400 border border-zinc-700">
                                {point}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
