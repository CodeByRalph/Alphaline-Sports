import React from 'react';
import { Search, Flame, ChevronDown } from 'lucide-react';

interface SearchInputProps {
    player: string;
    propValue: string;
    propType: string;
    setPlayer: (val: string) => void;
    setPropValue: (val: string) => void;
    setPropType: (val: string) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

const PROP_TYPES = [
    'Pass Yards',
    'Rush Yards',
    'Rec Yards',
    'Pass TDs',
    'Rush TDs',
    'Interceptions',
    'Receptions',
    'Completions'
];

export const SearchInput: React.FC<SearchInputProps> = ({
    player,
    propValue,
    propType,
    setPlayer,
    setPropValue,
    setPropType,
    onAnalyze,
    isAnalyzing
}) => {
    return (
        <div className="w-full max-w-6xl mx-auto bg-brand-black/90 border border-zinc-800 p-2 md:p-4 rounded-xl shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-1">
                {/* Player Input (Full width on mobile, 5 cols on MD) */}
                <div className="col-span-12 md:col-span-5 relative group">
                    <div className="absolute top-2 left-4 text-[10px] uppercase font-black tracking-widest text-zinc-600 pointer-events-none group-focus-within:text-brand-cyan transition-colors">Target Athlete</div>
                    <input
                        type="text"
                        placeholder="e.g. Lamar Jackson"
                        value={player}
                        onChange={(e) => setPlayer(e.target.value)}
                        disabled={isAnalyzing}
                        className="w-full h-16 bg-zinc-900/40 border border-zinc-800 text-zinc-100 px-4 pt-5 pb-1 rounded-lg focus:ring-1 focus:ring-brand-cyan/50 focus:border-brand-cyan outline-none transition-all placeholder:text-zinc-700 font-bold text-lg"
                    />
                </div>

                {/* Prop Value Input (half width on mobile, 2 cols on MD) */}
                <div className="col-span-6 md:col-span-2 relative group">
                    <div className="absolute top-2 left-4 text-[10px] uppercase font-black tracking-widest text-zinc-600 pointer-events-none group-focus-within:text-brand-green transition-colors">Line</div>
                    <input
                        type="number"
                        placeholder="0.0"
                        value={propValue}
                        onChange={(e) => setPropValue(e.target.value)}
                        disabled={isAnalyzing}
                        className="w-full h-16 bg-zinc-900/40 border border-zinc-800 text-zinc-100 px-4 pt-5 pb-1 rounded-lg focus:ring-1 focus:ring-brand-green/50 focus:border-brand-green outline-none transition-all placeholder:text-zinc-700 font-mono text-lg remove-arrow"
                    />
                </div>

                {/* Prop Type Dropdown (half width on mobile, 3 cols on MD) */}
                <div className="col-span-6 md:col-span-3 relative group">
                    <div className="absolute top-2 left-4 text-[10px] uppercase font-black tracking-widest text-zinc-600 pointer-events-none group-focus-within:text-brand-cyan transition-colors">Market</div>
                    <select
                        value={propType}
                        onChange={(e) => setPropType(e.target.value)}
                        disabled={isAnalyzing}
                        className="w-full h-16 bg-zinc-900/40 border border-zinc-800 text-zinc-100 px-4 pt-5 pb-1 rounded-lg focus:ring-1 focus:ring-brand-cyan/50 focus:border-brand-cyan outline-none transition-all appearance-none font-bold text-sm md:text-lg cursor-pointer truncate pr-8"
                    >
                        {PROP_TYPES.map((type) => (
                            <option key={type} value={type} className="bg-zinc-900">{type}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 mt-2 -translate-y-1/2 text-zinc-600 pointer-events-none w-5 h-5 group-hover:text-zinc-400 transition-colors" />
                </div>

                {/* Analyze Button (Full width on mobile, 2 cols on MD) */}
                <div className="col-span-12 md:col-span-2">
                    <button
                        onClick={onAnalyze}
                        disabled={isAnalyzing || !player || !propValue}
                        className={`w-full h-16 flex items-center justify-center gap-2 font-black uppercase tracking-wider rounded-lg transition-all transform active:scale-[0.98]
                        ${isAnalyzing || !player || !propValue
                                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-700'
                                : 'bg-brand-cyan hover:bg-cyan-400 text-brand-black shadow-[0_0_20px_rgba(64,240,255,0.4)] hover:shadow-[0_0_30px_rgba(64,240,255,0.6)] border border-brand-cyan'
                            }`}
                    >
                        {isAnalyzing ? (
                            <div className="flex items-center gap-2 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-black animate-bounce" />
                                <span className="w-2 h-2 rounded-full bg-black animate-bounce delay-75" />
                                <span className="w-2 h-2 rounded-full bg-black animate-bounce delay-150" />
                            </div>
                        ) : (
                            <>SCOUT <Search className="w-4 h-4 ml-1 stroke-2" /></>
                        )}
                    </button>
                </div>
            </div>
            <style jsx>{`
                /* Remove arrows from number input */
                .remove-arrow::-webkit-outer-spin-button,
                .remove-arrow::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                .remove-arrow {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
};

