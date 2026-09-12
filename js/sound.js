/**
 * SoundManager - Browser Web Audio API Audio Synthesizer
 * No external MP3/WAV files required.
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(state) {
    this.enabled = !!state;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Gracefully ignore audio hardware limits
    }
  }

  click() {
    this.playTone(800, 'triangle', 0.04, 0.05);
  }

  spin() {
    this.playTone(420 + Math.random() * 200, 'square', 0.02, 0.02);
  }

  lock() {
    this.playTone(320, 'sine', 0.1, 0.15);
    setTimeout(() => this.playTone(640, 'triangle', 0.25, 0.2), 60);
  }

  correct() {
    // Upward cheerful chime
    this.playTone(523.25, 'sine', 0.1, 0.12); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.12), 80); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.2, 0.15), 160); // G5
  }

  wrong() {
    // Low double buzz
    this.playTone(180, 'sawtooth', 0.12, 0.15);
    setTimeout(() => this.playTone(140, 'sawtooth', 0.2, 0.18), 100);
  }

  warning() {
    this.playTone(880, 'sine', 0.06, 0.08);
  }

  roundComplete() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.2, 0.12), idx * 90);
    });
  }

  victory() {
    const fanfare = [523.25, 659.25, 783.99, 1046.50];
    fanfare.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 'sine', 0.35, 0.15), i * 120);
    });
  }
}

const SoundManager = new SoundEngine();