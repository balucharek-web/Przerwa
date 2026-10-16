import React, { useState } from 'react';
import {
  Sliders,
  Bell,
  Moon,
  RefreshCw,
  Volume2,
  Smartphone,
  Trash2,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clipboard,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { AppSettings } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { sendGoogleChatNotification } from '../services/googleChat';

interface Props {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onTestAlarm: () => void;
  onClearAllData: () => void;
  onBackToToday?: () => void;
}

export const SettingsView: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onTestAlarm,
  onClearAllData,
  onBackToToday,
}) => {
  const [testWebhookStatus, setTestWebhookStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const [showWebhookHelp, setShowWebhookHelp] = useState(false);
  const [confirmClearData, setConfirmClearData] = useState(false);

  const limitPresets = [15, 20, 25, 30, 45, 60];
  const resetHourPresets = [
    { label: '00:00 (24:00 / Północ — domyślna)', hour: 0, min: 0 },
    { label: '06:00 (Ranna zmiana)', hour: 6, min: 0 },
    { label: '07:00 (Standardowa)', hour: 7, min: 0 },
    { label: '14:00 (Popołudniowa)', hour: 14, min: 0 },
    { label: '22:00 (Nocna zmiana)', hour: 22, min: 0 },
  ];

  const handleTestWebhook = async () => {
    if (!settings.googleChatWebhookUrl?.trim()) {
      setTestWebhookStatus({
        loading: false,
        success: false,
        message: 'Wklej adres URL webhooka Google Chat przed testem.',
      });
      return;
    }

    setTestWebhookStatus({ loading: true });
    const result = await sendGoogleChatNotification({
      type: 'test',
      settings,
    });

    setTestWebhookStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
  };

  const handlePasteWebhook = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          onUpdateSettings({ googleChatWebhookUrl: text.trim() });
          setTestWebhookStatus({
            loading: false,
            success: true,
            message: 'Pomyślnie wklejono link ze schowka! Możesz teraz przetestować webhook.',
          });
          return;
        }
      }
    } catch (err) {
      console.warn('Clipboard readText restricted:', err);
    }

    // Direct browser prompt dialog
    const pasted = window.prompt(
      'Wklej tutaj skopiowany link do webhooka Google Chat:',
      settings.googleChatWebhookUrl || ''
    );
    if (pasted && pasted.trim()) {
      onUpdateSettings({ googleChatWebhookUrl: pasted.trim() });
      setTestWebhookStatus({
        loading: false,
        success: true,
        message: 'Pomyślnie wklejono link!',
      });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-12 animate-in fade-in">
      {/* Top Header in View */}
      <div className="flex items-center justify-between p-3.5 my-3 rounded-2xl bg-slate-900 border border-slate-800 shadow">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-white">Ustawienia aplikacji</h2>
            <p className="text-[11px] text-slate-400">Limity, powiadomienia i integracja Google Chat</p>
          </div>
        </div>

        {onBackToToday && (
          <button
            onClick={onBackToToday}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wróć</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* SECTION: GOOGLE CHAT WEBHOOK INTEGRATION */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-900 border border-blue-500/30 space-y-4 shadow-lg shadow-blue-950/20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>Google Chat — Webhook</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
                    Aktywne
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Wysyłaj automatyczne powiadomienia na kanał/spację
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowWebhookHelp(!showWebhookHelp)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showWebhookHelp ? 'Ukryj pomoc' : 'Instrukcja'}</span>
            </button>
          </div>

          {/* Expandable instruction */}
          {showWebhookHelp && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-300 space-y-2">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Jak uzyskać webhook w Google Chat:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <li>Otwórz <strong className="text-white">Google Chat</strong> i wejdź do swojego pokoju.</li>
                <li>Kliknij nazwę pokoju na górze i wybierz <strong className="text-white">Aplikacje i integracje</strong>.</li>
                <li>W sekcji <strong className="text-white">Webhooki</strong> kliknij <strong className="text-white">Dodaj webhook</strong>.</li>
                <li>Wpisz nazwę (np. <em>„Czas Przerwy”</em>) i kliknij Zapisz.</li>
                <li>Skopiuj link i wklej go poniżej (lub kliknij <strong>Wklej ze schowka</strong>).</li>
              </ol>
            </div>
          )}

          {/* Webhook URL Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Adres URL Webhooka Google Chat
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePasteWebhook}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition active:scale-95 shadow-md shadow-blue-950/40"
                  title="Dotknij, aby wkleić link ze schowka"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Wklej ze schowka</span>
                </button>
                {settings.googleChatWebhookUrl && (
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ googleChatWebhookUrl: '' })}
                    className="px-2 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 text-[11px] transition"
                  >
                    Wyczyść
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                name="chat_webhook_url"
                autoComplete="off"
                data-form-type="other"
                data-lpignore="true"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="https://chat.googleapis.com/v1/spaces/.../messages?key=...&token=..."
                value={settings.googleChatWebhookUrl || ''}
                onChange={(e) => onUpdateSettings({ googleChatWebhookUrl: e.target.value.trim() })}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono select-text resize-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Wskazówka: Możesz przytrzymać palec na polu i wybrać <strong>Wklej</strong>, lub kliknąć niebieski przycisk <strong>„Wklej ze schowka”</strong>.
            </p>
          </div>

          {/* User Name / Nick */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Twój podpis / Nick (Imię lub stanowisko)
            </label>
            <input
              type="text"
              placeholder="np. Marcin, Magazyn A, Zmiana 1"
              value={settings.googleChatUserName || ''}
              onChange={(e) => onUpdateSettings({ googleChatUserName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Custom Message Texts */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Wiadomość przy starcie
              </label>
              <input
                type="text"
                placeholder="start"
                value={settings.googleChatStartMessage ?? 'start'}
                onChange={(e) => onUpdateSettings({ googleChatStartMessage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Wiadomość przy końcu (stop)
              </label>
              <input
                type="text"
                placeholder="stop"
                value={settings.googleChatEndMessage ?? 'stop'}
                onChange={(e) => onUpdateSettings({ googleChatEndMessage: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Event Toggles */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Wysyłaj powiadomienia o:
            </div>

            <label className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer py-1">
              <span className="flex items-center gap-2">
                <span>☕</span>
                <span>Rozpoczęcie przerwy (start timera)</span>
              </span>
              <input
                type="checkbox"
                checked={settings.googleChatNotifyOnStart ?? true}
                onChange={(e) => onUpdateSettings({ googleChatNotifyOnStart: e.target.checked })}
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer py-1">
              <span className="flex items-center gap-2">
                <span>⏰</span>
                <span>Ostrzeżenie na 3 minuty przed końcem limitu</span>
              </span>
              <input
                type="checkbox"
                checked={settings.googleChatNotifyOnWarning ?? true}
                onChange={(e) => onUpdateSettings({ googleChatNotifyOnWarning: e.target.checked })}
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer py-1">
              <span className="flex items-center gap-2">
                <span>✅</span>
                <span>Zakończenie przerwy (powrót na stanowisko)</span>
              </span>
              <input
                type="checkbox"
                checked={settings.googleChatNotifyOnEnd ?? true}
                onChange={(e) => onUpdateSettings({ googleChatNotifyOnEnd: e.target.checked })}
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer py-1">
              <span className="flex items-center gap-2">
                <span>🚨</span>
                <span>Przekroczenie dziennego limitu przerw</span>
              </span>
              <input
                type="checkbox"
                checked={settings.googleChatNotifyOnExceeded ?? true}
                onChange={(e) => onUpdateSettings({ googleChatNotifyOnExceeded: e.target.checked })}
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Test Button & Result */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestWebhook}
              disabled={testWebhookStatus.loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-blue-950/40 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {testWebhookStatus.loading
                  ? 'Wysyłanie wiadomości testowej...'
                  : 'Wyślij wiadomość testową na Google Chat'}
              </span>
            </button>

            {testWebhookStatus.message && (
              <div
                className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                  testWebhookStatus.success
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {testWebhookStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="flex-1 leading-snug">{testWebhookStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: DAILY LIMIT */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Dzienny limit przerw
          </label>
          <div className="grid grid-cols-3 gap-2">
            {limitPresets.map((m) => (
              <button
                key={m}
                onClick={() => onUpdateSettings({ dailyLimitMinutes: m })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
                  settings.dailyLimitMinutes === m
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{m} min</span>
                {m === 30 && <span className="text-[10px] opacity-75">(domyślny)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION: RESET HOUR */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Godzina resetu doby (cyklu pracy)
            </label>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5">
            O tej godzinie licznik przerw automatycznie zeruje się na nowy dzień roboczy.
          </p>
          <div className="space-y-1.5">
            {resetHourPresets.map((preset) => {
              const isSelected =
                settings.autoResetHour === preset.hour && settings.autoResetMinute === preset.min;
              return (
                <button
                  key={preset.label}
                  onClick={() =>
                    onUpdateSettings({ autoResetHour: preset.hour, autoResetMinute: preset.min })
                  }
                  className={`w-full py-2 px-3.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{preset.label}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                </button>
              );
            })}

            {/* Ręczny wybór dowolnej godziny */}
            <div className="pt-2.5 mt-2 border-t border-slate-800">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Ręczna zmiana godziny resetu:
              </label>
              <input
                type="time"
                value={`${String(settings.autoResetHour).padStart(2, '0')}:${String(settings.autoResetMinute).padStart(2, '0')}`}
                onChange={(e) => {
                  const parts = e.target.value.split(':');
                  if (parts.length === 2) {
                    const h = parseInt(parts[0], 10);
                    const m = parseInt(parts[1], 10);
                    if (!isNaN(h) && !isNaN(m)) {
                      onUpdateSettings({ autoResetHour: h, autoResetMinute: m });
                    }
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION: SOUND ALARM & VIBRATION */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Dźwięk i wibracje telefonu
              </span>
            </div>
            <button
              onClick={onTestAlarm}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Testuj alarm</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-medium text-slate-300">Dźwięk alarmu (Web Audio)</div>
              <div className="text-[11px] text-slate-500">Sygnał dźwiękowy przy 3 minutach do końca</div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-medium text-slate-300">Wibracje telefonu</div>
              <div className="text-[11px] text-slate-500">Wibracja pulsacyjna podczas alarmu</div>
            </div>
            <input
              type="checkbox"
              checked={settings.vibrationEnabled}
              onChange={(e) => onUpdateSettings({ vibrationEnabled: e.target.checked })}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* SECTION: MONTHLY RESET */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow">
          <div>
            <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Automatyczny reset miesięczny</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Czyść statystyki z poprzednich miesięcy po przejściu w nowy miesiąc
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.autoMonthlyReset}
            onChange={(e) => onUpdateSettings({ autoMonthlyReset: e.target.checked })}
            className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
          />
        </div>

        {/* SECTION: PWA INSTALLATION */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Aplikacja mobilna PWA</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Zainstaluj Czas Przerwy na ekranie głównym swojego telefonu, aby mieć szybki dostęp i pełny ekran bez pasków przeglądarki.
          </p>
          <PWAInstallButton variant="settings" />
        </div>

        {/* Danger zone: clear all */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          {!confirmClearData ? (
            <button
              onClick={() => setConfirmClearData(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wyczyść całą historię przerw</span>
            </button>
          ) : (
            <div className="space-y-2 text-center">
              <p className="text-xs font-bold text-rose-300">
                Czy na pewno chcesz usunąć całą historię wszystkich przerw i zresetować licznik?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClearData(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Anuluj
                </button>
                <button
                  onClick={() => {
                    onClearAllData();
                    setConfirmClearData(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow"
                >
                  Tak, usuń wszystko
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
