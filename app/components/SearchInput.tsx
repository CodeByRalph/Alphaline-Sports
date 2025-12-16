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
        <div className="w-full max-w-4xl mx-auto bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-[1.5fr_0.8fr_1.2fr_1fr] gap-4">
                {/* Player Input */}
                <div className="relative group">
                    <input
                        type="text"
                        placeholder="PLAYER (e.g. Lamar Jackson)"
                        value={player}
                        onChange={(e) => setPlayer(e.target.value)}
                        disabled={isAnalyzing}
                        className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-600 font-mono"
                    />
                </div>

                {/* Prop Value Input */}
                <div className="relative group">
                    <input
                        type="number"
                        placeholder="LINE (e.g. 215.5)"
                        value={propValue}
                        onChange={(e) => setPropValue(e.target.value)}
                        disabled={isAnalyzing}
                        className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-zinc-600 font-mono remove-arrow"
                    />
                </div>

                {/* Prop Type Dropdown */}
                <div className="relative group">
                    <select
                        value={propType}
                        onChange={(e) => setPropType(e.target.value)}
                        disabled={isAnalyzing}
                        className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none font-mono cursor-pointer"
                    >
                        {PROP_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none w-4 h-4" />
                </div>

                {/* Analyze Button */}
                <button
                    onClick={onAnalyze}
                    disabled={isAnalyzing || !player || !propValue}
                    className={`flex items-center justify-center gap-2 font-bold uppercase tracking-wider rounded-xl transition-all
                    ${isAnalyzing || !player || !propValue
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:shadow-[0_0_30px_rgba(79,70,229,0.7)]'
                        } py-3 px-6`}
                >
                    {isAnalyzing ? (
                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running</span>
                    ) : (
                        <>Run Analysis</>
                    )}
                </button>
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

