import Link from 'next/link';
import { ArrowRight, Bot, Cpu, Zap, Activity, Brain, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-brand-cyan/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-cyan/5 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-green/5 blur-[120px] rounded-full animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <img src="/iso-logo.png" alt="Alphaline" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-black italic tracking-tighter">ALPHALINE <span className="text-brand-cyan not-italic">SPORTS</span></span>
        </div>
        <div className="flex gap-6">
          <Link href="/dashboard" className="px-6 py-2 text-sm font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/dashboard" className="px-6 py-2 bg-white text-black text-sm font-mono uppercase tracking-widest border border-white hover:bg-transparent hover:border-brand-cyan hover:text-brand-cyan transition-all duration-300">
            Join Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-40 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Text Content */}
          <div className="space-y-6 animate-in fade-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-brand-green text-xs font-mono uppercase tracking-widest mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green"></span>
              </span>
              System Online v2.0
            </div>

            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9]">
              SPORTS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-green">INTELLIGENCE</span> <br />
              EVOLVED.
            </h1>

            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed border-l-2 border-brand-cyan/20 pl-6">
              Clarity in a world of noise. Alphaline's autonomous agents synthesize millions of data points into a single, calibrated signal—empowering you to make decisions based on cold, hard logic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/dashboard" className="group relative px-8 py-4 bg-brand-cyan text-black font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden">
                <span className="relative z-10">Get Initial Analysis</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12" />
              </Link>
              <Link href="/dashboard" className="px-8 py-4 bg-transparent border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:border-brand-cyan hover:text-brand-cyan transition-colors flex items-center justify-center">
                View Demo
              </Link>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
            <div className="relative z-10 grid grid-cols-2 gap-4">
              {/* Visual Cards representing the agents */}
              <div className="col-span-2 bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-lg transform hover:-translate-y-2 transition-transform duration-500 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Master Agent</h3>
                    <p className="text-xs text-zinc-500 font-mono uppercase">Synthesis Engine</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[85%]" />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-zinc-500">
                    <span>Confidence</span>
                    <span className="text-purple-400">85%</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-lg transform hover:-translate-y-2 transition-transform duration-500 delay-75 group">
                <div className="w-10 h-10 bg-brand-cyan/10 rounded-lg flex items-center justify-center border border-brand-cyan/20 mb-4 group-hover:border-brand-cyan/50 transition-colors">
                  <Activity className="w-5 h-5 text-brand-cyan" />
                </div>
                <h3 className="font-bold text-sm mb-1">Scout Agent</h3>
                <p className="text-[10px] text-zinc-500 uppercase leading-none">Historical Data Recon</p>
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-lg transform hover:-translate-y-2 transition-transform duration-500 delay-100 group">
                <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center border border-brand-green/20 mb-4 group-hover:border-brand-green/50 transition-colors">
                  <Shield className="w-5 h-5 text-brand-green" />
                </div>
                <h3 className="font-bold text-sm mb-1">Insider Agent</h3>
                <p className="text-[10px] text-zinc-500 uppercase leading-none">Injury & Roster Intel</p>
              </div>
            </div>

            {/* Abstract Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-zinc-800 rounded-full opacity-20 animate-spin-slow pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-dashed border-zinc-800 rounded-full opacity-20 animate-spin-reverse-slow pointer-events-none" />
          </div>

        </div>
      </main>

      {/* Feature Strip */}
      <section className="border-y border-zinc-900 bg-black/50 backdrop-blur-sm py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/20 p-6 border border-zinc-800/50 hover:border-brand-cyan/30 transition-colors group">
            <div className="mb-4 text-brand-cyan">
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold italic text-white mb-2 group-hover:text-brand-cyan transition-colors">DEEP DATA RECON</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Scout Agent analyzes thousands of historical games, identifying trends, volume metrics, and efficiency stats that human analysts miss.
            </p>
          </div>

          <div className="bg-zinc-900/20 p-6 border border-zinc-800/50 hover:border-brand-green/30 transition-colors group">
            <div className="mb-4 text-brand-green">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold italic text-white mb-2 group-hover:text-brand-green transition-colors">REAL-TIME INTEL</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Insider Agent monitors beat reporters and team news in real-time, catching injury updates and roster changes before the books react.
            </p>
          </div>

          <div className="bg-zinc-900/20 p-6 border border-zinc-800/50 hover:border-purple-500/30 transition-colors group">
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
