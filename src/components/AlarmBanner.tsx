import React from 'react';
import { BellRing, VolumeX, CheckCircle } from 'lucide-react';

interface Props {
  isRinging: boolean;
  alarmTitle: string;
  alarmDesc: string;
  onSilence: () => void;
  onEndBreak?: () => void;
  isOnBreak: boolean;
}

export const AlarmBanner: React.FC<Props> = ({
  isRinging,
  alarmTitle,
  alarmDesc,
  onSilence,
  onEndBreak,
  isOnBreak,
}) => {
  if (!isRinging) return null;

  return (
    <div className="mx-4 my-3 p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-red-900/90 to-amber-950/90 border-2 border-rose-500 shadow-2xl shadow-rose-950/80 backdrop-blur-md animate-bounce text-white">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-rose-500 text-white shrink-0 animate-pulse">
          <BellRing className="w-6 h-6 animate-wiggle" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-sm sm:text-base tracking-wide text-rose-200">
            {alarmTitle}
          </h3>
          <p className="text-xs text-rose-100/90 mt-0.5 leading-relaxed">
            {alarmDesc}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onSilence}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-slate-700 transition active:scale-95 shadow"
            >
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>Wycisz dźwięk</span>
            </button>

            {isOnBreak && onEndBreak && (
              <button
                onClick={onEndBreak}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition active:scale-95 shadow"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Zakończ przerwę teraz</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
