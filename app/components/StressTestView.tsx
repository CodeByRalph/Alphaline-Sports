'use client';

import { useState, useRef, useEffect } from 'react';
import { StressTestRecord, StressTestScoringBreakdown } from '@/app/lib/stress-test/types';
import { Play, Pause, ChevronDown, ChevronUp, Mic, AlertTriangle, CheckCircle, HelpCircle, ShieldAlert } from 'lucide-react';

interface StressTestViewProps {
    data: StressTestRecord;
    onClose: () => void;
}

export function StressTestView({ data, onClose }: StressTestViewProps) {
    const [phase, setPhase] = useState<'defense' | 'questions' | 'rebuttal' | 'finished'>('defense');
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAudioIndex, setCurrentAudioIndex] = useState(0); // For multiple questions
    const [showBreakdown, setShowBreakdown] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Sequence: Defense -> Q1 -> Q2 -> Q3 -> Rebuttal
    // We can flatten the playlist
    const playlist = [
        { type: 'defense', url: data.audioUrls.defense },
        ...data.audioUrls.skepticQuestions.map((url, i) => ({ type: 'questions', url, index: i })),
        { type: 'rebuttal', url: data.audioUrls.rebuttal }
    ];

    const [trackIndex, setTrackIndex] = useState(0);
    const currentTrack = playlist[trackIndex];

    useEffect(() => {
        if (trackIndex < playlist.length) {
            setPhase(currentTrack.type as any);
            if (currentTrack.type === 'questions') setCurrentAudioIndex((currentTrack as any).index);
        } else {
            setPhase('finished');
            setIsPlaying(false);
        }
    }, [trackIndex]);

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleEnded = () => {
        if (trackIndex + 1 < playlist.length) {
            setTrackIndex(prev => prev + 1);
            // Auto-play next
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.play().catch(e => console.log("Autoplay blocked", e));
                    setIsPlaying(true);
                }
            }, 500);
        } else {
            setPhase('finished');
            setIsPlaying(false);
        }
    };

    // Auto-play on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().catch(() => console.log("Auto-play blocked"));
                setIsPlaying(true);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 mt-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <h3 className="text-sm font-mono uppercase text-red-500 font-bold">Conviction Stress Test</h3>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xs uppercase">Close</button>
            </div>

            {/* Audio Player Hidden */}
            <audio
                ref={audioRef}
                src={currentTrack?.url}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Visualizer / Transcript */}
            <div className="mb-6 space-y-4 min-h-[150px] relative">
                {/* Bookie Defense */}
                <div className={`transition-all duration-500 ${phase === 'defense' ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded bg-blue-900/50 flex items-center justify-center border border-blue-500/30">
                            <ShieldAlert className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <h4 className="text-xs font-mono text-blue-400 uppercase mb-1">Bookie Defense</h4>
                            <p className="text-sm text-zinc-300 leading-relaxed italic">"{data.script.defense.substring(0, 100)}..."</p>
                        </div>
                    </div>
                </div>

                {/* Skeptic */}
                <div className={`transition-all duration-500 ${phase === 'questions' ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded bg-amber-900/50 flex items-center justify-center border border-amber-500/30">
                            <HelpCircle className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                            <h4 className="text-xs font-mono text-amber-500 uppercase mb-1">Skeptic Cross-Exam</h4>
                            <p className="text-sm text-zinc-300 leading-relaxed italic">
                                {phase === 'questions'
                                    ? `"${data.script.skepticQuestions[currentAudioIndex]}"`
                                    : `${data.script.skepticQuestions.length} Questions Asked`
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Rebuttal */}
                <div className={`transition-all duration-500 ${phase === 'rebuttal' ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded bg-green-900/50 flex items-center justify-center border border-green-500/30">
                            <Mic className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                            <h4 className="text-xs font-mono text-green-400 uppercase mb-1">Final Rebuttal</h4>
                            <p className="text-sm text-zinc-300 leading-relaxed italic">
                                "{data.script.rebuttal.substring(0, 100)}..."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            {phase !== 'finished' && (
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handlePlayPause}
                        className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-500 flex items-center justify-center transition-all"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white pl-1" />}
                    </button>
                </div>
            )}

            {/* Results */}
            {(phase === 'finished' || true) && ( // Show results always or only after? Let's show always but highlight after
                <div className={`border-t border-zinc-800 pt-6 transition-all duration-1000 ${phase === 'finished' ? 'opacity-100' : 'opacity-50 blur-[2px]'}`}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-center">
                            <div className="text-xs font-mono text-zinc-500 uppercase">Base Score</div>
                            <div className="text-2xl font-bold text-zinc-400">{data.baseScore.toFixed(0)}</div>
                        </div>
                        <div className="bg-zinc-950 p-3 rounded border border-zinc-800 text-center relative overflow-hidden">
                            {/* Recommendation Badge */}
                            <div className={`absolute top-0 right-0 px-2 py-0.5 text-[10px] font-bold uppercase ${data.recommendation === 'BET' ? 'bg-green-500 text-black' :
                                data.recommendation === 'LEAN' ? 'bg-amber-500 text-black' : 'bg-red-500 text-white'
                                }`}>
                                {data.recommendation}
                            </div>
                            <div className="text-xs font-mono text-zinc-500 uppercase">Post-Stress</div>
                            <div className={`text-2xl font-bold ${data.postScore >= 70 ? 'text-green-500' : data.postScore >= 55 ? 'text-amber-500' : 'text-red-500'
                                }`}>
                                {data.postScore.toFixed(0)}
                            </div>
                            {data.baseScore - data.postScore > 0 && (
                                <div className="text-[10px] text-red-500 font-mono">-{(data.baseScore - data.postScore).toFixed(0)} penalty</div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowBreakdown(!showBreakdown)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800/50 rounded text-xs font-mono uppercase text-zinc-400 hover:text-white transition-colors"
                    >
                        <span>Scoring Breakdown</span>
                        {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showBreakdown && (
                        <div className="mt-2 space-y-2 text-xs font-mono bg-zinc-950/50 p-3 rounded border border-zinc-800/50">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Hedging ({data.scoringBreakdown.hedging.count})</span>
                                <span className="text-red-400">-{data.scoringBreakdown.hedging.penalty}</span>
                            </div>
                            {data.scoringBreakdown.hedging.words.length > 0 && (
                                <div className="text-[10px] text-zinc-600 pl-2">
                                    "{data.scoringBreakdown.hedging.words.join('", "')}"
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-zinc-500">Backtracking ({data.scoringBreakdown.contradiction.count})</span>
                                <span className="text-red-400">-{data.scoringBreakdown.contradiction.penalty}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-zinc-500">Confidence Lang</span>
                                <span className={data.scoringBreakdown.confidence.penalty <= 0 ? "text-green-400" : "text-red-400"}>
                                    {data.scoringBreakdown.confidence.penalty <= 0 ? '+' + Math.abs(data.scoringBreakdown.confidence.penalty) : '-' + data.scoringBreakdown.confidence.penalty}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-zinc-500">Missed Qs ({data.scoringBreakdown.completeness.missedQuestions})</span>
                                <span className="text-red-400">-{data.scoringBreakdown.completeness.penalty}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
