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
            <div className={`relative rounded-3xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-8 md:p-12 shadow-2xl overflow-hidden`}>
                {/* Glow Effect */}
                <div className={`absolute top-0 right-0 w-64 h-64 ${bgColor} blur-[150px] opacity-20 pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2`} />

                <div className="grid md:grid-cols-[1fr_2fr] gap-8 items-center relative z-10">

                    {/* Gauge Visualization */}
                    <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-zinc-800" />
                                <circle
                                    cx="80"
                                    cy="80"
                                    r="70"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={440}
                                    strokeDashoffset={440 - (440 * confidence) / 100}
                                    className={`${color} transition-all duration-1000 ease-out`}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-black ${color}`}>{confidence}%</span>
                                <span className="text-zinc-500 text-xs uppercase font-mono mt-1">Confidence</span>
                            </div>
                        </div>
                        <div className={`mt-4 px-6 py-2 rounded-full font-black text-xl tracking-widest uppercase border ${borderColor} ${color} bg-zinc-950`}>
                            {isBet ? 'BET IT' : 'FADE IT'}
                        </div>
                    </div>

                    {/* Verdict Text */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-xl ${bgColor} bg-opacity-10 border ${borderColor} border-opacity-30`}>
                                {isBet ? <DollarSign className={`w-8 h-8 ${color}`} /> : <AlertTriangle className={`w-8 h-8 ${color}`} />}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">THE BOOKIE'S VERDICT</h2>
                                <p className="text-zinc-400 text-sm font-mono mt-1">Cross-referencing {dataPoints.length} data vectors...</p>
                            </div>
                        </div>

                        <p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light border-l-4 border-zinc-700 pl-6 py-1">
                            {content}
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {dataPoints.map((point, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono uppercase">
                                    <div className={`w-1.5 h-1.5 rounded-full ${bgColor}`} /> {point}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
