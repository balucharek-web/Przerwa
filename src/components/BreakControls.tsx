import React from 'react';
import { Coffee, Pause, Play } from 'lucide-react';

interface Props {
  isOnBreak: boolean;
  onToggleBreak: () => void;
}

export const BreakControls: React.FC<Props> = ({
  isOnBreak,
  onToggleBreak,
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-4 px-4 my-2">
      {/* Primary Punch Button */}
      <button
        onClick={onToggleBreak}
        className={`w-full max-w-sm py-4 px-6 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-95 shadow-xl select-none ${
          isOnBreak
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-red-950/60 ring-4 ring-rose-500/30 animate-pulse'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 hover:shadow-emerald-900/40 ring-4 ring-emerald-500/20'
        }`}
      >
        <div className={`p-2 rounded-xl ${isOnBreak ? 'bg-red-800/80' : 'bg-emerald-700/80'} shrink-0`}>
          {isOnBreak ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white fill-white" />
          )}
        </div>
        <div className="text-left flex-1 min-w-0">
          <div className="text-base font-extrabold uppercase">
            {isOnBreak ? 'Zakończ przerwę (stop)' : 'Rozpocznij przerwę (start)'}
          </div>
          <div className="text-xs font-normal opacity-90 truncate">
            {isOnBreak ? 'Dotknij, aby wysłać stop i zapisać czas' : 'Dotknij, aby wysłać start i włączyć stoper'}
          </div>
        </div>
        <Coffee className="w-5 h-5 opacity-80 shrink-0" />
      </button>
    </div>
  );
};
