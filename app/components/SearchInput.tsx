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
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <div className="w-full max-w-5xl mx-auto flex items-center justify-center py-4">
            <div className="w-full flex items-center p-1 bg-zinc-900/80 border border-zinc-800 rounded-lg gap-2 shadow-lg backdrop-blur-sm">

                {/* Target Athlete - 50% */}
                <div className="flex-[2] relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className={`w-4 h-4 transition-colors ${isFocused ? 'text-cyan-400' : 'text-zinc-500'}`} />
                    </div>
                    <input
                        type="text"
                        value={player}
                        onChange={(e) => setPlayer(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="TARGET ATHLETE"
                        className="w-full h-12 bg-zinc-950/50 border border-transparent focus:border-cyan-500/50 rounded text-zinc-100 placeholder:text-zinc-600 pl-10 pr-4 text-sm font-bold tracking-wider outline-none transition-all uppercase font-mono"
                    />
                </div>

                {/* Line - Split */}
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={propValue}
                        onChange={(e) => setPropValue(e.target.value)}
                        placeholder="LINE (e.g. 250)"
                        className="w-full h-12 bg-zinc-950/50 border border-transparent focus:border-cyan-500/50 rounded text-zinc-100 placeholder:text-zinc-600 px-4 text-center text-sm font-bold tracking-wider outline-none transition-all font-mono"
                    />
                </div>

                {/* Market - Split */}
                <div className="flex-1 relative">
                    <div className="relative w-full h-12">
                        <select
                            value={propType}
                            onChange={(e) => setPropType(e.target.value)}
                            className="w-full h-full appearance-none bg-zinc-950/50 border border-transparent focus:border-cyan-500/50 rounded text-zinc-100 px-4 text-sm font-bold tracking-wider outline-none transition-all font-mono uppercase cursor-pointer"
                        >
                            {PROP_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                            <ChevronDown className="w-3 h-3" />
                        </div>
                    </div>
                </div>

                {/* Scout Button - Solid Fill */}
                <button
                    onClick={onAnalyze}
                    disabled={isAnalyzing || !player}
                    className={`h-12 px-8 rounded font-bold text-sm tracking-widest transition-all uppercase flex-shrink-0
                        ${isAnalyzing
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6_182_212_0.3)]'
                        }`}
                >
                    {isAnalyzing ? 'SCANNING...' : 'INITIATE SCOUT'}
                </button>
            </div>
        </div>
    );
};

