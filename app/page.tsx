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
        body: JSON.stringify({ player, prop, agent: role }),
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
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 font-sans selection:bg-indigo-500/30">

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16 text-center space-y-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
          Multi-Agent Sports Intelligence
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-br from-white via-zinc-400 to-zinc-700 bg-clip-text text-transparent">
          ALPHA LINE SPORTS
        </h1>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
          Deploy a swarm of AI agents to scout matchups, analyze insider news, and calculate weather impacts before placing your bet.
        </p>
      </div>

      {/* Input Section */}
      <div className="mb-20">
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

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <AgentCard report={reports.scout} />
        <AgentCard report={reports.insider} />
        <AgentCard report={reports.meteorologist} />
      </div>

      {/* Final Verdict */}
      <div className="max-w-4xl mx-auto">
        {reports.bookie.status !== 'idle' && (
          <div className={reports.bookie.status === 'working' ? 'opacity-50' : 'opacity-100'}>
            {reports.bookie.status === 'working' ? (
              <div className="h-64 rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/10 flex items-center justify-center">
                <div className="text-zinc-500 font-mono animate-pulse">The Bookie is synthesizing intelligence...</div>
              </div>
            ) : (
              <VerdictGauge report={reports.bookie} />
            )}
          </div>
        )}
      </div>

    </main>
  );
}
