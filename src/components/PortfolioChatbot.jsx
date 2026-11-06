import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, RotateCcw, X, MessageSquareCode } from 'lucide-react';
import chatbotKnowledge from '../data/chatbotKnowledge';
import { matchChatbotResponse } from '../utils/chatbotMatcher';
import './PortfolioChatbot.css';

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
  };
}

/**
 * Safely renders bold (**text**), italic (*text*), and clickable URLs / mailto links
 * as React nodes without using dangerouslySetInnerHTML.
 */
function renderInlineTokens(line, keyPrefix) {
  const tokenRegex =
    /(https?:\/\/[^\s)]+|mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;

  const parts = line.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;
    const key = `${keyPrefix}-${idx}`;

    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={key}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="jatin-chatbot-link"
        >
          {part}
        </a>
      );
    }

    if (part.startsWith('mailto:')) {
      const displayEmail = part.replace(/^mailto:/, '');
      return (
        <a key={key} href={part} className="jatin-chatbot-link">
          {displayEmail}
        </a>
      );
    }

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function renderFormattedMessage(text) {
  if (typeof text !== 'string') return null;
  const paragraphs = text.split('\n\n');

  return paragraphs.map((para, pIdx) => {
    const lines = para.split('\n');
    return (
      <p key={`p-${pIdx}`}>
        {lines.map((line, lIdx) => (
          <span key={`l-${pIdx}-${lIdx}`}>
            {renderInlineTokens(line, `t-${pIdx}-${lIdx}`)}
            {lIdx < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

const PortfolioChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
  const [messages, setMessages] = useState(() => [createWelcomeMessage()]);
  const [suggestions, setSuggestions] = useState(
    () => chatbotKnowledge.config.suggestedQuestions || []
  );
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

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
    (rawText) => {
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
          const result = matchChatbotResponse(trimmed, chatbotKnowledge);
          const botMessage = {
            id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            sender: 'bot',
            text: result.reply,
            timestamp: formatTime(),
          };
          setMessages((prev) => [...prev, botMessage]);
          if (Array.isArray(result.suggestions) && result.suggestions.length > 0) {
            setSuggestions(result.suggestions);
          }
        } catch (err) {
          console.error('[Jatin AI] Failed to generate response:', err);
          setMessages((prev) => [
            ...prev,
            {
              id: `bot-err-${Date.now()}`,
              sender: 'bot',
              text: chatbotKnowledge.config.fallbackMessage,
              timestamp: formatTime(),
            },
          ]);
        } finally {
          setIsTyping(false);
        }
      }, 480);
    },
    [isTyping]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleClearChat = () => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setIsTyping(false);
    setInputValue('');
    setMessages([createWelcomeMessage()]);
    setSuggestions(chatbotKnowledge.config.suggestedQuestions || []);
    inputRef.current?.focus();
  };

  return (
    <div className="jatin-chatbot-root" aria-live="polite">
      {/* Chat Window */}
      {isOpen && (
        <section
          className={`jatin-chatbot-window ${
            isClosing ? 'jatin-chatbot-window--closing' : 'jatin-chatbot-window--opening'
          }`}
          role="dialog"
          aria-label={chatbotKnowledge.config.headerTitle}
        >
          {/* Header */}
          <header className="jatin-chatbot-header">
            <div className="jatin-chatbot-header-info">
              <div className="jatin-chatbot-avatar" aria-hidden="true">
                <Bot size={20} />
              </div>
              <div className="jatin-chatbot-title-wrap">
                <h2 className="jatin-chatbot-title">
                  {chatbotKnowledge.config.headerTitle}
                </h2>
                <div className="jatin-chatbot-status">
                  <span className="jatin-chatbot-status-dot" aria-hidden="true" />
                  <span>{chatbotKnowledge.config.statusText}</span>
                </div>
              </div>
            </div>

            <div className="jatin-chatbot-header-actions">
              <button
                type="button"
                className="jatin-chatbot-icon-btn"
                onClick={handleClearChat}
                title="Clear chat"
                aria-label="Clear chat"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                className="jatin-chatbot-icon-btn"
                onClick={handleClose}
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={17} />
              </button>
            </div>
          </header>

          {/* Messages Stream */}
          <div className="jatin-chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`jatin-chatbot-msg-row ${
                  msg.sender === 'user' ? 'jatin-chatbot-msg-row--user' : ''
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="jatin-chatbot-msg-avatar" aria-hidden="true">
                    <Bot size={15} />
                  </div>
                )}

                <div className="jatin-chatbot-bubble-group">
                  <div
                    className={`jatin-chatbot-bubble ${
                      msg.sender === 'user'
                        ? 'jatin-chatbot-bubble--user'
                        : 'jatin-chatbot-bubble--bot'
                    }`}
                  >
                    {msg.sender === 'bot' ? renderFormattedMessage(msg.text) : <p>{msg.text}</p>}
                  </div>
                  {msg.timestamp && (
                    <span className="jatin-chatbot-time">{msg.timestamp}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="jatin-chatbot-msg-row" aria-label="Jatin AI is typing">
                <div className="jatin-chatbot-msg-avatar" aria-hidden="true">
                  <Bot size={15} />
                </div>
                <div className="jatin-chatbot-bubble jatin-chatbot-bubble--bot jatin-chatbot-typing">
                  <span className="jatin-chatbot-dot" />
                  <span className="jatin-chatbot-dot" />
                  <span className="jatin-chatbot-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Question Quick-Reply Buttons */}
          {suggestions.length > 0 && (
            <div className="jatin-chatbot-suggestions">
              <span className="jatin-chatbot-suggestions-label">// Quick questions</span>
              <div className="jatin-chatbot-suggestions-list">
                {suggestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    className="jatin-chatbot-chip"
                    onClick={() => sendMessage(question)}
                    disabled={isTyping}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form className="jatin-chatbot-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="jatin-chatbot-input"
              placeholder="Ask about Jatin's skills, projects..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              aria-label="Message Jatin AI"
              autoComplete="off"
            />
            <button
              type="submit"
              className="jatin-chatbot-send-btn"
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send message"
              title="Send message"
            >
              <Send size={17} />
            </button>
          </form>
        </section>
      )}

      {/* Floating Launcher Button */}
      <div className="jatin-chatbot-fab-wrapper">
        {!isOpen && !hasOpenedOnce && (
          <button
            type="button"
            className="jatin-chatbot-fab-badge"
            onClick={handleOpen}
          >
            Ask Jatin AI ✨
          </button>
        )}
        <button
          type="button"
          className={`jatin-chatbot-fab ${
            isOpen && !isClosing ? 'jatin-chatbot-fab--open' : 'jatin-chatbot-fab--closed'
          }`}
          onClick={handleToggle}
          aria-label={isOpen ? 'Close Jatin AI chat' : 'Open Jatin AI chat'}
          aria-expanded={isOpen}
        >
          {isOpen && !isClosing ? (
            <X className="jatin-chatbot-fab-icon" />
          ) : (
            <MessageSquareCode className="jatin-chatbot-fab-icon" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PortfolioChatbot;
