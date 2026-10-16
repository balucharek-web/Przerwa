import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, Trash2, Calendar, Coffee, Sparkles } from 'lucide-react';
import { BreakRecord, AppSettings } from '../types';
import { CircularGauge } from './CircularGauge';
import { BreakControls } from './BreakControls';
import { PWAInstallButton } from './PWAInstallButton';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOnBreak: boolean;
  currentBreakStart: number;
  records: BreakRecord[];
  currentCycle: string;
  settings: AppSettings;
  onToggleBreak: () => void;
  onDeleteRecord: (id: number) => void;
}

export const TodayView: React.FC<Props> = ({
  isOnBreak,
  currentBreakStart,
  records,
  currentCycle,
  settings,
  onToggleBreak,
  onDeleteRecord,
}) => {
  const { isInstalled } = usePWAInstall();

  // Calculate active seconds right now
  const now = Date.now();
  const activeSec = isOnBreak && currentBreakStart > 0 ? Math.max(0, Math.floor((now - currentBreakStart) / 1000)) : 0;

  // Filter records for current cycle
  const todayRecords = records.filter(r => r.dateString === currentCycle);
  const completedSec = todayRecords.reduce((acc, cur) => acc + cur.durationSeconds, 0);
  const totalUsedSec = completedSec + activeSec;
  const limitSec = settings.dailyLimitMinutes * 60;
  const remainingSec = limitSec - totalUsedSec;

  const formatHoursMins = (totalSec: number) => {
    const s = Math.max(0, totalSec);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM}m`;
    }
    return sec > 0 && m < 10 ? `${m}m ${sec}s` : `${m}m`;
  };

  const formatTimeString = (timestampMs: number) => {
    return new Date(timestampMs).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto pb-10">
      {/* PWA Prompt Banner if not installed */}
      {!isInstalled && (
        <div className="w-full px-4 pt-2">
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/20 text-xs text-slate-300 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Zainstaluj aplikację na telefonie, by mieć widżet i pełny ekran.</span>
            </div>
            <PWAInstallButton variant="nav" />
          </div>
        </div>
      )}

      {/* Circular Progress Gauge */}
      <CircularGauge
        remainingSec={remainingSec}
        totalLimitSec={limitSec}
        totalUsedSec={totalUsedSec}
        isOnBreak={isOnBreak}
        activeSec={activeSec}
        limitMinutes={settings.dailyLimitMinutes}
      />

      {/* Main Punch Controls */}
      <BreakControls
        isOnBreak={isOnBreak}
        onToggleBreak={onToggleBreak}
      />

      {/* KPI Stat Cards */}
      <div className="w-full px-4 grid grid-cols-3 gap-2.5 my-3">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Wykorzystano</div>
          <div className="text-base font-extrabold text-white mt-1 tabular-nums">
            {formatHoursMins(totalUsedSec)}
          </div>
          <div className="text-[10px] text-slate-500">
            {Math.round((totalUsedSec / (limitSec || 1)) * 100)}% limitu
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pozostało</div>
          <div className={`text-base font-extrabold mt-1 tabular-nums ${
            remainingSec <= 0 ? 'text-rose-500' : remainingSec <= 180 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {remainingSec >= 0 ? formatHoursMins(remainingSec) : `0m`}
          </div>
          <div className="text-[10px] text-slate-500">
            {remainingSec < 0 ? 'Limit przekroczony' : 'Do dyspozycji'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sesje dzisiaj</div>
          <div className="text-base font-extrabold text-blue-400 mt-1 tabular-nums">
            {todayRecords.length + (isOnBreak ? 1 : 0)}
          </div>
          <div className="text-[10px] text-slate-500">
            {isOnBreak ? '1 w toku' : 'zakończone'}
          </div>
        </div>
      </div>

      {/* Today's Break Sessions List */}
      <div className="w-full px-4 mt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Dzisiejsze przerwy ({todayRecords.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Cykl: od {String(settings.autoResetHour).padStart(2, '0')}:{String(settings.autoResetMinute).padStart(2, '0')}
          </span>
        </div>

        {todayRecords.length === 0 && !isOnBreak ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center text-slate-500">
            <Coffee className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-xs font-medium">Brak zarejestrowanych przerw w tym cyklu.</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Uruchom przerwę zielonym przyciskiem, gdy wychodzisz ze stanowiska.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* If currently on break */}
            {isOnBreak && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 flex items-center justify-between text-xs animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  <div>
                    <div className="font-bold text-amber-300">Przerwa w toku...</div>
                    <div className="text-[11px] text-slate-400">
                      Start: {formatTimeString(currentBreakStart)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold tabular-nums border border-amber-500/30">
                    +{formatHoursMins(activeSec)}
                  </span>
                </div>
              </div>
            )}

            {/* List of completed breaks */}
            {todayRecords.map((item, index) => {
              const startFormatted = formatTimeString(item.startTimeMs);
              const endFormatted = formatTimeString(item.endTimeMs);

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition flex items-center justify-between text-xs shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-[11px] font-bold shrink-0">
                      #{todayRecords.length - index}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200">
                        {startFormatted} &ndash; {endFormatted}
                      </div>
                      {item.note && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {item.note}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold tabular-nums border border-emerald-500/20 text-[11px]">
                      {formatHoursMins(item.durationSeconds)}
                    </span>
                    <button
                      onClick={() => onDeleteRecord(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Usuń ten wpis"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
