// Encouraging Voice Feedback Service
// Uses Web Speech API (speechSynthesis) to deliver positive verbal praise after games.
// Automatically rotates non-repeating friendly messages, configures friendly pitch/rate,
// and provides safe fallback if speech is unavailable or blocked.

import audioFeedback from './audioFeedback';

export const POSITIVE_COMPLETION_MESSAGES = [
  "Good job! Congratulations!",
  "Awesome! You did a great job!",
  "Well done! Keep going!",
  "Great work! You completed the game!",
  "Fantastic! You should be proud of yourself!",
  "Superstar! That was amazing!",
  "Hooray! You played so wonderfully!",
  "Brilliant effort! You are doing fantastic!"
];

class VoiceFeedbackService {
  constructor() {
    this.lastMessageIndex = -1;
    this.speechSynthesis = null;
    this.listeners = new Set();
    this.currentUtterance = null;
    this.isSpeaking = false;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  // Get a non-repeating random encouraging message
  getNextMessage() {
    const total = POSITIVE_COMPLETION_MESSAGES.length;
    let nextIndex;
    if (total <= 1) {
      nextIndex = 0;
    } else {
      do {
        nextIndex = Math.floor(Math.random() * total);
      } while (nextIndex === this.lastMessageIndex);
    }
    this.lastMessageIndex = nextIndex;
    return POSITIVE_COMPLETION_MESSAGES[nextIndex];
  }

  // Find a friendly, natural English voice
  getBestVoice() {
    if (!this.speechSynthesis) return null;
    try {
      const voices = this.speechSynthesis.getVoices() || [];
      if (voices.length === 0) return null;

      // Prefer warm, natural-sounding English voices
      const preferred = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Zira'))
      );

      return preferred || voices.find(v => v.lang.startsWith('en')) || voices[0];
    } catch (e) {
      return null;
    }
  }

  // Speak a positive completion message
  // message: optional custom message; if omitted, picks a non-repeating message
  speakGameCompletion(customMessage = null) {
    const textToSpeak = customMessage || this.getNextMessage();

    // Notify UI listeners (e.g. for cartoon mascot speech bubble)
    this.notifyListeners({
      type: 'SPEAK_START',
      message: textToSpeak
    });

    if (!this.speechSynthesis) {
      // Fallback: play cheerful victory chime if speech synthesis is unavailable
      audioFeedback.playCheerSound();
      return textToSpeak;
    }

    try {
      // Cancel any ongoing or pending speech to prevent overlapping/clutter
      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const voice = this.getBestVoice();
      if (voice) {
        utterance.voice = voice;
      }

      // Friendly, encouraging speech settings suitable for children
      utterance.pitch = 1.18; // Slightly higher pitch for friendly, warm warmth
      utterance.rate = 0.93;  // Slightly relaxed tempo for clear understanding
      utterance.volume = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.notifyListeners({ type: 'SPEAK_END', message: textToSpeak });
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        // Fallback on error (e.g. if autoplay speech is restricted)
        audioFeedback.playCheerSound();
        this.notifyListeners({ type: 'SPEAK_ERROR', message: textToSpeak, error: e });
      };

      this.currentUtterance = utterance;

      // Some browsers require voices to load asynchronously
      if (this.speechSynthesis.speaking) {
        this.speechSynthesis.cancel();
      }

      this.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis notice:", err);
      audioFeedback.playCheerSound();
    }

    return textToSpeak;
  }

  stop() {
    if (this.speechSynthesis) {
      try {
        this.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((cb) => {
      try {
        cb(data);
      } catch (e) {}
    });
  }
}

export const voiceFeedbackService = new VoiceFeedbackService();
export default voiceFeedbackService;

