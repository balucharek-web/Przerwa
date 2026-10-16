/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  Calendar,
  Settings as SettingsIcon,
  Sliders,
  Volume2,
  CheckCircle2,
  BellRing,
} from 'lucide-react';
import { BreakRecord, AppSettings, ActiveTab } from './types';
import { alarmService } from './services/alarm';
import { TodayView } from './components/TodayView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { AlarmBanner } from './components/AlarmBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { sendGoogleChatNotification } from './services/googleChat';

const DEFAULT_SETTINGS: AppSettings = {
  dailyLimitMinutes: 30,
  autoResetHour: 0, // 24:00 / midnight default
  autoResetMinute: 0,
  autoMonthlyReset: true,
  soundEnabled: true,
  vibrationEnabled: true,
  warningMinutes: 3,
  googleChatStartMessage: 'start',
  googleChatEndMessage: 'stop',
};

export default function App() {
  // Load settings from localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('czas_przerwy_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      // Fallback to legacy single keys if existing
      const limit = parseInt(localStorage.getItem('daily_limit_minutes') || '30', 10);
      const hour = parseInt(localStorage.getItem('auto_reset_hour') || '0', 10);
      const min = parseInt(localStorage.getItem('auto_reset_minute') || '0', 10);
      const monthly = JSON.parse(localStorage.getItem('auto_monthly_reset') || 'true');
      return {
        ...DEFAULT_SETTINGS,
        dailyLimitMinutes: limit,
        autoResetHour: hour,
        autoResetMinute: min,
        autoMonthlyReset: monthly,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');

  // Break state
  const [isOnBreak, setIsOnBreak] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem('is_on_break') || 'false');
    } catch {
      return false;
    }
  });

  const [currentBreakStart, setCurrentBreakStart] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('current_break_start') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [alarm3MinFired, setAlarm3MinFired] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem('alarm_3min_fired') || 'false');
    } catch {
      return false;
    }
  });

  const [alarmLimitFired, setAlarmLimitFired] = useState<boolean>(false);

  // Alarm ringing & banner state
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [alarmTitle, setAlarmTitle] = useState<string>('');
  const [alarmDesc, setAlarmDesc] = useState<string>('');

  // History records
  const [records, setRecords] = useState<BreakRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('break_history') || '[]');
    } catch {
      return [];
    }
  });

  // Calculate current cycle date string YYYY-MM-DD
  const getCycleDate = useCallback((nowMs: number = Date.now()) => {
    const offsetMs = (settings.autoResetHour * 60 + settings.autoResetMinute) * 60 * 1000;
    const d = new Date(nowMs - offsetMs);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, [settings.autoResetHour, settings.autoResetMinute]);

  const [currentCycle, setCurrentCycle] = useState<string>(() => getCycleDate());

  // Listen to alarm service state changes
  useEffect(() => {
    const unsubscribe = alarmService.subscribe((ringing) => {
      setIsRinging(ringing);
    });
    return unsubscribe;
  }, []);

  // Save settings on update
  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newPartial };
      localStorage.setItem('czas_przerwy_settings', JSON.stringify(updated));
      localStorage.setItem('daily_limit_minutes', updated.dailyLimitMinutes.toString());
      localStorage.setItem('auto_reset_hour', updated.autoResetHour.toString());
      localStorage.setItem('auto_reset_minute', updated.autoResetMinute.toString());
      localStorage.setItem('auto_monthly_reset', JSON.stringify(updated.autoMonthlyReset));
      return updated;
    });
  };

  // Automatically configure webhook if passed via URL (e.g. ?webhook=https://chat.googleapis.com/...)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const wh = params.get('webhook');
        const usr = params.get('user');
        if (wh && wh.startsWith('https://chat.googleapis.com/')) {
          handleUpdateSettings({
            googleChatWebhookUrl: wh.trim(),
            ...(usr ? { googleChatUserName: usr.trim() } : {}),
          });
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Check rollovers (daily cycle & monthly)
  const checkRollovers = useCallback(() => {
    const cycle = getCycleDate();
    const lastCycle = localStorage.getItem('last_cycle_date') || '';

    if (lastCycle && lastCycle !== cycle) {
      // Day rollover reached
      setIsOnBreak(false);
      setCurrentBreakStart(0);
      setAlarm3MinFired(false);
      setAlarmLimitFired(false);
      localStorage.setItem('is_on_break', 'false');
      localStorage.setItem('current_break_start', '0');
      localStorage.setItem('alarm_3min_fired', 'false');
      alarmService.stopAlarm();
    }
    localStorage.setItem('last_cycle_date', cycle);
    setCurrentCycle(cycle);

    // Monthly rollover check
    if (settings.autoMonthlyReset) {
      const currentMonth = cycle.substring(0, 7);
      const lastMonth = localStorage.getItem('last_month_checked') || currentMonth;
      if (lastMonth !== currentMonth) {
        setRecords(prev => {
          const filtered = prev.filter(item => item.dateString.startsWith(currentMonth));
          localStorage.setItem('break_history', JSON.stringify(filtered));
          return filtered;
        });
      }
      localStorage.setItem('last_month_checked', currentMonth);
    }
  }, [getCycleDate, settings.autoMonthlyReset]);

  // Main real-time ticker
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
      checkRollovers();

      // Check break timer and alarms
      if (isOnBreak && currentBreakStart > 0) {
        const now = Date.now();
        const activeSec = Math.max(0, Math.floor((now - currentBreakStart) / 1000));
        const todayRecords = records.filter(r => r.dateString === currentCycle);
        const completedSec = todayRecords.reduce((acc, cur) => acc + cur.durationSeconds, 0);
        const totalUsedSec = completedSec + activeSec;
        const limitSec = settings.dailyLimitMinutes * 60;
        const remainingSec = limitSec - totalUsedSec;

        // 3-Minute Warning Alarm (180 sec)
        if (remainingSec <= 180 && remainingSec > 0 && !alarm3MinFired) {
          setAlarm3MinFired(true);
          localStorage.setItem('alarm_3min_fired', 'true');
          setAlarmTitle('⏰ UWAGA! Zostały tylko 3 minuty przerwy!');
          setAlarmDesc('Twój limit przerwy dobiega końca. Przygotuj się do powrotu na stanowisko.');
          alarmService.startAlarm({
            sound: settings.soundEnabled,
            vibration: settings.vibrationEnabled,
          });
          sendGoogleChatNotification({
            type: 'warning',
            settings,
            remainingSeconds: remainingSec,
          });
        }

        // Limit Exceeded Alarm (<= 0 sec)
        if (remainingSec <= 0 && !alarmLimitFired) {
          setAlarmLimitFired(true);
          setAlarmTitle(`🚨 LIMIT ${settings.dailyLimitMinutes} MINUT WYCZERPANY!`);
          setAlarmDesc('Czas przerwy dobiegł końca! Wróć do pracy, aby nie generować nadgodzin.');
          alarmService.startAlarm({
            sound: settings.soundEnabled,
            vibration: settings.vibrationEnabled,
          });
          sendGoogleChatNotification({
            type: 'exceeded',
            settings,
            remainingSeconds: remainingSec,
          });
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [
    isOnBreak,
    currentBreakStart,
    records,
    currentCycle,
    settings,
    alarm3MinFired,
    alarmLimitFired,
    checkRollovers,
  ]);

  // Toggle start / stop break
  const handleToggleBreak = () => {
    alarmService.initAudio();
    checkRollovers();
    const now = Date.now();

    if (!isOnBreak) {
      // START BREAK
      setIsOnBreak(true);
      setCurrentBreakStart(now);
      setAlarm3MinFired(false);
      setAlarmLimitFired(false);
      localStorage.setItem('is_on_break', 'true');
      localStorage.setItem('current_break_start', now.toString());
      localStorage.setItem('alarm_3min_fired', 'false');

      const todayRecords = records.filter(r => r.dateString === currentCycle);
      const completedSec = todayRecords.reduce((acc, cur) => acc + cur.durationSeconds, 0);
      const remainingSec = (settings.dailyLimitMinutes * 60) - completedSec;
      sendGoogleChatNotification({
        type: 'start',
        settings,
        remainingSeconds: remainingSec,
        totalUsedSeconds: completedSec,
      });
    } else {
      // END BREAK
      const elapsed = Math.max(1, Math.floor((now - currentBreakStart) / 1000));
      const newRecord: BreakRecord = {
        id: Date.now(),
        dateString: getCycleDate(currentBreakStart || now),
        startTimeMs: currentBreakStart || now,
        endTimeMs: now,
        durationSeconds: elapsed,
      };

      const updated = [newRecord, ...records];
      setRecords(updated);
      localStorage.setItem('break_history', JSON.stringify(updated));

      const todayRecords = updated.filter(r => r.dateString === currentCycle);
      const newTotalUsed = todayRecords.reduce((acc, cur) => acc + cur.durationSeconds, 0);
      const newRemaining = (settings.dailyLimitMinutes * 60) - newTotalUsed;

      sendGoogleChatNotification({
        type: 'end',
        settings,
        durationSeconds: elapsed,
        totalUsedSeconds: newTotalUsed,
        remainingSeconds: newRemaining,
      });

      setIsOnBreak(false);
      setCurrentBreakStart(0);
      setAlarm3MinFired(false);
      setAlarmLimitFired(false);
      localStorage.setItem('is_on_break', 'false');
      localStorage.setItem('current_break_start', '0');
      localStorage.setItem('alarm_3min_fired', 'false');
      alarmService.stopAlarm();

      // Confetti celebration if return on time
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10B981', '#34D399', '#6EE7B7'],
        });
      } catch {
        // ignore
      }
    }
  };

  // Delete single record
  const handleDeleteRecord = (id: number) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem('break_history', JSON.stringify(updated));
  };

  // Clear specific month
  const handleClearMonth = (yearMonth: string) => {
    const updated = records.filter(r => !r.dateString.startsWith(yearMonth));
    setRecords(updated);
    localStorage.setItem('break_history', JSON.stringify(updated));
  };

  // Clear all data
  const handleClearAllData = () => {
    setRecords([]);
    setIsOnBreak(false);
    setCurrentBreakStart(0);
    setAlarm3MinFired(false);
    setAlarmLimitFired(false);
    localStorage.removeItem('break_history');
    localStorage.setItem('is_on_break', 'false');
    localStorage.setItem('current_break_start', '0');
    localStorage.setItem('alarm_3min_fired', 'false');
    alarmService.stopAlarm();
  };

  // Test Alarm
  const handleTestAlarm = () => {
    alarmService.initAudio();
    setAlarmTitle('🔊 Test dźwięku alarmu (3 minuty)');
    setAlarmDesc('Sprawdź głośność sygnału dwutonowego i wibracje na telefonie.');
    alarmService.startAlarm({
      sound: true,
      vibration: true,
    });
  };

  const handleSilenceAlarm = () => {
    alarmService.stopAlarm();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="./icon-192.png"
            alt="Logo"
            className="w-8 h-8 rounded-xl shadow-md border border-slate-700/60 object-cover"
          />
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Czas Przerwy</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PWA
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Test Button */}
          <button
            onClick={handleTestAlarm}
            className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition active:scale-95"
            title="Przetestuj alarm 3 minut"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`p-2 rounded-xl transition active:scale-95 ${
              activeTab === 'settings'
                ? 'text-emerald-400 bg-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Otwórz ustawienia"
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Alarm Banner if active */}
      <AlarmBanner
        isRinging={isRinging}
        alarmTitle={alarmTitle}
        alarmDesc={alarmDesc}
        onSilence={handleSilenceAlarm}
        onEndBreak={handleToggleBreak}
        isOnBreak={isOnBreak}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 pt-2">
        {activeTab === 'today' && (
          <TodayView
            isOnBreak={isOnBreak}
            currentBreakStart={currentBreakStart}
            records={records}
            currentCycle={currentCycle}
            settings={settings}
            onToggleBreak={handleToggleBreak}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onClearMonth={handleClearMonth}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onTestAlarm={handleTestAlarm}
            onClearAllData={handleClearAllData}
            onBackToToday={() => setActiveTab('today')}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-lg px-4 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition ${
            activeTab === 'today'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Clock className="w-5 h-5" />
            {isOnBreak && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <span className="text-[11px] tracking-wide">Dzisiaj</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition ${
            activeTab === 'history'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[11px] tracking-wide">Historia</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition ${
            activeTab === 'settings'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[11px] tracking-wide">Ustawienia</span>
        </button>
      </nav>

      {/* Offline Connectivity Notification Banner */}
      <OfflineIndicator />
    </div>
  );
}
