'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Cpu, Zap, Activity, Brain, Shield } from 'lucide-react';
import { Nav } from '@/app/components/Nav';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-brand-cyan/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-cyan/5 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-green/5 blur-[120px] rounded-full animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>

      <Nav />

      {/* Hero Section */}
      <main className="relative z-10 pt-12 pb-24 lg:pt-32 lg:pb-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* Text Content */}
          <div className="flex flex-col items-center lg:items-start space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-brand-green text-[10px] lg:text-xs font-mono uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
              </span>
              System Online v2.0
            </div>

            {/* Headlines */}
            <div className="text-center lg:text-left space-y-2 lg:space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black italic tracking-tighter leading-[0.95] lg:leading-[0.9]">
                SPORTS <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-green">INTELLIGENCE</span> <br />
                EVOLVED.
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-prose lg:max-w-lg leading-relaxed lg:border-l-2 lg:border-brand-cyan/20 lg:pl-6 mx-auto lg:mx-0">
                Clarity in a world of noise. Alphaline's autonomous agents synthesize millions of data points into a single, calibrated signal.
              </p>
            </div>

            {/* CTAs */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/dashboard" className="group relative w-full sm:w-auto h-14 lg:h-12 px-8 bg-brand-cyan text-black font-bold uppercase tracking-widest hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden rounded">
                <span className="relative z-10">Get Initial Analysis</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12" />
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto h-14 lg:h-12 px-8 bg-transparent border border-zinc-800 text-zinc-300 font-bold uppercase tracking-widest hover:border-brand-cyan hover:text-brand-cyan transition-colors flex items-center justify-center rounded">
                View Demo
              </Link>
            </div>
          </div>

          {/* Agent Visual (Dashboard Card) */}
          <div className="relative w-full max-w-md mx-auto lg:max-w-none mt-12 lg:mt-0 animate-in fade-in slide-in-from-bottom-8 lg:slide-in-from-right-10 duration-1000 delay-200">
            <div className="relative z-10 flex flex-col gap-4">

              {/* Master Agent Card */}
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-lg shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-brand-cyan opacity-50" />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                      <Brain className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white tracking-wide">Master Agent</h3>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Synthesis Engine</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-zinc-900 pb-2">
                    <span className="text-xs font-mono text-zinc-500 uppercase">Confidence Score</span>
                    <span className="text-3xl font-black text-white tabular-nums tracking-tighter">87<span className="text-sm text-zinc-600">%</span></span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-500">
                      <span>Analysis Vector</span>
                      <span className="text-brand-cyan">Optimized</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-brand-cyan w-[87%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub Agents Grid (Hidden on very small screens if needed, otherwise stacked) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg transform lg:group-hover:translate-x-2 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-4 h-4 text-brand-cyan" />
                    <span className="text-xs font-bold text-zinc-300 uppercase">Scout</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-cyan w-[92%]" />
                  </div>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg transform lg:group-hover:-translate-x-2 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-4 h-4 text-brand-green" />
                    <span className="text-xs font-bold text-zinc-300 uppercase">Insider</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-green w-[78%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Abstract Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-zinc-800/50 rounded-full opacity-20 animate-spin-slow pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-dashed border-zinc-800/50 rounded-full opacity-20 animate-spin-reverse-slow pointer-events-none" />
          </div>

        </div>
      </main>

      {/* Feature Strip */}
      <section className="border-y border-zinc-900 bg-black/50 backdrop-blur-sm py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/20 p-6 border border-zinc-800/50 hover:border-brand-cyan/30 transition-colors group rounded-lg">
            <div className="mb-4 text-brand-cyan">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold italic text-white mb-2 group-hover:text-brand-cyan transition-colors">DEEP DATA RECON</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Scout Agent analyzes thousands of historical games, identifying trends, volume metrics, and efficiency stats that human analysts miss.
            </p>
          </div>

          <div className="bg-zinc-900/20 p-6 border border-zinc-800/50 hover:border-brand-green/30 transition-colors group rounded-lg">
            <div className="mb-4 text-brand-green">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold italic text-white mb-2 group-hover:text-brand-green transition-colors">REAL-TIME INTEL</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Insider Agent monitors beat reporters and team news in real-time, catching injury updates and roster changes before the books react.
            </p>
          </div>

          <div className="bg-zinc-900/20 p-6 border border-zinc-800/50 hover:border-purple-500/30 transition-colors group rounded-lg">
            <div className="mb-4 text-purple-500">
              <Cpu className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold italic text-white mb-2 group-hover:text-purple-500 transition-colors">SYNTHESIS ENGINE</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Master Agent weighs conflicting signals from all sub-agents to generate a calibrated confidence score and clear data projection.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-50 text-sm font-mono text-zinc-600">
          <p>&copy; 2025 ALPHALINE SPORTS. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-brand-cyan">TERMS</a>
            <a href="#" className="hover:text-brand-cyan">PRIVACY</a>
            <a href="#" className="hover:text-brand-cyan">SYSTEM STATUS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
