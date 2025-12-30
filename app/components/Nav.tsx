'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="relative z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3 group">
        <div className="w-8 h-8 lg:w-10 lg:h-10 relative transition-transform duration-300 group-hover:scale-105">
          <img src="/iso-logo.png" alt="Alphaline" className="w-full h-full object-contain" />
        </div>
        <span className="text-xl font-black italic tracking-tighter text-white">ALPHALINE <span className="text-brand-cyan not-italic">SPORTS</span></span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden lg:flex items-center gap-8">
        <Link href="/features" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider">Features</Link>
        <Link href="/agents" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider">Agents</Link>
        <Link href="/pricing" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider">Pricing</Link>
      </div>

      <div className="hidden lg:flex gap-6">
        <Link href="/dashboard" className="px-6 py-2 text-sm font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors flex items-center">
          Login
        </Link>
        <Link href="/dashboard" className="px-6 py-2 bg-white text-black text-sm font-mono uppercase tracking-widest border border-white hover:bg-transparent hover:border-brand-cyan hover:text-brand-cyan transition-all duration-300">
          Join Now
        </Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="lg:hidden text-zinc-400 hover:text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-xl lg:hidden pt-32 px-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4">
          <Link href="/features" className="text-2xl font-black text-white uppercase tracking-tighter" onClick={() => setIsMenuOpen(false)}>Features</Link>
          <Link href="/agents" className="text-2xl font-black text-white uppercase tracking-tighter" onClick={() => setIsMenuOpen(false)}>Agents</Link>
          <Link href="/pricing" className="text-2xl font-black text-white uppercase tracking-tighter" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
          <div className="h-px bg-zinc-800 w-full my-4" />
          <Link href="/dashboard" className="w-full py-4 text-center border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest">Login</Link>
          <Link href="/dashboard" className="w-full py-4 text-center bg-brand-cyan text-black font-bold uppercase tracking-widest">Join Now</Link>
        </div>
      )}
    </nav>
  );
};
