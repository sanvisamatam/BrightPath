// Modular Keyboard Alert & Big Beep Feature
// Detects when all required keys are pressed simultaneously and plays a clear, child-friendly alert beep.
// Prevents continuous repeating while held; re-arms only after release.

class KeyboardAlertService {
  constructor() {
    this.audioCtx = null;
    this.activeKeys = new Set();
    this.isArmed = true; // true when ready to fire; becomes false once triggered until keys are released
    this.listeners = new Set();

    // Default required keys (e.g. ['b', 'p'] for BrightPath or ['Control', 'Shift', 'B'])
    // We match case-insensitively and support both event.key and event.code
    this.requiredKeySets = [
      ['b', 'p'],                 // Primary child-friendly 2-key combination: Press 'B' + 'P'
      ['control', 'shift', 'b'],  // Classic shortcut combination: Ctrl + Shift + B
      ['control', 'alt', 'b']     // Alternative combo: Ctrl + Alt + B
    ];

    this.primaryComboDescription = "Press [B + P] or [Ctrl + Shift + B]";

    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
    this.boundBlur = this.handleBlur.bind(this);
    this.boundInteraction = this.handleUserInteraction.bind(this);
    this.initialized = false;
  }

  // Safe AudioContext getter that respects browser autoplay policies
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

  // Synthesize a clear, child-friendly, noticeable alert/beep sound
  // Cheerful bright two-tone chime/beep: 659.25 Hz (E5) -> 880 Hz (A5)
  playNoticeableBeep() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: Bright playful beep
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.17);

      // Note 2: Upbeat high chime (creates a clear, friendly "ding-dong" alert)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.0, now + 0.12); // A5
      gain2.gain.setValueAtTime(0.4, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.4);
    } catch (e) {
      console.warn("Keyboard alert audio playback warning:", e);
    }
  }

  normalizeKey(keyOrCode) {
    if (!keyOrCode) return '';
    return String(keyOrCode).toLowerCase().replace(/^(key|digit)/i, '');
  }

  // Check if any registered required key set is satisfied by current pressed keys
  checkRequiredKeysMatch() {
    for (const keySet of this.requiredKeySets) {
      const allPresent = keySet.every((requiredKey) => {
        const norm = requiredKey.toLowerCase();
        // Check if norm key or norm code is in activeKeys
        for (const active of this.activeKeys) {
          if (active === norm || active.includes(norm) || norm.includes(active)) {
            return true;
          }
        }
        return false;
      });

      if (allPresent) {
        return { match: true, matchedSet: keySet };
      }
    }
    return { match: false, matchedSet: null };
  }

  handleKeyDown(e) {
    this.handleUserInteraction();

    const rawKey = e.key ? e.key.toLowerCase() : '';
    const rawCode = e.code ? e.code.toLowerCase() : '';
    const normKey = this.normalizeKey(rawKey);
    const normCode = this.normalizeKey(rawCode);

    if (rawKey) this.activeKeys.add(rawKey);
    if (normKey) this.activeKeys.add(normKey);
    if (rawCode) this.activeKeys.add(rawCode);
    if (normCode) this.activeKeys.add(normCode);

    // Also track modifier flags
    if (e.ctrlKey) this.activeKeys.add('control');
    if (e.shiftKey) this.activeKeys.add('shift');
    if (e.altKey) this.activeKeys.add('alt');

    const result = this.checkRequiredKeysMatch();

    if (result.match) {
      if (this.isArmed) {
        // First simultaneous press: trigger alert!
        this.isArmed = false; // Lock until released
        this.playNoticeableBeep();

        // Notify UI subscribers (e.g. for toast banner)
        this.notifyListeners({
          type: 'KEYBOARD_ALERT',
          matchedCombo: result.matchedSet,
          timestamp: Date.now()
        });
      }
      // If already triggered, DO NOT repeat sound while keys remain pressed!
    }

    // Crucial: DO NOT call e.preventDefault() so game controls and inputs continue working
  }

  handleKeyUp(e) {
    const rawKey = e.key ? e.key.toLowerCase() : '';
    const rawCode = e.code ? e.code.toLowerCase() : '';
    const normKey = this.normalizeKey(rawKey);
    const normCode = this.normalizeKey(rawCode);

    if (rawKey) this.activeKeys.delete(rawKey);
    if (normKey) this.activeKeys.delete(normKey);
    if (rawCode) this.activeKeys.delete(rawCode);
    if (normCode) this.activeKeys.delete(normCode);

    if (!e.ctrlKey) this.activeKeys.delete('control');
    if (!e.shiftKey) this.activeKeys.delete('shift');
    if (!e.altKey) this.activeKeys.delete('alt');

    // Re-check: if any required key is released, re-arm the trigger
    const result = this.checkRequiredKeysMatch();
    if (!result.match) {
      this.isArmed = true;
    }
  }

  handleBlur() {
    this.activeKeys.clear();
    this.isArmed = true;
  }

  // Subscribe callback for visual alert banner
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error("Keyboard alert listener error:", err);
      }
    });
  }

  // Modular configuration: set custom required keys
  setRequiredKeys(keysArray, description = '') {
    if (Array.isArray(keysArray) && keysArray.length > 0) {
      const normalizedList = keysArray.map(k => String(k).toLowerCase());
      this.requiredKeySets = [normalizedList];
      this.primaryComboDescription = description || `Press [${keysArray.join(' + ')}]`;
      this.isArmed = true;
    }
  }

  // Add an additional combo to the list
  addRequiredKeyCombination(keysArray) {
    if (Array.isArray(keysArray) && keysArray.length > 0) {
      this.requiredKeySets.push(keysArray.map(k => String(k).toLowerCase()));
    }
  }

  getRequiredKeysDescription() {
    return this.primaryComboDescription;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    window.addEventListener('keydown', this.boundKeyDown, { passive: true });
    window.addEventListener('keyup', this.boundKeyUp, { passive: true });
    window.addEventListener('blur', this.boundBlur, { passive: true });
    window.addEventListener('pointerdown', this.boundInteraction, { once: true, passive: true });
  }

  destroy() {
    if (!this.initialized || typeof window === 'undefined') return;
    this.initialized = false;
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('blur', this.boundBlur);
    this.activeKeys.clear();
    this.isArmed = true;
  }
}

export const keyboardAlertService = new KeyboardAlertService();
export default keyboardAlertService;

