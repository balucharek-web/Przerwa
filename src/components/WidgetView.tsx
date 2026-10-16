import React, { useState } from 'react';
import {
  Play,
  Pause,
  Coffee,
  Maximize2,
  Minimize2,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Info,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { AppSettings, BreakRecord } from '../types';

interface Props {
  isOnBreak: boolean;
  currentBreakStart: number;
  records: BreakRecord[];
  currentCycle: string;
  settings: AppSettings;
  onStartBreak: () => void;
  onStopBreak: () => void;
  onSwitchToFullApp: () => void;
}

export const WidgetView: React.FC<Props> = ({
  isOnBreak,
  currentBreakStart,
  records,
  currentCycle,
  settings,
  onStartBreak,
  onStopBreak,
  onSwitchToFullApp,
}) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [pipActive, setPipActive] = useState(false);

  // Compute timing
  const now = Date.now();
  const activeSec = isOnBreak && currentBreakStart > 0 ? Math.max(0, Math.floor((now - currentBreakStart) / 1000)) : 0;
  const todayRecords = records.filter(r => r.dateString === currentCycle);
  const completedSec = todayRecords.reduce((acc, cur) => acc + cur.durationSeconds, 0);
  const totalUsedSec = completedSec + activeSec;
  const limitSec = settings.dailyLimitMinutes * 60;
  const remainingSec = limitSec - totalUsedSec;

  const formatTimerDigits = (sec: number) => {
    const s = Math.max(0, sec);
    const m = Math.floor(s / 60);
    const remS = s % 60;
    return `${String(m).padStart(2, '0')}:${String(remS).padStart(2, '0')}`;
  };

  const handlePiP = async () => {
    try {
      // Document Picture-in-Picture API check
      if ('documentPictureInPicture' in window) {
        // @ts-expect-error Document PiP is experimental in TS types
        const pipWindow = await window.documentPictureInPicture.requestWindow({
          width: 320,
          height: 380,
        });

        // Copy styles to PiP window
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = document.createElement('style');
            style.textContent = cssRules;
            pipWindow.document.head.appendChild(style);
          } catch {
            const link = document.createElement('link');
            if (styleSheet.href) {
              link.rel = 'stylesheet';
              link.type = styleSheet.type;
              link.media = styleSheet.media.mediaText;
              link.href = styleSheet.href;
              pipWindow.document.head.appendChild(link);
            }
          }
        });

        const container = document.createElement('div');
        container.id = 'pip-root';
        container.className = 'bg-slate-950 text-white min-h-screen p-4 flex flex-col justify-center items-center font-sans';
        pipWindow.document.body.appendChild(container);
        setPipActive(true);

        pipWindow.addEventListener('pagehide', () => {
          setPipActive(false);
        });
      } else {
        alert('Przeglądarka na tym urządzeniu nie obsługuje jeszcze pływających okien Picture-in-Picture. Możesz dodać widżet bezpośrednio do ekranu głównego telefonu!');
      }
    } catch (err) {
      console.warn('Błąd otwarcia PiP:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 max-w-md mx-auto select-none">
      {/* Top Bar of Widget */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <span>Widżet Przerwy</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                WIDGET
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Sterowanie i zegar na żywo</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Jak dodać do ekranu głównego"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={onSwitchToFullApp}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shadow"
            title="Wróć do pełnego widoku aplikacji"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Aplikacja</span>
          </button>
        </div>
      </div>

      {/* Instructions Guide Modal / Banner */}
      {showInstructions && (
        <div className="my-2 p-3.5 rounded-2xl bg-slate-900 border border-blue-500/40 text-xs text-slate-200 space-y-2 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              Jak mieć ten widżet na pulpicie:
            </span>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed">
            <li>Kliknij <strong className="text-white">menu przeglądarki (3 kropki)</strong> w prawym górnym rogu.</li>
            <li>Wybierz <strong className="text-white">„Dodaj do ekranu głównego”</strong> lub <strong className="text-white">„Zainstaluj aplikację”</strong>.</li>
            <li>Po zainstalowaniu możesz przytrzymać palec na ikonie na pulpicie — rozwinie się menu skrótów ze skrótami <strong className="text-emerald-400">Start</strong> i <strong className="text-rose-400">Stop</strong>, które możesz wyciągnąć prosto na ekran telefonu!</li>
          </ol>
        </div>
      )}

      {/* Main Center Clock Card */}
      <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
        {/* Status indicator */}
        <div className="mb-3">
          {isOnBreak ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-widest animate-pulse shadow-lg shadow-rose-950/40">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              Przerwa w toku
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Stanowisko pracy
            </span>
          )}
        </div>

        {/* Big Digital Timer Display */}
        <div className="my-2">
          <div className={`font-mono text-6xl sm:text-7xl font-black tracking-tight tabular-nums drop-shadow-md ${
            isOnBreak
              ? 'text-white'
              : remainingSec <= 180
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`}>
            {isOnBreak ? formatTimerDigits(activeSec) : formatTimerDigits(remainingSec)}
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">
            {isOnBreak ? 'Czas trwania obecnej przerwy' : 'Pozostały limit na dzisiaj'}
          </div>
        </div>

        {/* Daily Quota Summary Bar */}
        <div className="w-full max-w-xs mt-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1.5">
            <span>Dzisiejszy limit: {settings.dailyLimitMinutes} min</span>
            <span className={remainingSec <= 0 ? 'text-rose-400' : 'text-emerald-400'}>
              {remainingSec >= 0 ? `${Math.floor(remainingSec / 60)}m pozostało` : `Przekroczono o ${Math.floor(-remainingSec / 60)}m`}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                remainingSec <= 0
                  ? 'bg-rose-500'
                  : remainingSec <= 180
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, (totalUsedSec / (limitSec || 1)) * 100))}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
            <span>Wykorzystano: {Math.floor(totalUsedSec / 60)} min</span>
            <span>Reset: {String(settings.autoResetHour).padStart(2, '0')}:{String(settings.autoResetMinute).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons: START & STOP */}
      <div className="space-y-3 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {/* START BUTTON */}
          <button
            onClick={onStartBreak}
            disabled={isOnBreak}
            className={`py-4 px-4 rounded-2xl font-black text-sm tracking-wider uppercase flex flex-col items-center justify-center gap-1.5 transition-all shadow-xl active:scale-95 ${
              !isOnBreak
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-950/60 ring-4 ring-emerald-500/20 cursor-pointer'
                : 'bg-slate-900/60 border border-slate-800 text-slate-500 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className={`p-2 rounded-xl ${!isOnBreak ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
              <Play className="w-6 h-6 fill-current" />
            </div>
            <span>START</span>
            <span className="text-[10px] font-normal opacity-80 lowercase">wyślij start na czat</span>
          </button>

          {/* STOP BUTTON */}
          <button
            onClick={onStopBreak}
            disabled={!isOnBreak}
            className={`py-4 px-4 rounded-2xl font-black text-sm tracking-wider uppercase flex flex-col items-center justify-center gap-1.5 transition-all shadow-xl active:scale-95 ${
              isOnBreak
                ? 'bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-rose-950/70 ring-4 ring-rose-500/30 animate-pulse cursor-pointer'
                : 'bg-slate-900/60 border border-slate-800 text-slate-500 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className={`p-2 rounded-xl ${isOnBreak ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
              <Pause className="w-6 h-6" />
            </div>
            <span>STOP</span>
            <span className="text-[10px] font-normal opacity-80 lowercase">wyślij stop na czat</span>
          </button>
        </div>

        {/* Picture-in-Picture floating option */}
        <button
          onClick={handlePiP}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Otwórz jako pływające okno nad innymi aplikacjami</span>
        </button>
      </div>
    </div>
  );
};
