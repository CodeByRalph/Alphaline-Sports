import React, { useState } from 'react';
import { AgentReport } from '@/app/types';
import { DollarSign, AlertTriangle } from 'lucide-react';
import { StressTestButton } from './StressTestButton';
import { StressTestView } from './StressTestView';
import { MasterPacket } from '@/app/lib/master-packet/types';

interface VerdictGaugeProps {
    report: AgentReport;
    betContext?: {
        player: string;
        propType: string;
        line: string;
    };
}

export const VerdictGauge: React.FC<VerdictGaugeProps> = ({ report, betContext }) => {
    const { status, confidence, content, dataPoints, structuredData } = report;
    const [stressTestResult, setStressTestResult] = useState<any>(null);

    if (status !== 'completed') return null;

    // Use the actual projection from the LLM analysis, not just confidence
    const masterData = structuredData as MasterPacket;
    const projection = masterData?.analysis?.projection || 'Inconclusive';
    const isAboveLine = projection === 'Above Line';
    const color = isAboveLine ? 'text-green-500' : projection === 'Below Line' ? 'text-amber-500' : 'text-zinc-500';
    const bgColor = isAboveLine ? 'bg-green-500' : projection === 'Below Line' ? 'bg-amber-500' : 'bg-zinc-500';
    const borderColor = isAboveLine ? 'border-green-500' : projection === 'Below Line' ? 'border-amber-500' : 'border-zinc-500';

    // Stress Test Props
    const propId = betContext ? `${betContext.player}-${betContext.propType}-${betContext.line}`.replace(/\s+/g, '-').toLowerCase() : 'unknown-prop';
    const snapshotId = `snap-${propId}-${Math.floor(Date.now() / 3600000)}`; // Simple hourly snapshot ID for demo caching or stable ID if we had one
    const pick = isAboveLine ? `Over ${betContext?.line || ''} ${betContext?.propType || ''}` :
        projection === 'Below Line' ? `Under ${betContext?.line || ''} ${betContext?.propType || ''}` : 'No Bet';

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

                    <div className={`mt-6 px-4 py-1.5 border border-dashed text-lg font-mono uppercase tracking-widest ${isAboveLine ? 'border-brand-green text-brand-green bg-brand-green/10' : projection === 'Below Line' ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-zinc-500 text-zinc-500 bg-zinc-500/10'}`}>
                        {isAboveLine ? 'DATA SUPPORTS: ABOVE LINE' : projection === 'Below Line' ? 'DATA SUPPORTS: BELOW LINE' : 'DATA: INCONCLUSIVE'}
                    </div>

                    {/* Stress Test Feature - Prominent Placement */}
                    {confidence > 0 && (
                        <div className="w-full mt-6 px-8 animate-in fade-in slide-in-from-bottom-4 delay-500">
                            {!stressTestResult ? (
                                <StressTestButton
                                    propId={propId}
                                    snapshotId={snapshotId}
                                    baseConfidence={confidence}
                                    pick={pick}
                                    rationale={masterData?.analysis_summary || [content]}
                                    riskFactors={masterData?.data_limitations || []}
                                    onStressTestStart={() => { }}
                                    onStressTestComplete={setStressTestResult}
                                />
                            ) : (
                                <StressTestView
                                    data={stressTestResult}
                                    onClose={() => setStressTestResult(null)}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Text Content */}
                <div className="text-left space-y-4 mb-8 border-t border-zinc-800 pt-8">
                    <h2 className="text-2xl font-black italic text-zinc-100">DATA ANALYSIS</h2>
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

                {/* Stress Test Feature moved up */}
            </div>
        </div>
    );
};
