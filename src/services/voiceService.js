/**
 * Voice Service for Jatin AI 3.0
 *
 * Uses native browser Web Speech APIs (SpeechRecognition & SpeechSynthesis)
 * for 100% client-side voice input and voice output with zero external APIs.
 */

/**
 * Checks if browser Speech-to-Text (SpeechRecognition) is available.
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Checks if browser Text-to-Speech (speechSynthesis) is available.
 */
export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== 'undefined');
}

/**
 * Strips markdown formatting, URLs, and symbols so spoken output sounds natural.
 *
 * @param {string} text
 * @returns {string}
 */
export function stripMarkdownForSpeech(text = '') {
  if (typeof text !== 'string') return '';
  return text
    .replace(/https?:\/\/[^\s)]+/g, 'link')
    .replace(/mailto:[^\s)]+/g, 'email address')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/[•🎓💻🚀📜🏆💼🐙🌐📬👋😊✨]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Speaks text aloud using browser speechSynthesis if enabled.
 *
 * @param {string} text
 * @param {{ rate?: number, pitch?: number, onEnd?: () => void }} [options]
 */
export function speakText(text, options = {}) {
  if (!isSpeechSynthesisSupported()) return false;

  try {
    window.speechSynthesis.cancel();
    const cleanText = stripMarkdownForSpeech(text);
    if (!cleanText) return false;

    const utterance = new window.SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = options.rate || 1.02;
    utterance.pitch = options.pitch || 1.0;

    if (typeof options.onEnd === 'function') {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

/**
 * Stops any ongoing speech synthesis immediately.
 */
export function stopSpeaking() {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore browser speech synthesis errors
  }
}

/**
 * Creates a managed SpeechRecognition instance for voice queries.
 *
 * @param {{
 *   onResult?: (transcript: string) => void,
 *   onError?: (err: any) => void,
 *   onEnd?: () => void
 * }} handlers
 */
export function createSpeechRecognizer(handlers = {}) {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }

  try {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      if (transcript && typeof handlers.onResult === 'function') {
        handlers.onResult(transcript);
      }
    };

    recognition.onerror = (event) => {
      if (typeof handlers.onError === 'function') {
        handlers.onError(event);
      }
    };

    recognition.onend = () => {
      if (typeof handlers.onEnd === 'function') {
        handlers.onEnd();
      }
    };

    return {
      start: () => {
        try {
          recognition.start();
          return true;
        } catch {
          return false;
        }
      },
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // Ignore stop errors if already stopped
        }
      },
    };
  } catch {
    return null;
  }
}

export default {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  stripMarkdownForSpeech,
  speakText,
  stopSpeaking,
  createSpeechRecognizer,
};
