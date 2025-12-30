'use client';

import React, { useState } from 'react';
import { AgentRole, AgentReport } from '@/app/types';
import { AgentCard } from '@/app/components/AgentCard';
import { SearchInput } from '@/app/components/SearchInput';
import { VerdictGauge } from '@/app/components/VerdictGauge';

const INITIAL_REPORTS: Record<AgentRole, AgentReport> = {
    scout: { role: 'scout', title: 'Scout', status: 'idle', content: '', confidence: 0, dataPoints: [] },
    insider: { role: 'insider', title: 'Insider', status: 'idle', content: '', confidence: 0, dataPoints: [] },
    meteorologist: { role: 'meteorologist', title: 'Meteorologist', status: 'idle', content: '', confidence: 0, dataPoints: [] },
    bookie: { role: 'bookie', title: 'Bookie', status: 'idle', content: '', confidence: 0, dataPoints: [] },
};

export default function Dashboard() {
    const [player, setPlayer] = useState('');
    const [propValue, setPropValue] = useState('');
    const [propType, setPropType] = useState('Pass Yards');
    const [reports, setReports] = useState<Record<AgentRole, AgentReport>>(INITIAL_REPORTS);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const fetchAgentAnalysis = async (role: AgentRole) => {
        try {
            // Construct the prop string (e.g. "250 Pass Yards")
            const prop = `${propValue} ${propType}`;

            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ player, prop, line: propValue, agent: role }),
            });
            const data = await res.json();
            return { ...data, role, status: 'completed' } as AgentReport;
        } catch (error) {
            console.error(`Error fetching ${role}:`, error);
            return {
                role,
                title: role,
                status: 'completed',
                content: 'Analysis failed due to connection error.',
                confidence: 0,
                dataPoints: []
            } as AgentReport;
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);

        // Reset States
        setReports({
            scout: { ...INITIAL_REPORTS.scout, status: 'working' },
            insider: { ...INITIAL_REPORTS.insider, status: 'working' },
            meteorologist: { ...INITIAL_REPORTS.meteorologist, status: 'working' },
            bookie: { ...INITIAL_REPORTS.bookie, status: 'idle' },
        });

        // 1. Parallel Independent Agents
        const results = await Promise.all([
            fetchAgentAnalysis('scout'),
            fetchAgentAnalysis('insider'),
            fetchAgentAnalysis('meteorologist'),
        ]);

        // Update Independent Agents
        setReports(prev => ({
            ...prev,
            scout: results[0],
            insider: results[1],
            meteorologist: results[2],
            bookie: { ...prev.bookie, status: 'working' } // Start Bookie
        }));

        // 2. Sequential Bookie Agent (Reading the others)
        // We construct the context object to pass to the backend
        const context = {
            scout: results[0],
            insider: results[1],
            meteorologist: results[2]
        };

        // We need to pass this context to the fetch function. 
        // Since fetchAgentAnalysis didn't support it, we'll call the API directly here or modify the function.
        // Modifying the function is cleaner but for now let's just make the specific call for the bookie here to be explicit/functional.

        try {
            const prop = `${propValue} ${propType}`;
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player,
                    prop,
                    line: propValue,
                    agent: 'bookie',
                    // PASS THE CONTEXT
                    context: context
                }),
            });
            const bookieData = await res.json();
            const bookieReport = { ...bookieData, role: 'bookie', status: 'completed' } as AgentReport;

            setReports(prev => ({
                ...prev,
                bookie: bookieReport
            }));

        } catch (e) {
            console.error("Bookie Failed", e);
            setReports(prev => ({
                ...prev,
                bookie: { ...prev.bookie, status: 'completed', content: 'Master Agent Offline', confidence: 0 }
            }));
        }

        setIsAnalyzing(false);
    };

    return (
        <main className="min-h-screen relative flex flex-col items-center selection:bg-brand-cyan/30">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-96 bg-brand-cyan/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 -z-10" />

            {/* Header / Brand */}
            <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4 cursor-pointer">
                    {/* Logo kept simple */}
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-black tracking-tighter text-white italic">
                            ALPHALINE <span className="text-cyan-500 not-italic font-sans">SPORTS</span>
                        </h1>
                    </div>
                </div>

                {/* Status Indicator - Right Aligned, Pill */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/50 bg-green-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-mono text-green-500 font-bold uppercase tracking-wider">SYSTEM ONLINE</span>
                </div>
            </nav>

            {/* Tactical Grid Layout */}
            <div className="w-full max-w-[1600px] px-6 pb-12 flex-grow flex flex-col gap-6">

                {/* Command Bar */}
                <div className="w-full py-4">
                    <SearchInput
                        player={player}
                        propValue={propValue}
                        propType={propType}
                        setPlayer={setPlayer}
                        setPropValue={setPropValue}
                        setPropType={setPropType}
                        onAnalyze={handleAnalyze}
                        isAnalyzing={isAnalyzing}
                    />
                </div>

                {/* Main Grid: 1 (Left) - 2 (Center) - 1 (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full lg:h-[800px]">

                    {/* LEFT COLUMN (25%) */}
                    <div className="col-span-1 flex flex-col gap-6 h-full">
                        {/* Top Panel: Stats Engine (Scout) */}
                        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col overflow-hidden">
                            <div className="h-10 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50">
                                <span className="text-xs font-bold text-zinc-400 font-mono">AGENT: STATS_ENGINE</span>
                            </div>
                            <div className="flex-grow p-4 relative">
                                <AgentCard report={reports.scout} />
                            </div>
                        </div>

                        {/* Bottom Panel: News Crawler (Insider) */}
                        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col overflow-hidden">
                            <div className="h-10 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50">
                                <span className="text-xs font-bold text-zinc-400 font-mono">AGENT: NEWS_CRAWLER</span>
                            </div>
                            <div className="flex-grow p-4 relative">
                                <AgentCard report={reports.insider} />
                            </div>
                        </div>
                    </div>

                    {/* CENTER COLUMN (50%) - Master Control */}
                    <div className="col-span-1 lg:col-span-2 bg-zinc-950 border border-cyan-500/30 rounded-lg flex flex-col overflow-hidden shadow-[0_0_50px_rgba(6_182_212_0.05)]">
                        <div className="h-10 border-b border-cyan-500/30 flex items-center justify-between px-4 bg-cyan-950/10">
                            <span className="text-xs font-bold text-cyan-500 font-mono tracking-widest">MASTER_CONTROL_PROGRAM</span>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-900" />
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-900" />
                            </div>
                        </div>

                        <div className="flex-grow overflow-y-auto custom-scrollbar relative p-6">
                            {reports.bookie.status === 'idle' && (
                                <div className="h-full flex flex-col justify-center items-center text-zinc-600 font-mono text-sm">
                                    <p>[SYSTEM_READY]</p>
                                    <p className="mt-2 text-xs opacity-50">Awaiting Target Selection...</p>
                                </div>
                            )}

                            {reports.bookie.status === 'working' && (
                                <div className="h-full font-mono text-xs md:text-sm text-cyan-400/80 space-y-2 p-4 font-bold">
                                    <p>[12:01:42] SYSTEM: Initializing search...</p>
                                    <p className="animate-pulse delay-75">[12:01:43] TARGET: {player || 'UNKNOWN'} identified.</p>
                                    {reports.scout.status === 'completed' && <p>[12:01:44] SCOUT: Data vector received.</p>}
                                    {reports.insider.status === 'completed' && <p>[12:01:45] INSIDER: News feed synched.</p>}
                                    <p className="animate-pulse delay-150 text-cyan-200">Processing vectors...</p>
                                </div>
                            )}

                            {reports.bookie.status === 'completed' && (
                                <VerdictGauge
                                    report={reports.bookie}
                                    betContext={{
                                        player,
                                        propType,
                                        line: propValue
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN (25%) */}
                    <div className="col-span-1 flex flex-col gap-6 h-full">
                        {/* Top Panel: Matchup Analyzer (Meteorologist) */}
                        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col overflow-hidden">
                            <div className="h-10 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50">
                                <span className="text-xs font-bold text-zinc-400 font-mono">AGENT: MATCHUP_ANALYZER</span>
                            </div>
                            <div className="flex-grow p-4 relative">
                                <AgentCard report={reports.meteorologist} />
                            </div>
                        </div>

                        {/* Bottom Panel: Odds Scanner (Mock) */}
                        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg flex flex-col overflow-hidden">
                            <div className="h-10 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50">
                                <span className="text-xs font-bold text-zinc-400 font-mono">AGENT: ODDS_SCANNER</span>
                            </div>
                            <div className="flex-grow p-4 relative flex items-center justify-center text-zinc-700 font-mono text-xs">
                                {/* Placeholder for now, or could map another agent */}
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between border-b border-zinc-900 pb-1"><span>DK</span> <span>-110</span></div>
                                    <div className="flex justify-between border-b border-zinc-900 pb-1"><span>FD</span> <span>-115</span></div>
                                    <div className="flex justify-between border-b border-zinc-900 pb-1"><span>MGM</span> <span>-110</span></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
