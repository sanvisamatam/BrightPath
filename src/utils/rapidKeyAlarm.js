// Rapid Keyboard Press Alarm Service
// Detects unusually fast and continuous keyboard pressing (e.g. key mashing/frustration).
// Configurable threshold, time window, and cooldown.
// Synthesizes a short, child-friendly, non-frightening chime using Web Audio API.
// Never interferes with normal game keyboard controls.

export const RAPID_KEY_THRESHOLD = 8;     // More than 8 key presses within the window
export const RAPID_KEY_TIME_WINDOW = 2000; // 2 seconds rolling window (ms)
export const ALARM_COOLDOWN = 5000;        // 5 seconds cooldown before alarm can re-trigger (ms)

class RapidKeyAlarmService {
  constructor() {
    this.threshold = RAPID_KEY_THRESHOLD;
    this.timeWindow = RAPID_KEY_TIME_WINDOW;
    this.cooldown = ALARM_COOLDOWN;

    this.keyTimestamps = [];
    this.lastAlarmTime = 0;
    this.isPlayingSound = false;
    this.audioCtx = null;
    this.listeners = new Set();

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundInteraction = this.handleUserInteraction.bind(this);
    this.initialized = false;
  }

  // Safe AudioContext getter that respects browser autoplay policy
  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  handleUserInteraction() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  // Synthesize a short, clear, gentle, child-friendly chime
  // Melodic sequence: C5 (523Hz) -> E5 (659Hz) with soft envelope
  // Non-scary, noticeable, and protected from overlapping
  playAlarmSound() {
    if (this.isPlayingSound) return;
    this.isPlayingSound = true;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) {
        this.isPlayingSound = false;
        return;
      }

      const now = ctx.currentTime;

      // Note 1: Gentle warm tone C5
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.28, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.19);

      // Note 2: Upbeat friendly chime E5
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now + 0.12);
      gain2.gain.setValueAtTime(0.3, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.4);

      setTimeout(() => {
        this.isPlayingSound = false;
      }, 420);
    } catch (e) {
      console.warn("Rapid key alarm audio error:", e);
      this.isPlayingSound = false;
    }
  }

  handleKeyDown(e) {
    this.handleUserInteraction();

    const now = Date.now();

    // Prune timestamps outside rolling time window
    this.keyTimestamps = this.keyTimestamps.filter(t => now - t <= this.timeWindow);

    // Record this press
    this.keyTimestamps.push(now);

    // Check if threshold exceeded in rolling window
    if (this.keyTimestamps.length >= this.threshold) {
      // Check cooldown
      if (now - this.lastAlarmTime >= this.cooldown) {
        this.lastAlarmTime = now;
        this.playAlarmSound();

        // Notify listeners with child-friendly message
        this.notifyListeners({
          type: 'RAPID_KEYBOARD_ALARM',
          message: 'Whoa! Slow down! 😊',
          subMessage: "Let's take a little break! 🌟",
          count: this.keyTimestamps.length,
          timestamp: now
        });
      }
    }

    // Do NOT call e.preventDefault() so game controls work normally
  }

  handleKeyUp() {
    // Normal gameplay continues smoothly
  }

  // Subscribe to alarm events
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error("Rapid key alarm listener error:", err);
      }
    });
  }

  // Configurable options
  configure({ threshold, timeWindow, cooldown } = {}) {
    if (threshold !== undefined && threshold > 0) this.threshold = threshold;
    if (timeWindow !== undefined && timeWindow > 0) this.timeWindow = timeWindow;
    if (cooldown !== undefined && cooldown > 0) this.cooldown = cooldown;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    window.addEventListener('keydown', this.boundKeyDown, { passive: true });
    window.addEventListener('keyup', this.boundKeyUp, { passive: true });
    window.addEventListener('pointerdown', this.boundInteraction, { once: true, passive: true });
  }

  destroy() {
    if (!this.initialized || typeof window === 'undefined') return;
    this.initialized = false;
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    this.keyTimestamps = [];
  }
}

export const rapidKeyAlarmService = new RapidKeyAlarmService();
export default rapidKeyAlarmService;
