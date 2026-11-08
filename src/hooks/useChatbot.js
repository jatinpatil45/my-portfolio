/**
 * Custom React Hook (`useChatbot`) for Jatin AI 3.0
 *
 * Manages:
 * - Conversation messages with rich cards, clickable portfolio links & related follow-ups
 * - Multi-turn context & session history
 * - Recruiter Mode toggle & recruiter brief state
 * - Copy-to-clipboard with visual confirmation
 * - Contained smooth scrolling inside the chat message stream (never scrolling the main page)
 * - Voice input (Speech-to-Text) & Voice output (Text-to-Speech)
 * - Loading, error & empty states
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import chatbotKnowledge, { PORTFOLIO_LINKS } from '../data/chatbotKnowledge';
import { matchChatbotResponse, RECRUITER_SUGGESTIONS } from '../utils/responseGenerator';
import { createInitialContext, updateContext } from '../utils/contextManager';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText,
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

  // Voice & Analytics states
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
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

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  useEffect(() => {
    recruiterModeRef.current = recruiterMode;
  }, [recruiterMode]);

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
        // Keep initial welcome message & Quick Explore grid positioned cleanly at the top
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
      if (recognizerRef.current) recognizerRef.current.stop();
      stopSpeaking();
    };
  }, []);

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
    if (recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
    }
    stopSpeaking();
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 210);
  }, [isOpen, isClosing]);

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

          if (voiceEnabled) {
            speakText(result.reply);
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
    [isTyping, voiceEnabled]
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
    stopSpeaking();
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
  }, [scrollToTop]);

  const toggleVoiceOutput = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopSpeaking();
      }
      return next;
    });
  }, []);

  const speakMessage = useCallback((text) => {
    if (!text) return;
    speakText(text);
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setError('Voice input is not supported in this browser. Please type your question below.');
      return;
    }

    if (isListening && recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
      return;
    }

    setError(null);
    const recognizer = createSpeechRecognizer({
      onResult: (transcript) => {
        setIsListening(false);
        if (transcript && transcript.trim()) {
          sendMessage(transcript.trim(), 'voice');
        }
      },
      onError: () => {
        setIsListening(false);
        setError('Could not capture voice audio. Please check microphone permissions or type your question.');
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (recognizer && recognizer.start()) {
      recognizerRef.current = recognizer;
      setIsListening(true);
    }
  }, [isListening, sendMessage]);

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
    voiceEnabled,
    isListening,
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
    toggleVoiceInput,
    speakMessage,
  };
}

export default useChatbot;
