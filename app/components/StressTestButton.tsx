'use client';

import { useState } from 'react';
import { Play, Volume2, ShieldAlert } from 'lucide-react';
import { StressTestRequest } from '@/app/lib/stress-test/types';

interface ScoredTestButtonProps {
    propId: string;
    snapshotId: string; // Using timestamp or unique ID from Master Agent
    baseConfidence: number;
    pick: string;
    rationale: string[];
    riskFactors: string[];
    onStressTestStart: () => void;
    onStressTestComplete: (data: any) => void;
}

export function StressTestButton({
    propId, snapshotId, baseConfidence, pick, rationale, riskFactors,
    onStressTestStart, onStressTestComplete
}: ScoredTestButtonProps) {
    const [status, setStatus] = useState<'idle' | 'generating' | 'error'>('idle');

    const handleClick = async () => {
        setStatus('generating');
        onStressTestStart();

        try {
            const payload: StressTestRequest = {
                propId,
                snapshotId,
                baseConfidence,
                pick,
                rationale,
                riskFactors
            };

            const res = await fetch('/api/stress-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Generation failed');

            const json = await res.json();
            if (json.status === 'success') {
                onStressTestComplete(json.data);
            } else {
                throw new Error(json.message);
            }
            setStatus('idle');
        } catch (e) {
            console.error(e);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={status === 'generating'}
            className="group relative px-6 py-4 bg-gradient-to-r from-red-950/80 to-red-900/80 border border-red-500 hover:border-red-400 hover:from-red-900 hover:to-red-800 transition-all rounded w-full flex items-center justify-center gap-3 overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
        >
            <div className="absolute inset-0 bg-[url('/stripes.png')] opacity-20 animate-slide-slow mix-blend-overlay" />

            {status === 'idle' && (
                <>
                    <ShieldAlert className="w-5 h-5 text-red-500 relative z-10 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-sm uppercase text-red-100 relative z-10 tracking-widest font-bold">Stress Test Bet</span>
                </>
            )}

            {status === 'generating' && (
                <>
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin relative z-10" />
                    <span className="font-mono text-sm uppercase text-red-200 relative z-10 animate-pulse">Running Simulation...</span>
                </>
            )}

            {status === 'error' && (
                <span className="font-mono text-sm uppercase text-red-400 relative z-10">System Error</span>
            )}
        </button>
    );
}
