export interface BreakRecord {
  id: number;
  dateString: string; // YYYY-MM-DD
  startTimeMs: number;
  endTimeMs: number;
  durationSeconds: number;
  note?: string;
}

export interface AppSettings {
  dailyLimitMinutes: number;
  autoResetHour: number; // default 0 (24:00 midnight)
  autoResetMinute: number; // default 0
  autoMonthlyReset: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  warningMinutes: number; // default 3

  // Google Chat Webhook integration
  googleChatWebhookUrl?: string;
  googleChatUserName?: string;
  googleChatStartMessage?: string; // default "start"
  googleChatEndMessage?: string;   // default "stop"
  googleChatNotifyOnStart?: boolean;
  googleChatNotifyOnWarning?: boolean;
  googleChatNotifyOnEnd?: boolean;
  googleChatNotifyOnExceeded?: boolean;
}

export type ActiveTab = 'today' | 'history' | 'settings';
