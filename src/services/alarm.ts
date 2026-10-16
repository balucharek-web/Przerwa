class AlarmService {
  private audioCtx: AudioContext | null = null;
  private intervalId: number | null = null;
  private isRinging: boolean = false;
  private onStateChangeListeners: Array<(isRinging: boolean) => void> = [];

  public subscribe(listener: (isRinging: boolean) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.onStateChangeListeners.forEach(l => l(this.isRinging));
  }

  public getIsRinging(): boolean {
    return this.isRinging;
  }

  public initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playSingleBeep(volume: number = 0.4) {
    this.initAudio();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.type = 'triangle';
      // First tone: A5 880Hz, second tone: D6 1174.66Hz
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1174.66, now + 0.15);

      gain.gain.setValueAtTime(Math.min(1, Math.max(0.01, volume)), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  public startAlarm(options?: { vibration?: boolean; sound?: boolean }) {
    if (this.isRinging) return;
    this.isRinging = true;
    this.notify();

    const sound = options?.sound ?? true;
    const vibration = options?.vibration ?? true;

    if (sound) {
      this.initAudio();
      this.playSingleBeep();
      this.intervalId = window.setInterval(() => {
        if (!this.isRinging) return;
        this.playSingleBeep();
      }, 800);
    }

    if (vibration && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([600, 300, 600, 300, 1000]);
      } catch (e) {
        console.warn('Vibration error:', e);
      }
    }
  }

  public stopAlarm() {
    this.isRinging = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {
        // ignore
      }
    }
    this.notify();
  }
}

export const alarmService = new AlarmService();
