/**
 * Browser-Native Voice Service for Jatin AI
 *
 * Uses native browser Web Speech APIs (`SpeechRecognition` / `webkitSpeechRecognition`
 * and `speechSynthesis`) with zero external speech APIs, paid services, or AI services.
 *
 * Privacy & Architecture Notes:
 * - Browser speech recognition may process audio through the browser's built-in speech
 *   service and may require internet access (it is NOT claimed to be offline).
 * - Jatin AI never records, buffers, or stores raw audio.
 * - Microphone recognition is never activated automatically; it requires explicit user action.
 */

export const VOICE_PRIVACY_NOTICE =
  "Browser speech recognition may process audio through your browser's speech service and may require internet access. Raw audio is never recorded or stored.";

export const SPEECH_RATE_OPTIONS = [0.75, 1, 1.25, 1.5, 2];
export const DEFAULT_SPEECH_RATE = 1;
export const MIN_SPEECH_RATE = 0.5;
export const MAX_SPEECH_RATE = 2;

export const RECOGNITION_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  RECOGNIZING: 'recognizing',
  ERROR: 'error',
  UNSUPPORTED: 'unsupported',
};

export const SYNTHESIS_STATES = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  UNSUPPORTED: 'unsupported',
};

let currentSynthesisState = SYNTHESIS_STATES.IDLE;
let activeUtterance = null;

/**
 * Returns the native browser SpeechRecognition constructor when available.
 */
export function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Checks if browser Speech-to-Text (SpeechRecognition or webkitSpeechRecognition) is available.
 */
export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognitionConstructor());
}

/**
 * Checks if browser Text-to-Speech (speechSynthesis) is available.
 */
export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.speechSynthesis && typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

/**
 * Clamps a requested speech synthesis rate within safe browser bounds [0.5, 2.0].
 *
 * @param {number} rate
 * @returns {number}
 */
export function clampSpeechRate(rate) {
  const numeric = Number(rate);
  if (!Number.isFinite(numeric)) return DEFAULT_SPEECH_RATE;
  return Math.min(MAX_SPEECH_RATE, Math.max(MIN_SPEECH_RATE, Number(numeric.toFixed(2))));
}

/**
 * Returns the list of available browser speechSynthesis voices.
 *
 * @returns {SpeechSynthesisVoice[]}
 */
export function getAvailableVoices() {
  if (!isSpeechSynthesisSupported()) return [];
  try {
    const voices = window.speechSynthesis.getVoices();
    return Array.isArray(voices) ? voices : [];
  } catch {
    return [];
  }
}

/**
 * Subscribes to browser voice list updates (`voiceschanged` event) and invokes
 * the callback immediately with any currently loaded voices.
 *
 * @param {(voices: SpeechSynthesisVoice[]) => void} callback
 * @returns {() => void} Unsubscribe cleanup function
 */
