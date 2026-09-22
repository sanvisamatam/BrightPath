// Web Audio API Synthesizer for Early-Childhood Activities
// Zero-dependency sound effects generator (works 100% offline with no external audio files)

class AudioFeedbackService {
  constructor() {
    this.ctx = null;
  }

  getAudioContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Cheerful pop sound (Bubble Pop & Balloon Smash)
  playPopSound(pitchMultiplier = 1) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      const freq = (400 + Math.random() * 200) * pitchMultiplier;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 2.2, startTime + 0.08);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.13);
    } catch (e) {
      // Audio playback fails silently if browser policy blocks autoplay
    }
  }

  // Gentle water droplet sound (Grow the Garden)
  playWaterSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, startTime);
      osc.frequency.exponentialRampToValueAtTime(1400, startTime + 0.04);
      osc.frequency.exponentialRampToValueAtTime(600, startTime + 0.1);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.16);
    } catch (e) {}
  }

  // Musical chime note for rainbow arc placements (C, D, E, F, G, A notes)
  playChimeSound(noteIndex = 0) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 523.25];
      const freq = frequencies[noteIndex % frequencies.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    } catch (e) {}
  }

  // Peekaboo reveal chime (Find the Hidden Friend)
  playRevealSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [440, 554.37, 659.25]; // A major arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch (e) {}
  }

  // Cheerful sparkle victory chime
  playCheerSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const chords = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, High C
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.09;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.5);
      });
    } catch (e) {}
  }
}

export const audioFeedback = new AudioFeedbackService();
export default audioFeedback;
