import { Send, Mic, MicOff } from 'lucide-react';

/**
 * ChatInput Component for Jatin AI 3.0
 *
 * Handles text message submission, Enter-to-send shortcut, and optional
 * native browser Speech-to-Text microphone input.
 */
const ChatInput = ({
  inputRef,
  inputValue,
  onChange,
  onSend,
  isTyping = false,
  speechRecognitionSupported = false,
  isListening = false,
  onToggleVoiceInput,
}) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSend(inputValue, 'text');
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend(inputValue, 'text');
    }
  };

  return (
    <form className="jatin-chatbot-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="jatin-chatbot-input"
        placeholder="Ask about Jatin's skills, projects..."
        value={inputValue}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleInputKeyDown}
        aria-label="Message Jatin AI"
        autoComplete="off"
      />

      {speechRecognitionSupported && (
        <button
          type="button"
          className={`jatin-chatbot-icon-btn ${
            isListening ? 'jatin-chatbot-icon-btn--active' : ''
          }`}
          onClick={onToggleVoiceInput}
          disabled={isTyping}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          title={isListening ? 'Stop voice input' : 'Voice input'}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      )}

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
  );
};

export default ChatInput;
