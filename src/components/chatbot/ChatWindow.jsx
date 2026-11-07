import { Bot, RotateCcw, X, Volume2, VolumeX } from 'lucide-react';
import ChatMessage from './ChatMessage';
import QuickReplies from './QuickReplies';
import ChatInput from './ChatInput';

/**
 * ChatWindow Component for Jatin AI 3.0
 *
 * Renders the dialog header, message stream, typing indicator,
 * context-aware quick replies, and input bar.
 */
const ChatWindow = ({
  config,
  isClosing,
  messages,
  isTyping,
  suggestions,
  inputValue,
  onInputChange,
  onSendMessage,
  onClearChat,
  onClose,
  voiceEnabled,
  onToggleVoiceOutput,
  speechSynthesisSupported,
  speechRecognitionSupported,
  isListening,
  onToggleVoiceInput,
  messagesEndRef,
  inputRef,
}) => {
  return (
    <section
      className={`jatin-chatbot-window ${
        isClosing ? 'jatin-chatbot-window--closing' : 'jatin-chatbot-window--opening'
      }`}
      role="dialog"
      aria-label={config.headerTitle}
    >
      {/* Header */}
      <header className="jatin-chatbot-header">
        <div className="jatin-chatbot-header-info">
          <div className="jatin-chatbot-avatar" aria-hidden="true">
            <Bot size={20} />
          </div>
          <div className="jatin-chatbot-title-wrap">
            <h2 className="jatin-chatbot-title">{config.headerTitle}</h2>
            <div className="jatin-chatbot-status">
              <span className="jatin-chatbot-status-dot" aria-hidden="true" />
              <span>{config.statusText}</span>
              {config.version && (
                <span className="jatin-chatbot-version-pill">v{config.version}</span>
              )}
            </div>
          </div>
        </div>

        <div className="jatin-chatbot-header-actions">
          {speechSynthesisSupported && (
            <button
              type="button"
              className={`jatin-chatbot-icon-btn ${
                voiceEnabled ? 'jatin-chatbot-icon-btn--active' : ''
              }`}
              onClick={onToggleVoiceOutput}
              title={voiceEnabled ? 'Mute voice responses' : 'Enable voice responses'}
              aria-label={voiceEnabled ? 'Mute voice responses' : 'Enable voice responses'}
            >
              {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          )}
          <button
            type="button"
            className="jatin-chatbot-icon-btn"
            onClick={onClearChat}
            title="Clear chat"
            aria-label="Clear chat"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className="jatin-chatbot-icon-btn"
            onClick={onClose}
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
          <ChatMessage key={msg.id} message={msg} />
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
      <QuickReplies
        suggestions={suggestions}
        onSelect={onSendMessage}
        disabled={isTyping}
      />

      {/* Input Bar */}
      <ChatInput
        inputRef={inputRef}
        inputValue={inputValue}
        onChange={onInputChange}
        onSend={onSendMessage}
        isTyping={isTyping}
        speechRecognitionSupported={speechRecognitionSupported}
        isListening={isListening}
        onToggleVoiceInput={onToggleVoiceInput}
      />
    </section>
  );
};

export default ChatWindow;