export function subscribeToVoicesChanged(callback) {
  if (typeof callback !== 'function') return () => {};

  if (!isSpeechSynthesisSupported()) {
    callback([]);
    return () => {};
  }

  const notify = () => {
    callback(getAvailableVoices());
  };

  notify();

  const synth = window.speechSynthesis;
  try {
    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', notify);
      return () => {
        try {
          synth.removeEventListener('voiceschanged', notify);
        } catch {
          // Ignore cleanup errors
        }
      };
    }
    if ('onvoiceschanged' in synth) {
      const prevHandler = synth.onvoiceschanged;
      synth.onvoiceschanged = (event) => {
        if (typeof prevHandler === 'function') prevHandler(event);
        notify();
      };
      return () => {
        if (synth.onvoiceschanged !== prevHandler) {
          synth.onvoiceschanged = prevHandler || null;
        }
      };
    }
  } catch {
    // Ignore event binding errors on restricted browsers
  }

  return () => {};
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
    .replace(/[•🎓💻🚀📜🏆💼🐙🌐📬👋😊✨🤔⚖️📋🔍ℹ️]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolves a voice object from either a SpeechSynthesisVoice reference or a voiceURI / name string.
 *
 * @param {SpeechSynthesisVoice | string | null | undefined} voiceOrUri
 * @returns {SpeechSynthesisVoice | null}
 */
export function resolveVoice(voiceOrUri) {
  if (!voiceOrUri) return null;
  if (typeof voiceOrUri === 'object' && voiceOrUri.name) {
    return voiceOrUri;
  }
  if (typeof voiceOrUri === 'string') {
    const voices = getAvailableVoices();
    return (
      voices.find((v) => v.voiceURI === voiceOrUri || v.name === voiceOrUri) || null
    );
  }
  return null;
}

/**
 * Speaks text aloud using browser speechSynthesis.
 * Automatically cancels any previous or ongoing speech before starting the new utterance.
 *
 * @param {string} text
 * @param {{
 *   rate?: number,
 *   pitch?: number,
 *   lang?: string,
 *   voice?: SpeechSynthesisVoice | null,
 *   voiceURI?: string,
 *   onStart?: () => void,
 *   onPause?: () => void,
 *   onResume?: () => void,
 *   onEnd?: () => void,
 *   onError?: (err: any) => void,
 *   onStateChange?: (state: string) => void
 * }} [options]
 * @returns {boolean}
 */
export function speakText(text, options = {}) {
  if (!isSpeechSynthesisSupported()) return false;

  try {
    // Cancel any previous speech when a new response starts
    window.speechSynthesis.cancel();
    activeUtterance = null;
    currentSynthesisState = SYNTHESIS_STATES.IDLE;

    const cleanText = stripMarkdownForSpeech(text);
    if (!cleanText) {
      if (typeof options.onStateChange === 'function') {
        options.onStateChange(SYNTHESIS_STATES.IDLE);
      }
      return false;
    }

    const utterance = new window.SpeechSynthesisUtterance(cleanText);
    const matchedVoice = resolveVoice(options.voice || options.voiceURI);

    if (matchedVoice) {
      utterance.voice = matchedVoice;
      utterance.lang = matchedVoice.lang || options.lang || 'en-US';
    } else {
      utterance.lang = options.lang || 'en-US';
    }

    utterance.rate =
      options.rate !== undefined ? clampSpeechRate(options.rate) : DEFAULT_SPEECH_RATE;
    utterance.pitch = typeof options.pitch === 'number' ? options.pitch : 1.0;

    const setSynthesisState = (nextState) => {
      currentSynthesisState = nextState;
      if (typeof options.onStateChange === 'function') {
        options.onStateChange(nextState);
      }
    };

    utterance.onstart = () => {
      setSynthesisState(SYNTHESIS_STATES.PLAYING);
      if (typeof options.onStart === 'function') {
        options.onStart();
      }
    };

    utterance.onpause = () => {
      setSynthesisState(SYNTHESIS_STATES.PAUSED);
      if (typeof options.onPause === 'function') {
        options.onPause();
      }
    };

    utterance.onresume = () => {
      setSynthesisState(SYNTHESIS_STATES.PLAYING);
      if (typeof options.onResume === 'function') {
        options.onResume();
      }
    };

    utterance.onend = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
      setSynthesisState(SYNTHESIS_STATES.IDLE);
      if (typeof options.onEnd === 'function') {
        options.onEnd();
      }
    };

    utterance.onerror = (event) => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
      }
      setSynthesisState(SYNTHESIS_STATES.IDLE);
      if (typeof options.onError === 'function') {
        options.onError(event);
      }
      if (typeof options.onEnd === 'function') {
        options.onEnd();
      }
    };

    activeUtterance = utterance;
    setSynthesisState(SYNTHESIS_STATES.PLAYING);
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    currentSynthesisState = SYNTHESIS_STATES.IDLE;
    return false;
  }
}

/**
 * Pauses ongoing browser speech synthesis if currently speaking.
 *
 * @returns {boolean}
 */
