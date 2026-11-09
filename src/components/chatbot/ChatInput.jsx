import { Send, Mic, MicOff, Square, ShieldAlert } from 'lucide-react';

/**
 * ChatInput Component for Jatin AI 3.0
 *
 * Handles text message submission, Enter-to-send shortcut, and browser-native
 * Speech-to-Text microphone input with listening/recognizing state indicators,
 * permission denial feedback, and graceful fallback to typed chat.
 */
const ChatInput = ({
  inputRef,
  inputValue,
  onChange,
  onSend,
  isTyping = false,
  speechRecognitionSupported = false,
  isListening = false,
  recognitionState = 'idle',
  interimTranscript = '',
  micPermissionDenied = false,
  onStopVoiceInput,
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

  const isRecognizing = recognitionState === 'recognizing';
  const showActiveVoiceState =
    isListening || recognitionState === 'listening' || isRecognizing;

  return (
    <div className="jatin-chatbot-input-section">
      {/* Active Listening / Recognizing State Indicator */}
      {showActiveVoiceState && (
        <div
          className={`jatin-chatbot-voice-status ${
            isRecognizing
              ? 'jatin-chatbot-voice-status--recognizing'
              : 'jatin-chatbot-voice-status--listening'
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="jatin-chatbot-voice-status-info">
            <span className="jatin-chatbot-voice-pulse" aria-hidden="true" />
            <span className="jatin-chatbot-voice-state-label">
              {isRecognizing ? 'Recognizing...' : 'Listening...'}
            </span>
            <span className="jatin-chatbot-voice-interim">
              {interimTranscript
                ? `"${interimTranscript}"`
                : isRecognizing
                ? 'Converting speech to text...'
                : 'Speak your question clearly'}
            </span>
          </div>
          <button
            type="button"
            className="jatin-chatbot-voice-stop-pill"
            onClick={onStopVoiceInput || onToggleVoiceInput}
            aria-label="Stop microphone recognition"
          >
            <Square size={10} />
            <span>Stop</span>
          </button>
        </div>
      )}

      {/* Microphone Permission Denied Notice */}
      {!showActiveVoiceState && micPermissionDenied && (
        <div
          className="jatin-chatbot-voice-permission-banner"
          role="status"
          aria-live="polite"
        >
          <ShieldAlert size={13} />
          <span>
            Microphone permission was denied. Allow microphone access in your browser
            settings or continue using typed chat below.
          </span>
        </div>
      )}

      <form className="jatin-chatbot-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="jatin-chatbot-input"
          placeholder={
            showActiveVoiceState
              ? isRecognizing
                ? 'Recognizing your speech...'
                : 'Listening... or type your question'
              : "Ask about Jatin's skills, projects..."
          }
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          aria-label="Message Jatin AI"
          autoComplete="off"
        />

        {onToggleVoiceInput && (
          <button
            type="button"
            className={`jatin-chatbot-icon-btn jatin-chatbot-mic-btn ${
              showActiveVoiceState ? 'jatin-chatbot-icon-btn--active jatin-chatbot-mic-btn--listening' : ''
            } ${!speechRecognitionSupported ? 'jatin-chatbot-mic-btn--unsupported' : ''}`}
            onClick={onToggleVoiceInput}
            disabled={isTyping && !showActiveVoiceState}
            aria-label={showActiveVoiceState ? 'Stop voice input' : 'Start voice input'}
            aria-pressed={showActiveVoiceState}
            title={
              !speechRecognitionSupported
                ? 'Voice input is not supported in this browser (typed chat available)'
                : showActiveVoiceState
                ? 'Stop voice input'
                : 'Start voice input'
            }
          >
            {showActiveVoiceState ? <MicOff size={16} /> : <Mic size={16} />}
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
    </div>
  );
};

export default ChatInput;
