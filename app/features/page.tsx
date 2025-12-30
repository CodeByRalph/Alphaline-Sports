'use client';

import React from 'react';
import { Nav } from '@/app/components/Nav';
import { Activity, Brain, Radio, Shield, Zap, Lock } from 'lucide-react';

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-brand-cyan/30 overflow-x-hidden">
            <Nav />

            {/* Hero */}
            <div className="relative pt-20 pb-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-6 animate-in fade-in zoom-in duration-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">System Architecture</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        ALGORITHMIC <br className="md:hidden" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-green">SUPERIORITY</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
                        Most bettors rely on gut feel. We rely on millions of vectors. Alphaline is not a tool; it's a weaponized data ecosystem.
                    </p>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Feature 1 */}
                <div className="col-span-1 lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 lg:p-12 relative overflow-hidden group hover:border-brand-cyan/30 transition-colors">
                    <div className="absolute top-0 right-0 p-8 text-zinc-800 group-hover:text-brand-cyan/10 transition-colors">
                        <Activity className="w-40 h-40" strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-brand-cyan/10 rounded-lg flex items-center justify-center mb-6">
                            <Activity className="w-6 h-6 text-brand-cyan" />
                        </div>
                        <h3 className="text-2xl font-black italic mb-4">THE DATA LAKE</h3>
                        <p className="text-zinc-400 leading-relaxed max-w-md">
                            The Scout Agent continuously ingests structured data from historical game logs, drive charts, and player tracking metrics. It doesn't just see "yards"; it sees efficiency per snap, success rate vs specific defensive coverages, and regression trends.
                        </p>
                        <div className="mt-8 flex gap-2">
                            <div className="px-3 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-500">TANK01_API</div>
                            <div className="px-3 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-mono text-zinc-500">HISTORICAL_INDEX</div>
                        </div>
                    </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 relative overflow-hidden group hover:border-brand-green/30 transition-colors">
                    <div className="w-12 h-12 bg-brand-green/10 rounded-lg flex items-center justify-center mb-6">
                        <Radio className="w-6 h-6 text-brand-green" />
                    </div>
                    <h3 className="text-2xl font-black italic mb-4">WHISPER NETWORK</h3>
                    <p className="text-zinc-400 leading-relaxed text-sm">
                        The Insider Agent uses LLMs to parse beat reporter tweets, practice reports, and press conferences in real-time. It detects subtle sentiment shifts about player health before the official injury report drops.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-6">
                        <Brain className="w-6 h-6 text-purple-500" />
                    </div>
                    <h3 className="text-2xl font-black italic mb-4">CONFLICT RESOLUTION</h3>
                    <p className="text-zinc-400 leading-relaxed text-sm">
                        When data conflicts (e.g., "Good Matchup" vs "Bad Weather"), the Master Agent weighs the vectors based on historical correlation. It doesn't guess; it calculates the highest probability outcome based on evidence.
                    </p>
                </div>

                {/* Feature 4 */}
                <div className="col-span-1 lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-xl p-8 lg:p-12 relative overflow-hidden group hover:border-red-500/30 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-6">
                        <Lock className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black italic mb-4">CONVICTION STRESS TESTING</h3>
                    <p className="text-zinc-400 leading-relaxed max-w-lg">
                        Before generating a final pick, the "Bookie" agent actively tries to poke holes in the thesis. It searches for reasons *not* to make the bet. Only plays that survive this adversarial audit are presented to you.
                    </p>
                </div>

            </div>
        </div>
    )
}
