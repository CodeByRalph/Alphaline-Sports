'use client';

import React from 'react';
import { Nav } from '@/app/components/Nav';
import { Activity, Brain, Shield, Zap, Lock, Cloud } from 'lucide-react';

export default function AgentsPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-brand-cyan/30 overflow-x-hidden">
            <Nav />

            {/* Hero */}
            <div className="relative pt-20 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
                        MEET THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-green">SQUAD</span>
                    </h1>
                    <p className="text-xl text-zinc-400 font-mono uppercase tracking-widest">
                        Autonomous • Adversarial • Aligned
                    </p>
                </div>
            </div>

            {/* Agent Stack */}
            <div className="max-w-4xl mx-auto px-6 pb-40 space-y-12">

                {/* Master Agent */}
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                            <Brain className="w-8 h-8 text-purple-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-black text-white">MASTER AGENT</h3>
                                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-mono uppercase border border-purple-500/20">Synthesis Engine</span>
                            </div>
                            <p className="text-zinc-400 leading-relaxed mb-4">
                                The architect. It doesn't analyze raw data; it analyzes *analysts*. It takes the outputs from Scout, Insider, and Meteorologist, resolves conflicts using historical weighting, and issues the final Conviction Score.
                            </p>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                <div className="bg-black/40 border border-zinc-800 p-2 rounded text-center">
                                    <div className="text-[10px] text-zinc-500 font-mono uppercase">Role</div>
                                    <div className="text-sm font-bold text-white">Orchestrator</div>
                                </div>
                                <div className="bg-black/40 border border-zinc-800 p-2 rounded text-center">
                                    <div className="text-[10px] text-zinc-500 font-mono uppercase">Model</div>
                                    <div className="text-sm font-bold text-white">GPT-4o</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scout Agent */}
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl relative overflow-hidden group hover:border-brand-cyan/50 transition-colors">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-cyan/10 rounded-full blur-3xl group-hover:bg-brand-cyan/20 transition-colors" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 bg-brand-cyan/10 border border-brand-cyan/20 rounded-lg flex items-center justify-center shrink-0">
                            <Activity className="w-8 h-8 text-brand-cyan" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-black text-white">SCOUT</h3>
                                <span className="px-2 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan text-[10px] font-mono uppercase border border-brand-cyan/20">Data Recon</span>
                            </div>
                            <p className="text-zinc-400 leading-relaxed mb-4">
                                The grinder. Scout lives in the spreadsheets. It has direct access to the Tank01 NFL API and pulls years of historical logs to find trends, regressions, and volume stats that support or refute a prop bet.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Insider Agent */}
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl relative overflow-hidden group hover:border-brand-green/50 transition-colors">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-green/10 rounded-full blur-3xl group-hover:bg-brand-green/20 transition-colors" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 bg-brand-green/10 border border-brand-green/20 rounded-lg flex items-center justify-center shrink-0">
                            <Shield className="w-8 h-8 text-brand-green" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-black text-white">INSIDER</h3>
                                <span className="px-2 py-0.5 rounded bg-brand-green/10 text-brand-green text-[10px] font-mono uppercase border border-brand-green/20">News & Intel</span>
                            </div>
                            <p className="text-zinc-400 leading-relaxed mb-4">
                                The spy. Insider monitors the whisper network. It parses simple injury reports but also scrapes beat reporter tweets and practice squad moves to find the qualitative data that the Scout misses.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Meteorologist */}
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                            <Cloud className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-black text-white">METEOROLOGIST</h3>
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-mono uppercase border border-blue-500/20">Conditions</span>
                            </div>
                            <p className="text-zinc-400 leading-relaxed mb-4">
                                The weatherman. Wind speed affects passing. Rain affects rushing. This agent overlays forecast data onto player props to identify subtle edges where the books haven't adjusted for the elements.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bookie */}
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl relative overflow-hidden group hover:border-red-500/50 transition-colors">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors" />
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                            <Lock className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-black text-white">THE BOOKIE</h3>
                                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-mono uppercase border border-red-500/20">Risk Management</span>
                            </div>
                            <p className="text-zinc-400 leading-relaxed mb-4">
                                The enemy within. This agent is programmed to hate your bet. It is the core of the Stress Test feature, using a distinct "Skeptic" persona to audit the Master Agent's conviction and play devil's advocate.
                            </p>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}
