import { AppSettings } from '../types';

export interface WebhookSendResult {
  success: boolean;
  message?: string;
}

export type GoogleChatEventType = 'start' | 'warning' | 'end' | 'exceeded' | 'test';

export interface GoogleChatPayloadOptions {
  type: GoogleChatEventType;
  settings: AppSettings;
  durationSeconds?: number;
  totalUsedSeconds?: number;
  remainingSeconds?: number;
  activeSeconds?: number;
  customNote?: string;
}

function formatMinutesAndSec(totalSec: number): string {
  const s = Math.max(0, totalSec);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h} godz. ${remM} min`;
  }
  return sec > 0 && m < 10 ? `${m}m ${sec}s` : `${m} min`;
}

function getFormattedTime(): string {
  return new Date().toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function buildGoogleChatMessage(options: GoogleChatPayloadOptions): string {
  const { type, settings, durationSeconds = 0, totalUsedSeconds = 0, remainingSeconds = 0, customNote } = options;
  const userLabel = settings.googleChatUserName?.trim() || 'Pracownik';
  const nowTime = getFormattedTime();
  const limitMin = settings.dailyLimitMinutes || 30;

  switch (type) {
    case 'start':
      return settings.googleChatStartMessage?.trim() || 'start';

    case 'warning':
      return [
        `⏰ *Czas Przerwy* — *OSTRZEŻENIE: Zostały tylko 3 minuty przerwy!*`,
        `👤 *Pracownik:* ${userLabel}`,
        `🕒 *Godzina:* ${nowTime}`,
        `⚠️ Dzienny limit ${limitMin} minut dobiega końca. Przygotuj się do powrotu na stanowisko.`,
      ].join('\n');

    case 'end':
      return settings.googleChatEndMessage?.trim() || 'stop';

    case 'exceeded':
      return [
        `🚨 *Czas Przerwy* — *LIMIT PRZERWY WYCZERPANY!*`,
        `👤 *Pracownik:* ${userLabel}`,
        `🕒 *Godzina:* ${nowTime}`,
        `🛑 Całkowity limit ${limitMin} minut na ten dzień roboczy został wyczerpany!`,
        `⏱ *Aktualne przekroczenie:* ${formatMinutesAndSec(Math.abs(remainingSeconds))}`,
      ].join('\n');

    case 'test':
      return [
        `🔔 *Czas Przerwy* — *Test Webhooka Google Chat*`,
        `👤 *Pracownik:* ${userLabel}`,
        `🕒 *Data i godzina:* ${new Date().toLocaleDateString('pl-PL')} ${nowTime}`,
        `✅ Połączenie z Google Chat zostało pomyślnie skonfigurowane!`,
        `Aplikacja PWA będzie automatycznie wysyłać powiadomienia o statusie Twoich przerw.`,
      ].join('\n');

    default:
      return `☕ *Czas Przerwy* — aktualizacja statusu pracownika ${userLabel} (${nowTime})`;
  }
}

export async function sendGoogleChatNotification(options: GoogleChatPayloadOptions): Promise<WebhookSendResult> {
  const webhookUrl = options.settings.googleChatWebhookUrl?.trim();

  if (!webhookUrl) {
    return { success: false, message: 'Brak skonfigurowanego adresu URL webhooka Google Chat.' };
  }

  // Validate event toggle
  if (options.type === 'start' && options.settings.googleChatNotifyOnStart === false) {
    return { success: true, message: 'Powiadomienia o starcie są wyłączone w ustawieniach.' };
  }
  if (options.type === 'warning' && options.settings.googleChatNotifyOnWarning === false) {
    return { success: true, message: 'Powiadomienia o 3 minutach są wyłączone w ustawieniach.' };
  }
  if (options.type === 'end' && options.settings.googleChatNotifyOnEnd === false) {
    return { success: true, message: 'Powiadomienia o zakończeniu są wyłączone w ustawieniach.' };
  }
  if (options.type === 'exceeded' && options.settings.googleChatNotifyOnExceeded === false) {
    return { success: true, message: 'Powiadomienia o przekroczeniu limitu są wyłączone w ustawieniach.' };
  }

  const text = buildGoogleChatMessage(options);

  try {
    // Try sending through our backend proxy route first
    const proxyResponse = await fetch('/api/google-chat-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ webhookUrl, text }),
    });

    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      if (data.success) {
        return { success: true, message: 'Wiadomość została wysłana na Google Chat.' };
      }
      return { success: false, message: data.error || 'Błąd odpowiedzi z serwera.' };
    }

    // If proxy endpoint is not found (e.g. static hosting on GitHub Pages)
    if (proxyResponse.status === 404) {
      // Attempt direct POST or return helpful message
      try {
        const directResp = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
          body: JSON.stringify({ text }),
        });
        if (directResp.ok) {
          return { success: true, message: 'Wiadomość została wysłana bezpośrednio do Google Chat.' };
        }
      } catch (directErr) {
        return {
          success: false,
          message: 'Przeglądarka zablokowała bezpośrednie połączenie z Google Chat z powodu CORS na hostingu statycznym. Użyj aplikacji z wbudowanym serwerem proxy lub mostka webhook.',
        };
      }
    }

    const errorText = await proxyResponse.text();
    return { success: false, message: `Błąd serwera (${proxyResponse.status}): ${errorText}` };
  } catch (err: unknown) {
    console.error('Błąd wysyłania powiadomienia Google Chat:', err);
    const msg = err instanceof Error ? err.message : 'Nieznany błąd';
    return { success: false, message: `Nie udało się nawiązać połączenia: ${msg}` };
  }
}