export function pauseSpeaking() {
  if (!isSpeechSynthesisSupported()) return false;
  try {
    if (
      window.speechSynthesis.speaking ||
      currentSynthesisState === SYNTHESIS_STATES.PLAYING
    ) {
      window.speechSynthesis.pause();
      currentSynthesisState = SYNTHESIS_STATES.PAUSED;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Resumes paused browser speech synthesis.
 *
 * @returns {boolean}
 */
export function resumeSpeaking() {
  if (!isSpeechSynthesisSupported()) return false;
  try {
    if (
      window.speechSynthesis.paused ||
      currentSynthesisState === SYNTHESIS_STATES.PAUSED
    ) {
      window.speechSynthesis.resume();
      currentSynthesisState = SYNTHESIS_STATES.PLAYING;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Stops any ongoing or paused speech synthesis immediately.
 */
export function stopSpeaking() {
  if (!isSpeechSynthesisSupported()) return;
  try {
    activeUtterance = null;
    currentSynthesisState = SYNTHESIS_STATES.IDLE;
    window.speechSynthesis.cancel();
  } catch {
    // Ignore browser speech synthesis errors
  }
}

/**
 * Returns the current speech synthesis playback state.
 *
 * @returns {'idle' | 'playing' | 'paused' | 'unsupported'}
 */
export function getSynthesisState() {
  if (!isSpeechSynthesisSupported()) return SYNTHESIS_STATES.UNSUPPORTED;
  return currentSynthesisState;
}

/**
 * Maps browser SpeechRecognitionErrorEvent codes to structured user-facing diagnostics.
 *
 * @param {any} errorEvent
 * @returns {{ code: string, isPermissionDenied: boolean, message: string }}
 */
export function mapSpeechRecognitionError(errorEvent) {
  const rawCode =
    typeof errorEvent === 'string'
      ? errorEvent
      : errorEvent?.error || errorEvent?.code || 'unknown';
  const code = String(rawCode).toLowerCase();

  if (
    code === 'not-allowed' ||
    code === 'service-not-allowed' ||
    code === 'permission-denied'
  ) {
    return {
      code: 'permission-denied',
      isPermissionDenied: true,
      message:
        'Microphone access was denied. Please allow microphone permission in your browser settings, or continue using typed chat below.',
    };
  }

  if (code === 'no-speech') {
    return {
      code: 'no-speech',
      isPermissionDenied: false,
      message:
        'No speech was detected. Please try speaking again or type your question below.',
    };
  }

  if (code === 'audio-capture') {
    return {
      code: 'audio-capture',
      isPermissionDenied: false,
      message:
        'No microphone was found or audio could not be captured. Please check your microphone or use typed chat.',
    };
  }

  if (code === 'network') {
    return {
      code: 'network',
      isPermissionDenied: false,
      message:
        "Browser speech recognition requires network access to your browser's speech service. Please check your internet connection or use typed chat.",
    };
  }

  if (code === 'aborted') {
    return {
      code: 'aborted',
      isPermissionDenied: false,
      message: '',
    };
  }

  return {
    code: code || 'unknown',
    isPermissionDenied: false,
    message:
      'Could not capture voice audio. Please check microphone permissions or type your question below.',
  };
}

/**
 * Creates a managed SpeechRecognition instance for voice queries.
 * Does NOT start the microphone automatically; `.start()` must be called by user interaction.
 *
 * @param {{
 *   lang?: string,
 *   interimResults?: boolean,
 *   continuous?: boolean,
 *   onStart?: () => void,
 *   onStateChange?: (state: string) => void,
 *   onInterimResult?: (transcript: string) => void,
 *   onResult?: (transcript: string) => void,
 *   onError?: (mappedError: { code: string, isPermissionDenied: boolean, message: string }, rawEvent?: any) => void,
 *   onEnd?: () => void
 * }} handlers
 */
export function createSpeechRecognizer(handlers = {}) {
  const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
  if (!SpeechRecognitionCtor) {
    return null;
  }

  try {
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = handlers.lang || 'en-US';
    recognition.interimResults =
      handlers.interimResults !== undefined ? Boolean(handlers.interimResults) : true;
    recognition.maxAlternatives = 1;
    recognition.continuous = Boolean(handlers.continuous);

    let state = RECOGNITION_STATES.IDLE;
    let finalDispatched = false;
    let hasErrored = false;
    let stoppedByUser = false;
    let latestInterim = '';

    const updateState = (nextState) => {
      state = nextState;
      if (typeof handlers.onStateChange === 'function') {
        handlers.onStateChange(nextState);
      }
    };

    recognition.onstart = () => {
      finalDispatched = false;
      hasErrored = false;
      latestInterim = '';
      updateState(RECOGNITION_STATES.LISTENING);
      if (typeof handlers.onStart === 'function') {
        handlers.onStart();
      }
    };

    recognition.onaudiostart = () => {
      if (state === RECOGNITION_STATES.IDLE) {
        updateState(RECOGNITION_STATES.LISTENING);
      }
    };

    recognition.onspeechstart = () => {
      updateState(RECOGNITION_STATES.RECOGNIZING);
    };

    recognition.onresult = (event) => {
      const results = event?.results;
      if (!results) return;

      let finalTranscript = '';
      let interimTranscript = '';

      const startIndex = typeof event.resultIndex === 'number' ? event.resultIndex : 0;
      const length = typeof results.length === 'number' ? results.length : 0;

      for (let i = startIndex; i < length; i += 1) {
        const resultItem = results[i];
        const alternative = resultItem?.[0];
        const piece = alternative?.transcript || '';
        if (!piece) continue;

        if (resultItem.isFinal === false) {
          interimTranscript += piece;
        } else {
          finalTranscript += piece;
        }
      }

      if (interimTranscript.trim()) {
        latestInterim = interimTranscript.trim();
        updateState(RECOGNITION_STATES.RECOGNIZING);
        if (typeof handlers.onInterimResult === 'function') {
          handlers.onInterimResult(latestInterim);
        }
      }

      if (finalTranscript.trim()) {
        const cleanedFinal = finalTranscript.trim();
        finalDispatched = true;
        latestInterim = '';
        updateState(RECOGNITION_STATES.RECOGNIZING);
        if (typeof handlers.onResult === 'function') {
          handlers.onResult(cleanedFinal);
        }
      }
    };

    recognition.onerror = (event) => {
      const mapped = mapSpeechRecognitionError(event);
      if (mapped.code === 'aborted' && stoppedByUser) {
        updateState(RECOGNITION_STATES.IDLE);
        return;
      }

      hasErrored = true;
      updateState(RECOGNITION_STATES.ERROR);
      if (typeof handlers.onError === 'function') {
        handlers.onError(mapped, event);
      }
    };

    recognition.onend = () => {
      if (!finalDispatched && !hasErrored && latestInterim.trim()) {
        finalDispatched = true;
        if (typeof handlers.onResult === 'function') {
          handlers.onResult(latestInterim.trim());
        }
      }
      latestInterim = '';
      if (state !== RECOGNITION_STATES.ERROR) {
        updateState(RECOGNITION_STATES.IDLE);
      }
      if (typeof handlers.onEnd === 'function') {
        handlers.onEnd();
      }
    };

    return {
      start: () => {
        try {
          stoppedByUser = false;
          finalDispatched = false;
          hasErrored = false;
          latestInterim = '';
          recognition.start();
          updateState(RECOGNITION_STATES.LISTENING);
          return true;
        } catch (err) {
          const mapped = mapSpeechRecognitionError(err);
          updateState(RECOGNITION_STATES.ERROR);
          if (typeof handlers.onError === 'function') {
            handlers.onError(mapped, err);
          }
          return false;
        }
      },
      stop: () => {
        stoppedByUser = true;
        try {
          recognition.stop();
        } catch {
          // Ignore stop errors if already stopped
        }
      },
      abort: () => {
        stoppedByUser = true;
        try {
          if (typeof recognition.abort === 'function') {
            recognition.abort();
          } else {
            recognition.stop();
          }
        } catch {
          // Ignore abort errors
        }
        updateState(RECOGNITION_STATES.IDLE);
      },
      getState: () => state,
    };
  } catch {
    return null;
  }
}

export default {
  VOICE_PRIVACY_NOTICE,
  SPEECH_RATE_OPTIONS,
  DEFAULT_SPEECH_RATE,
  MIN_SPEECH_RATE,
  MAX_SPEECH_RATE,
  RECOGNITION_STATES,
  SYNTHESIS_STATES,
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  clampSpeechRate,
  getAvailableVoices,
  subscribeToVoicesChanged,
  resolveVoice,
  stripMarkdownForSpeech,
  speakText,
  pauseSpeaking,
  resumeSpeaking,
  stopSpeaking,
  getSynthesisState,
  mapSpeechRecognitionError,
  createSpeechRecognizer,
};
