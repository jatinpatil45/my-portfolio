/**
 * Custom React Hook (`useChatbot`) for Jatin AI 3.0
 *
 * Manages:
 * - Conversation messages with rich cards, clickable portfolio links & related follow-ups
 * - Multi-turn context & session history
 * - Recruiter Mode toggle & recruiter brief state
 * - Copy-to-clipboard with visual confirmation
 * - Contained smooth scrolling inside the chat message stream (never scrolling the main page)
 * - Browser-native Voice Input (SpeechRecognition / webkitSpeechRecognition) with listening/recognizing states & permission handling
 * - Browser-native Voice Output (speechSynthesis) with play, pause, resume, stop, rate adjustment & voice selection
 * - Loading, error & empty states
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import chatbotKnowledge, { PORTFOLIO_LINKS } from '../data/chatbotKnowledge';
import { matchChatbotResponse, RECRUITER_SUGGESTIONS } from '../utils/responseGenerator';
import { createInitialContext, updateContext } from '../utils/contextManager';
import {
  VOICE_PRIVACY_NOTICE,
  SPEECH_RATE_OPTIONS,
  DEFAULT_SPEECH_RATE,
  RECOGNITION_STATES,
  SYNTHESIS_STATES,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  clampSpeechRate,
  getAvailableVoices,
  subscribeToVoicesChanged,
  speakText,
  pauseSpeaking,
  resumeSpeaking,
  stopSpeaking,
  createSpeechRecognizer,
} from '../services/voiceService';
import { trackInteraction, getAnalyticsSummary } from '../services/analyticsService';

function formatTime(date = new Date()) {
  try {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function createWelcomeMessage() {
  return {
    id: `welcome-${Date.now()}`,
    sender: 'bot',
    text: chatbotKnowledge.config.welcomeMessage,
    timestamp: formatTime(),
    intent: 'welcome',
    confidence: 1,
    confidenceLevel: 'high',
    links: [
      { label: 'Projects', url: PORTFOLIO_LINKS.projects, type: 'section' },
      { label: 'Skills', url: PORTFOLIO_LINKS.skills, type: 'section' },
      { label: 'Certifications', url: PORTFOLIO_LINKS.certifications, type: 'section' },
      { label: 'GitHub', url: PORTFOLIO_LINKS.github, type: 'github' },
    ],
    cards: null,
    relatedQuestions: [],
  };
}

export function stripMarkdownFormatting(text = '') {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .trim();
}

export function useChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [messages, setMessages] = useState(() => [createWelcomeMessage()]);
  const [context, setContext] = useState(() => createInitialContext());
  const [suggestions, setSuggestions] = useState(
    () => chatbotKnowledge.config.suggestedQuestions || []
  );
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Advanced UI states
  const [recruiterMode, setRecruiterMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [error, setError] = useState(null);
  const [lastQuery, setLastQuery] = useState('');

  // Voice Input & Output states (Microphone is NEVER activated automatically)
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionState, setRecognitionState] = useState(RECOGNITION_STATES.IDLE);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);

  const [synthesisState, setSynthesisState] = useState(SYNTHESIS_STATES.IDLE);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [speechRate, setSpeechRateState] = useState(DEFAULT_SPEECH_RATE);
  const [availableVoices, setAvailableVoices] = useState(() => getAvailableVoices());
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');

  // Analytics state
  const [analytics, setAnalytics] = useState(() => getAnalyticsSummary());

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const copyTimerRef = useRef(null);
  const recognizerRef = useRef(null);
  const contextRef = useRef(context);
  const recruiterModeRef = useRef(recruiterMode);
  const voiceEnabledRef = useRef(voiceEnabled);
  const speechRateRef = useRef(speechRate);
  const selectedVoiceURIRef = useRef(selectedVoiceURI);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    recruiterModeRef.current = recruiterMode;
  }, [recruiterMode]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    speechRateRef.current = speechRate;
  }, [speechRate]);

  useEffect(() => {
    selectedVoiceURIRef.current = selectedVoiceURI;
  }, [selectedVoiceURI]);

  // Subscribe to browser speechSynthesis voice list updates
  useEffect(() => {
    const unsubscribe = subscribeToVoicesChanged((voices) => {
      setAvailableVoices(voices);
    });
    return unsubscribe;
  }, []);

  /**
   * Smoothly scrolls ONLY the internal messages container (never the outer window/page).
   */
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const scrollBehavior = typeof behavior === 'string' ? behavior : 'smooth';
    const targetTop = container.scrollHeight;
    if (typeof container.scrollTo === 'function') {
      try {
        container.scrollTo({ top: targetTop, behavior: scrollBehavior });
      } catch {
        container.scrollTop = targetTop;
      }
    } else {
      container.scrollTop = targetTop;
    }
    setIsScrolledUp(false);
  }, []);

  /**
   * Smoothly scrolls the internal messages container to the top (used on initial welcome/clear).
   */
  const scrollToTop = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (typeof container.scrollTo === 'function') {
      try {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        container.scrollTop = 0;
      }
    } else {
      container.scrollTop = 0;
    }
    setIsScrolledUp(false);
  }, []);

  const handleMessagesScroll = useCallback((event) => {
    const el = event?.currentTarget;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nextScrolledUp = distanceFromBottom > 72;
    setIsScrolledUp((prev) => (prev !== nextScrolledUp ? nextScrolledUp : prev));
  }, []);

  // Auto-scroll inside the chat container when messages update or typing starts
  useEffect(() => {
    if (!isOpen || showHistory) return;

    const rafId = requestAnimationFrame(() => {
      if (messages.length <= 1 && !isTyping) {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = 0;
        }
        setIsScrolledUp(false);
      } else {
        scrollToBottom('smooth');
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [messages.length, isTyping, isOpen, showHistory, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isClosing && !showHistory) {
      const focusTimer = setTimeout(() => {
        try {
          inputRef.current?.focus({ preventScroll: true });
        } catch {
          inputRef.current?.focus();
        }
      }, 150);
      return () => clearTimeout(focusTimer);
    }
  }, [isOpen, isClosing, showHistory]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (recognizerRef.current) recognizerRef.current.abort();
      stopSpeaking();
    };
  }, []);

  const stopVoiceOutput = useCallback(() => {
    stopSpeaking();
    setSynthesisState(SYNTHESIS_STATES.IDLE);
    setSpeakingMessageId(null);
  }, []);

  const stopVoiceInput = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      recognizerRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
    setRecognitionState((prev) =>
      prev === RECOGNITION_STATES.ERROR ? prev : RECOGNITION_STATES.IDLE
    );
  }, []);

  const speakMessage = useCallback(
    (text, messageId = null, overrideOptions = {}) => {
      if (!text || !isSpeechSynthesisSupported()) return false;

      const rateToUse =
        overrideOptions.rate !== undefined ? overrideOptions.rate : speechRateRef.current;
      const voiceURIToUse =
        overrideOptions.voiceURI !== undefined
          ? overrideOptions.voiceURI
          : selectedVoiceURIRef.current;

      setSpeakingMessageId(messageId);

      const started = speakText(text, {
        rate: rateToUse,
        voiceURI: voiceURIToUse,
        onStateChange: (nextState) => {
          setSynthesisState(nextState);
          if (nextState === SYNTHESIS_STATES.IDLE) {
            setSpeakingMessageId(null);
          }
        },
        onEnd: () => {
          setSynthesisState(SYNTHESIS_STATES.IDLE);
          setSpeakingMessageId(null);
        },
      });

      if (!started) {
        setSynthesisState(SYNTHESIS_STATES.IDLE);
        setSpeakingMessageId(null);
      }

      return started;
    },
    []
  );

  const pauseVoiceOutput = useCallback(() => {
    const paused = pauseSpeaking();
    if (paused) {
      setSynthesisState(SYNTHESIS_STATES.PAUSED);
    }
    return paused;
  }, []);

  const resumeVoiceOutput = useCallback(() => {
    const resumed = resumeSpeaking();
    if (resumed) {
      setSynthesisState(SYNTHESIS_STATES.PLAYING);
    }
    return resumed;
  }, []);

  const playVoiceOutput = useCallback(() => {
    if (!isSpeechSynthesisSupported()) return false;

    if (synthesisState === SYNTHESIS_STATES.PAUSED) {
      return resumeVoiceOutput();
    }

    // Find the latest bot message and read it aloud
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.sender === 'bot' && messages[i]?.text) {
        return speakMessage(messages[i].text, messages[i].id);
      }
    }
    return false;
  }, [messages, synthesisState, resumeVoiceOutput, speakMessage]);

  const setSpeechRate = useCallback(
    (nextRate) => {
      const clamped = clampSpeechRate(nextRate);
      setSpeechRateState(clamped);
      speechRateRef.current = clamped;

      // If currently playing a message, restart with the updated speech rate
      if (synthesisState === SYNTHESIS_STATES.PLAYING && speakingMessageId) {
        const activeMsg = messages.find((m) => m.id === speakingMessageId);
        if (activeMsg?.text) {
          speakMessage(activeMsg.text, activeMsg.id, { rate: clamped });
        }
      }
    },
    [messages, speakingMessageId, synthesisState, speakMessage]
  );

  const handleSelectVoice = useCallback(
    (nextVoiceURI) => {
      const uri = typeof nextVoiceURI === 'string' ? nextVoiceURI : '';
      setSelectedVoiceURI(uri);
      selectedVoiceURIRef.current = uri;

      if (synthesisState === SYNTHESIS_STATES.PLAYING && speakingMessageId) {
        const activeMsg = messages.find((m) => m.id === speakingMessageId);
        if (activeMsg?.text) {
          speakMessage(activeMsg.text, activeMsg.id, { voiceURI: uri });
        }
      }
    },
    [messages, speakingMessageId, synthesisState, speakMessage]
  );

  const handleOpen = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsClosing(false);
    setIsOpen(true);
    setHasOpenedOnce(true);
  }, []);

  const handleClose = useCallback(() => {
    if (!isOpen || isClosing) return;
    setIsClosing(true);
    stopVoiceInput();
    stopVoiceOutput();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 210);
  }, [isOpen, isClosing, stopVoiceInput, stopVoiceOutput]);

  const handleToggle = useCallback(() => {
    if (isOpen && !isClosing) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [isOpen, isClosing, handleClose, handleOpen]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen && !isClosing) {
        if (showHistory) {
          setShowHistory(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isClosing, showHistory, handleClose]);

  const copyMessageText = useCallback(async (messageId, rawText) => {
    if (!rawText) return false;
    const cleanText = stripMarkdownFormatting(rawText);

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(cleanText);
      } else {
        const tempArea = document.createElement('textarea');
        tempArea.value = cleanText;
        tempArea.style.position = 'fixed';
        tempArea.style.opacity = '0';
        document.body.appendChild(tempArea);
        tempArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempArea);
      }

      setCopiedMessageId(messageId);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
      return true;
    } catch {
      return false;
    }
  }, []);

  const sendMessage = useCallback(
    (rawText, source = 'text') => {
      const trimmed = typeof rawText === 'string' ? rawText.trim() : '';
      if (!trimmed || isTyping) return;

      // Cancel any previous speech when a new query/response cycle starts
      stopVoiceOutput();

      setError(null);
      setShowHistory(false);
      setLastQuery(trimmed);

      const nowStr = formatTime();
      const userMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: 'user',
        text: trimmed,
        timestamp: nowStr,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      typingTimerRef.current = setTimeout(() => {
        try {
          const activeContext = contextRef.current;
          const isRecruiter = recruiterModeRef.current;
          const result = matchChatbotResponse(trimmed, chatbotKnowledge, activeContext, {
            recruiterMode: isRecruiter,
          });

          const botMessage = {
            id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            sender: 'bot',
            text: result.reply,
            timestamp: formatTime(),
            intent: result.intent,
            confidence: result.confidence,
            confidenceLevel: result.confidenceLevel || 'high',
            cards: result.cards || null,
            candidateSummary: result.candidateSummary || null,
            links: result.links || [],
            relatedQuestions: (result.suggestions || []).slice(0, 3),
            recruiterHighlight: result.recruiterHighlight || null,
          };

          setMessages((prev) => [...prev, botMessage]);

          const updatedCtx = updateContext(
            activeContext,
            result.matchResult || result,
            trimmed,
            chatbotKnowledge
          );
          setContext(updatedCtx);

          setSessionHistory((prev) => [
            ...prev,
            {
              id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              query: trimmed,
              intent: result.intent,
              confidence: result.confidence,
              confidenceLevel: result.confidenceLevel || 'high',
              timestamp: nowStr,
            },
          ]);

          if (Array.isArray(result.suggestions) && result.suggestions.length > 0) {
            setSuggestions(result.suggestions);
          }

          trackInteraction({
            query: trimmed,
            intent: result.intent,
            confidence: result.confidence,
            source,
          });
          setAnalytics(getAnalyticsSummary());

          if (voiceEnabledRef.current) {
            speakMessage(result.reply, botMessage.id);
          }
        } catch (err) {
          console.error('[Jatin AI 3.0] Failed to generate response:', err);
          setError('Unable to process that request right now. Please try again.');
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-err-${Date.now()}`,
              sender: 'bot',
              text: chatbotKnowledge.config.fallbackMessage,
              timestamp: formatTime(),
              intent: 'fallback',
              confidence: 0,
              confidenceLevel: 'low',
              links: [],
              cards: null,
              relatedQuestions: [],
            },
          ]);
        } finally {
          setIsTyping(false);
        }
      }, 480);
    },
    [isTyping, stopVoiceOutput, speakMessage]
  );

  const retryLastMessage = useCallback(() => {
    if (lastQuery) {
      setError(null);
      sendMessage(lastQuery, 'retry');
    }
  }, [lastQuery, sendMessage]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const toggleRecruiterMode = useCallback(() => {
    setRecruiterMode((prev) => {
      const next = !prev;
      if (next) {
        setSuggestions(RECRUITER_SUGGESTIONS);
      } else {
        setSuggestions(chatbotKnowledge.config.suggestedQuestions || []);
      }
      return next;
    });
  }, []);

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  const handleClearChat = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    stopVoiceInput();
    stopVoiceOutput();
    setIsTyping(false);
    setError(null);
    setShowHistory(false);
    setInputValue('');
    setMessages([createWelcomeMessage()]);
    setContext(createInitialContext());
    setSessionHistory([]);
    setSuggestions(
      recruiterModeRef.current
        ? RECRUITER_SUGGESTIONS
        : chatbotKnowledge.config.suggestedQuestions || []
    );
    scrollToTop();
    try {
      inputRef.current?.focus({ preventScroll: true });
    } catch {
      inputRef.current?.focus();
    }
  }, [scrollToTop, stopVoiceInput, stopVoiceOutput]);

  const toggleVoiceOutput = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      voiceEnabledRef.current = next;
      if (!next) {
        stopVoiceOutput();
      }
      return next;
    });
  }, [stopVoiceOutput]);

  const disableVoice = useCallback(() => {
    setVoiceEnabled(false);
    voiceEnabledRef.current = false;
    stopVoiceOutput();
    stopVoiceInput();
  }, [stopVoiceOutput, stopVoiceInput]);

  const startVoiceInput = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setRecognitionState(RECOGNITION_STATES.UNSUPPORTED);
      setError(
        'Voice input is not supported in this browser. Please type your question below.'
      );
      return false;
    }

    // Stop any ongoing speech synthesis before activating the microphone
    stopVoiceOutput();
    setError(null);
    setMicPermissionDenied(false);
    setInterimTranscript('');

    const recognizer = createSpeechRecognizer({
      onStart: () => {
        setIsListening(true);
        setRecognitionState(RECOGNITION_STATES.LISTENING);
      },
      onStateChange: (nextState) => {
        setRecognitionState(nextState);
        setIsListening(
          nextState === RECOGNITION_STATES.LISTENING ||
            nextState === RECOGNITION_STATES.RECOGNIZING
        );
      },
      onInterimResult: (interim) => {
        setInterimTranscript(interim);
        setRecognitionState(RECOGNITION_STATES.RECOGNIZING);
      },
      onResult: (transcript) => {
        setIsListening(false);
        setInterimTranscript('');
        setRecognitionState(RECOGNITION_STATES.IDLE);
        if (transcript && transcript.trim()) {
          sendMessage(transcript.trim(), 'voice');
        }
      },
      onError: (mappedError) => {
        setIsListening(false);
        setInterimTranscript('');
        setRecognitionState(RECOGNITION_STATES.ERROR);
        if (mappedError?.isPermissionDenied) {
          setMicPermissionDenied(true);
        }
        if (mappedError?.message) {
          setError(mappedError.message);
        } else {
          setError(
            'Could not capture voice audio. Please check microphone permissions or type your question.'
          );
        }
      },
      onEnd: () => {
        setIsListening(false);
        setInterimTranscript('');
        setRecognitionState((prev) =>
          prev === RECOGNITION_STATES.ERROR ? prev : RECOGNITION_STATES.IDLE
        );
      },
    });

    if (recognizer && recognizer.start()) {
      recognizerRef.current = recognizer;
      setIsListening(true);
      setRecognitionState(RECOGNITION_STATES.LISTENING);
      return true;
    }

    return false;
  }, [sendMessage, stopVoiceOutput]);

  const toggleVoiceInput = useCallback(() => {
    if (isListening) {
      stopVoiceInput();
      return;
    }
    startVoiceInput();
  }, [isListening, stopVoiceInput, startVoiceInput]);

  return {
    config: chatbotKnowledge.config,
    isOpen,
    isClosing,
    hasOpenedOnce,
    messages,
    suggestions,
    inputValue,
    setInputValue,
    isTyping,
    context,
    analytics,
    recruiterMode,
    toggleRecruiterMode,
    showHistory,
    toggleHistory,
    sessionHistory,
    copiedMessageId,
    copyMessageText,
    isScrolledUp,
    handleMessagesScroll,
    scrollToBottom,
    error,
    clearError,
    retryLastMessage,
    // Voice Input & Output state and controls
    voiceEnabled,
    isListening,
    recognitionState,
    interimTranscript,
    micPermissionDenied,
    synthesisState,
    speakingMessageId,
    speechRate,
    setSpeechRate,
    speechRateOptions: SPEECH_RATE_OPTIONS,
    availableVoices,
    selectedVoiceURI,
    setSelectedVoiceURI: handleSelectVoice,
    voicePrivacyNotice: VOICE_PRIVACY_NOTICE,
    speechRecognitionSupported: isSpeechRecognitionSupported(),
    speechSynthesisSupported: isSpeechSynthesisSupported(),
    messagesContainerRef,
    messagesEndRef,
    inputRef,
    handleOpen,
    handleClose,
    handleToggle,
    sendMessage,
    handleClearChat,
    toggleVoiceOutput,
    disableVoice,
    startVoiceInput,
    stopVoiceInput,
    toggleVoiceInput,
    speakMessage,
    playVoiceOutput,
    pauseVoiceOutput,
    resumeVoiceOutput,
    stopVoiceOutput,
  };
}

export default useChatbot;
