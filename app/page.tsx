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

export default function WarRoom() {
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
    const bookieResult = await fetchAgentAnalysis('bookie');

    setReports(prev => ({
      ...prev,
      bookie: bookieResult
    }));

    setIsAnalyzing(false);
  };

  return (
    <main className="min-h-screen relative flex flex-col items-center selection:bg-brand-cyan/30">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-96 bg-brand-cyan/5 blur-[150px] rounded-full pointer-events-none -translate-y-1/2 -z-10" />

      {/* Header / Brand */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative w-12 h-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
            <img src="/iso-logo.png" alt="A" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(64,240,255,0.5)]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter text-white italic">
              ALPHALINE <span className="text-brand-cyan not-italic font-sans">SPORTS</span>
            </h1>
            <div className="h-0.5 w-full bg-gradient-to-r from-brand-cyan to-transparent opacity-50" />
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 uppercase mt-1">
              Multi-Agent Intelligence
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
          <div className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          <span className="text-xs font-mono text-zinc-400">SYSTEM ONLINE</span>
        </div>
      </nav>

      {/* Main Content Area */}
      {/* Main Content Area - Mission Control Grid */}
      <div className="w-full max-w-[1400px] z-10 px-4 md:px-6 my-4 md:my-6 flex-grow flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6 pb-20">

        {/* TOP ROW: Input */}
        <div className="col-span-12 mb-2 md:mb-4">
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

        {/* ORDER 1 (Mobile): The Verdict (Bookie) - User wants Answer First on mobile? 
           Actually, usually Context First? 
           Let's stick to Input -> Verdict (Center) -> Data (Scout) -> Context (others) for mobile 
           so they see the result immediately? 
           No, logically Data -> Verdict is the 'story'. 
           But 'Mission Control' implies result focus.
           Let's use 'order' classes to put Bookie second on mobile (after Input) if we want?
           The current DOM order is Input -> Scout -> Bookie -> Context.
           Result: Mobile = Input, then Scout card, then Bookie, then others.
           Let's KEEP DOM order but adjust heights.
        */}

        {/* LEFT FLANK: Scout (The Data) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col h-auto lg:h-full lg:min-h-[500px]">
          <AgentCard report={reports.scout} />
        </div>

        {/* CENTER STAGE: The Verdict (Bookie) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col h-auto min-h-[400px] lg:h-full lg:min-h-[500px]">
          <div className="h-full rounded-sm border border-brand-cyan/20 bg-brand-black/80 backdrop-blur-sm relative overflow-hidden flex flex-col p-1 shadow-[0_0_30px_rgba(0,0,0,0.5)]">

            {/* Decorative Header */}
            <div className="h-8 bg-zinc-900/80 border-b border-brand-cyan/20 flex items-center justify-between px-4">
              <span className="text-[10px] font-mono uppercase text-brand-cyan tracking-widest">Master_Control_Program</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              </div>
            </div>

            {/* Main Display */}
            <div className="flex-grow relative p-4 md:p-6 flex flex-col justify-center min-h-[300px]">
              {reports.bookie.status === 'idle' && (
                <div className="text-center space-y-4 opacity-30">
                  <div className="mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full border border-dashed border-brand-cyan animate-pulse-slow flex items-center justify-center">
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-brand-cyan/10" />
                  </div>
                  <p className="font-mono text-xs uppercase text-brand-cyan">Awating Parameters...</p>
                </div>
              )}

              {reports.bookie.status === 'working' && (
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-full max-w-md h-1 md:h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-cyan animate-shimmer" style={{ width: '100%', backgroundSize: '200% 100%' }} />
                  </div>
                  <p className="font-mono text-xs md:text-sm uppercase text-brand-cyan animate-pulse text-center">Synthesizing vectors...</p>
                </div>
              )}

              {reports.bookie.status === 'completed' && (
                <VerdictGauge report={reports.bookie} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT FLANK: Context (Insider / Meteorologist) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col md:flex-row lg:flex-col gap-4 md:gap-6 h-auto lg:h-full">
          <div className="flex-1 w-full min-h-[200px]">
            <AgentCard report={reports.insider} />
          </div>
          <div className="flex-1 w-full min-h-[200px]">
            <AgentCard report={reports.meteorologist} />
          </div>
        </div>
      </div>
    </main>
  );
}
