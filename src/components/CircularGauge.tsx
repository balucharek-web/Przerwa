import React from 'react';

interface Props {
  remainingSec: number;
  totalLimitSec: number;
  totalUsedSec: number;
  isOnBreak: boolean;
  activeSec: number;
  limitMinutes: number;
}

export const CircularGauge: React.FC<Props> = ({
  remainingSec,
  totalLimitSec,
  totalUsedSec,
  isOnBreak,
  activeSec,
  limitMinutes,
}) => {
  const radius = 95;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius; // ~596.9

  // Fraction remaining from 0 to 1
  const fraction = Math.max(0, Math.min(1, 1 - (totalUsedSec / (totalLimitSec || 1))));
  const strokeDashoffset = circumference * (1 - fraction);

  const isExceeded = remainingSec < 0;
  const isWarning = remainingSec <= 180 && !isExceeded;

  let strokeColor = '#10B981'; // emerald-500
  let strokeBgColor = 'rgba(16, 185, 129, 0.15)';
  let glowColor = 'rgba(16, 185, 129, 0.3)';

  if (isExceeded) {
    strokeColor = '#EF4444'; // red-500
    strokeBgColor = 'rgba(239, 68, 68, 0.15)';
    glowColor = 'rgba(239, 68, 68, 0.5)';
  } else if (isWarning) {
    strokeColor = '#F59E0B'; // amber-500
    strokeBgColor = 'rgba(245, 158, 11, 0.15)';
    glowColor = 'rgba(245, 158, 11, 0.4)';
  }

  const formatSeconds = (sec: number) => {
    const abs = Math.abs(sec);
    const m = Math.floor(abs / 60);
    const s = abs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timeDisplay = isExceeded ? `-${formatSeconds(remainingSec)}` : formatSeconds(remainingSec);

  return (
    <div className="relative flex flex-col items-center justify-center my-4">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Pulsing glow background when on break */}
        {isOnBreak && (
          <div
            className="absolute inset-4 rounded-full animate-pulse blur-xl -z-10 transition-colors duration-500"
            style={{ backgroundColor: glowColor }}
          />
        )}

        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
          {/* Base track */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="transparent"
            stroke={strokeBgColor}
            strokeWidth={strokeWidth}
            className="transition-colors duration-500"
          />
          {/* Progress fill */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            {isExceeded ? 'Przekroczono limit o' : 'Pozostały czas'}
          </span>

          <div
            className={`text-4xl sm:text-5xl font-black tracking-tight tabular-nums transition-colors duration-300 ${
              isExceeded
                ? 'text-rose-500 animate-pulse'
                : isWarning
                ? 'text-amber-400'
                : 'text-white'
            }`}
          >
            {timeDisplay}
          </div>

          <span className="text-xs text-slate-400 mt-1">
            z limitu {limitMinutes} min
          </span>

          {isOnBreak && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Trwa: {formatSeconds(activeSec)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
