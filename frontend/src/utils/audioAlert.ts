/**
 * Emergency Alert Audio Synthesizer
 * Synthesizes an authoritative ambulance / emergency sweep siren using Web Audio API
 * Runs for 3 seconds as mandated by the Campus Operations specification.
 */

class EmergencySoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private isRinging: boolean = false;
  private timer: number | null = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playAmbulanceSiren(durationSeconds: number = 3, onEnded?: () => void) {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      if (this.isRinging) return;
      this.isRinging = true;

      // Trigger hardware vibration if mobile device supports it
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([400, 150, 400, 150, 400, 150, 600]);
        } catch {
          // Ignore vibration permissions restrictions
        }
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = 'sawtooth';

      // Modulate frequency back and forth between 720 Hz and 1100 Hz (ambulance hi-lo siren)
      const cycleTime = 0.35; // Period of hi-lo modulation
      const cycles = Math.ceil(durationSeconds / cycleTime);

      for (let i = 0; i < cycles; i++) {
        const cycleStart = now + i * cycleTime;
        osc.frequency.setValueAtTime(740, cycleStart);
        osc.frequency.exponentialRampToValueAtTime(1080, cycleStart + cycleTime * 0.5);
        osc.frequency.exponentialRampToValueAtTime(740, cycleStart + cycleTime);
      }

      // Gain envelope: fast attack, steady full volume, quick fade at end of 3s
      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.exponentialRampToValueAtTime(0.75, now + 0.08);
      gainNode.gain.setValueAtTime(0.75, now + durationSeconds - 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);

      this.timer = window.setTimeout(() => {
        this.isRinging = false;
        if (onEnded) onEnded();
      }, durationSeconds * 1000);

    } catch (e) {
      console.warn('AudioContext playback error (user interaction may be needed):', e);
      this.isRinging = false;
    }
  }

  public stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isRinging = false;
    if (this.audioCtx && this.audioCtx.state === 'running') {
      try {
        this.audioCtx.suspend();
      } catch {
        // Safe ignore
      }
    }
  }
}

export const emergencySound = new EmergencySoundSynthesizer();
