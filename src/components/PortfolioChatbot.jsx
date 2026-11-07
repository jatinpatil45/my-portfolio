import { X, MessageSquareCode } from 'lucide-react';
import useChatbot from '../hooks/useChatbot';
import ChatWindow from './chatbot/ChatWindow';
import './PortfolioChatbot.css';

/**
 * PortfolioChatbot (Jatin AI 3.0)
 *
 * Modular custom chatbot container uniting ChatWindow, ChatMessage,
 * QuickReplies, ChatInput, useChatbot state hook, knowledge graph,
 * intent/fuzzy matcher, voice service, and local analytics.
 */
const PortfolioChatbot = () => {
  const {
    config,
    isOpen,
    isClosing,
    hasOpenedOnce,
    messages,
    suggestions,
    inputValue,
    setInputValue,
    isTyping,
    voiceEnabled,
    isListening,
    speechRecognitionSupported,
    speechSynthesisSupported,
    messagesEndRef,
    inputRef,
    handleOpen,
    handleClose,
    handleToggle,
    sendMessage,
    handleClearChat,
    toggleVoiceOutput,
    toggleVoiceInput,
  } = useChatbot();

  return (
    <div className="jatin-chatbot-root" aria-live="polite">
      {/* Chat Window */}
      {isOpen && (
        <ChatWindow
          config={config}
          isClosing={isClosing}
          messages={messages}
          isTyping={isTyping}
          suggestions={suggestions}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={sendMessage}
          onClearChat={handleClearChat}
          onClose={handleClose}
          voiceEnabled={voiceEnabled}
          onToggleVoiceOutput={toggleVoiceOutput}
          speechSynthesisSupported={speechSynthesisSupported}
          speechRecognitionSupported={speechRecognitionSupported}
          isListening={isListening}
          onToggleVoiceInput={toggleVoiceInput}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
        />
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
