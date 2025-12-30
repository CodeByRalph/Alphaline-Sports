'use client';

import React from 'react';
import { Nav } from '@/app/components/Nav';
import { Check, X } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-brand-cyan/30 overflow-x-hidden">
            <Nav />

            {/* Hero */}
            <div className="relative pt-20 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4">
                        SELECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-green">ACCESS LEVEL</span>
                    </h1>
                    <p className="text-xl text-zinc-400 font-mono uppercase tracking-widest">
                        Intelligence costs money. Ignorance costs more.
                    </p>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-6 pb-40 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

                {/* Free Tier */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 relative hover:border-zinc-700 transition-colors">
                    <div className="mb-4">
                        <span className="px-3 py-1 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-400 text-xs font-mono uppercase">Recruit</span>
                    </div>
                    <div className="mb-8">
                        <span className="text-4xl font-black text-white">$0</span>
                        <span className="text-zinc-500 font-mono">/mo</span>
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-zinc-400">
                        <li className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-zinc-500" /> 3 Scans Per Day
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-zinc-500" /> Basic Stats Engine
                        </li>
                        <li className="flex items-center gap-3 text-zinc-600">
                            <X className="w-4 h-4" /> No Insider Intel
                        </li>
                        <li className="flex items-center gap-3 text-zinc-600">
                            <X className="w-4 h-4" /> No Stress Tests
                        </li>
                    </ul>
                    <Link href="/dashboard" className="block w-full py-4 text-center border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                        Initiate
                    </Link>
                </div>

                {/* Pro Tier */}
                <div className="bg-zinc-900 border border-brand-cyan rounded-xl p-8 relative shadow-[0_0_40px_rgba(34,211,238,0.1)] transform md:-translate-y-4">
                    <div className="absolute top-0 right-0 bg-brand-cyan text-black text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg">
                        Recommended
                    </div>
                    <div className="mb-4">
                        <span className="px-3 py-1 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan text-xs font-mono uppercase">Operative</span>
                    </div>
                    <div className="mb-8">
                        <span className="text-5xl font-black text-white">$29</span>
                        <span className="text-zinc-500 font-mono">/mo</span>
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-zinc-300">
                        <li className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-brand-cyan" /> Unlimited Scans
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-brand-cyan" /> Full Agent Access (Scout, Insider, Meterologist)
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-brand-cyan" /> Conviction Stress Testing
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-brand-cyan" /> Priority Processing
                        </li>
                    </ul>
                    <Link href="/dashboard" className="block w-full py-4 text-center bg-brand-cyan text-black font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-brand-cyan/20">
                        Join The Unit
                    </Link>
                </div>

                {/* Enterprise Tier */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 relative hover:border-purple-500/50 transition-colors">
                    <div className="mb-4">
                        <span className="px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-mono uppercase">Syndicate</span>
                    </div>
                    <div className="mb-8">
                        <span className="text-4xl font-black text-white">Custom</span>
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-zinc-400">
                        <li className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-purple-500" /> API Access
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-purple-500" /> Whitelabel Reports
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-purple-500" /> 24/7 Support
                        </li>
                        <li className="flex items-center gap-3">
                            <Check className="w-4 h-4 text-purple-500" /> Custom Data Integrations
                        </li>
                    </ul>
                    <button className="block w-full py-4 text-center border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest hover:border-purple-500 hover:text-purple-500 transition-all">
                        Contact Sales
                    </button>
                </div>

            </div>
        </div>
    )
}
