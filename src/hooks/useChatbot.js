/**
 * Custom React Hook (`useChatbot`) for Jatin AI 3.0
 *
 * Manages conversation state, multi-turn context, intent matching,
 * response generation, quick-reply recommendations, voice I/O, and local analytics.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import chatbotKnowledge from '../data/chatbotKnowledge';
import { matchChatbotResponse } from '../utils/responseGenerator';
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
  };
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

  // Voice & Analytics states
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [analytics, setAnalytics] = useState(() => getAnalyticsSummary());

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const recognizerRef = useRef(null);
  const contextRef = useRef(context);

  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !isClosing) {
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(focusTimer);
    }
  }, [isOpen, isClosing]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
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
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isClosing, handleClose]);

  const sendMessage = useCallback(
    (rawText, source = 'text') => {
      const trimmed = typeof rawText === 'string' ? rawText.trim() : '';
      if (!trimmed || isTyping) return;

      const userMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: 'user',
        text: trimmed,
        timestamp: formatTime(),
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
          const result = matchChatbotResponse(trimmed, chatbotKnowledge, activeContext);

          const botMessage = {
            id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            sender: 'bot',
            text: result.reply,
            timestamp: formatTime(),
            intent: result.intent,
            confidence: result.confidence,
          };

          setMessages((prev) => [...prev, botMessage]);

          const updatedCtx = updateContext(activeContext, result.matchResult || result, trimmed);
          setContext(updatedCtx);

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
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-err-${Date.now()}`,
              sender: 'bot',
              text: chatbotKnowledge.config.fallbackMessage,
              timestamp: formatTime(),
              intent: 'fallback',
            },
          ]);
        } finally {
          setIsTyping(false);
        }
      }, 480);
    },
    [isTyping, voiceEnabled]
  );

  const handleClearChat = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    stopSpeaking();
    setIsTyping(false);
    setInputValue('');
    setMessages([createWelcomeMessage()]);
    setContext(createInitialContext());
    setSuggestions(chatbotKnowledge.config.suggestedQuestions || []);
    inputRef.current?.focus();
  }, []);

  const toggleVoiceOutput = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (!next) {
        stopSpeaking();
      }
      return next;
    });
  }, []);

  const toggleVoiceInput = useCallback(() => {
    if (!isSpeechRecognitionSupported()) return;

    if (isListening && recognizerRef.current) {
      recognizerRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer({
      onResult: (transcript) => {
        setIsListening(false);
        if (transcript && transcript.trim()) {
          sendMessage(transcript.trim(), 'voice');
        }
      },
      onError: () => {
        setIsListening(false);
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
    voiceEnabled,
    isListening,
    speechRecognitionSupported: isSpeechRecognitionSupported(),
    speechSynthesisSupported: isSpeechSynthesisSupported(),
    messagesEndRef,
    inputRef,
    handleOpen,
    handleClose,
    handleToggle,
    sendMessage,
    handleClearChat,
    toggleVoiceOutput,
    toggleVoiceInput,
  };
}

export default useChatbot;
