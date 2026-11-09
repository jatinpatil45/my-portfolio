import { useRef, useEffect } from 'react';
import {
  Bot,
  RotateCcw,
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  ShieldCheck,
  Briefcase,
  History,
  ArrowDown,
  AlertCircle,
  Sparkles,
  Code2,
  FolderGit2,
  Award,
  MessageSquarePlus,
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import QuickReplies from './QuickReplies';
import ChatInput from './ChatInput';
import RecruiterMode from './RecruiterMode';
import {
  VOICE_PRIVACY_NOTICE,
  SPEECH_RATE_OPTIONS,
} from '../../services/voiceService';

const STARTER_CARDS = [
  {
    id: 'starter-projects',
    label: 'Explore AI & Web Projects',
    sub: 'StudyMate AI, Clone Builder & ML',
    query: "Show me Jatin's projects",
    icon: FolderGit2,
  },
  {
    id: 'starter-skills',
    label: 'Inspect Tech Arsenal',
    sub: 'Python, React, TS, TensorFlow',
    query: 'What programming languages does Jatin know?',
    icon: Code2,
  },
  {
    id: 'starter-recruiter',
    label: 'Recruiter & Hiring Brief',
    sub: 'Role readiness & availability',
    query: 'Why should we hire Jatin?',
    icon: Briefcase,
  },
  {
    id: 'starter-certs',
    label: 'Verified Credentials',
    sub: '8 certificates & 2 hackathons',
    query: 'What certifications does Jatin have?',
    icon: Award,
  },
];

/**
 * ChatWindow Component for Jatin AI 3.0
 *
 * Renders the glassmorphic dialog header, Recruiter Mode banner, browser-native
 * Voice Controls & Privacy bar, session history view with empty state, message
 * stream with rich cards, scroll-to-bottom button, context-aware quick replies,
 * and voice-enabled input bar.
 *
 * Enforces strict scroll isolation between the bot window and the background page.
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
  recruiterMode = false,
  onToggleRecruiterMode,
  showHistory = false,
  onToggleHistory,
  sessionHistory = [],
  copiedMessageId = null,
  onCopyMessage,
  isScrolledUp = false,
  onMessagesScroll,
  onScrollToBottom,
  error = null,
  onClearError,
  onRetryLastMessage,
  voiceEnabled = false,
  onToggleVoiceOutput,
  onDisableVoice,
  speechSynthesisSupported = false,
  speechRecognitionSupported = false,
  isListening = false,
  recognitionState = 'idle',
  interimTranscript = '',
  micPermissionDenied = false,
  onStopVoiceInput,
  onToggleVoiceInput,
  synthesisState = 'idle',
  speakingMessageId = null,
  speechRate = 1,
  speechRateOptions = SPEECH_RATE_OPTIONS,
  onSpeechRateChange,
  availableVoices = [],
  selectedVoiceURI = '',
  onSelectVoice,
  voicePrivacyNotice = VOICE_PRIVACY_NOTICE,
  onSpeakMessage,
  onPlayVoiceOutput,
  onPauseVoiceOutput,
  onResumeVoiceOutput,
  onStopVoiceOutput,
  messagesContainerRef,
  messagesEndRef,
  inputRef,
}) => {
  const windowRef = useRef(null);
  const historyPanelRef = useRef(null);
  const touchStartYRef = useRef(0);

  const showStarterGrid = messages.length <= 1 && !isTyping;
  const isPlayingSpeech = synthesisState === 'playing';
  const isPausedSpeech = synthesisState === 'paused';

  // Strict scroll isolation: wheel & touch scrolling inside the bot window
  // only scrolls the bot's active scroll container and never scrolls the background page.
  useEffect(() => {
    const winEl = windowRef.current;
    if (!winEl) return;

    const onWheel = (event) => {
      event.stopPropagation();

      const activeScrollEl = showHistory
        ? historyPanelRef.current
        : messagesContainerRef?.current;

      if (!activeScrollEl) {
        event.preventDefault();
        return;
      }

      const deltaY = event.deltaY;
      const isInsideScrollArea = activeScrollEl.contains(event.target);

      // If scrolling over the bot header, recruiter bar, voice bar, quick replies, or input bar,
      // route the wheel delta directly to the bot's message list and block page scroll.
      if (!isInsideScrollArea) {
        event.preventDefault();
        activeScrollEl.scrollTop += deltaY;
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = activeScrollEl;
      const canScrollUp = scrollTop > 0;
      const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;

      if (
        scrollHeight <= clientHeight ||
        (deltaY < 0 && !canScrollUp) ||
        (deltaY > 0 && !canScrollDown)
      ) {
        event.preventDefault();
      }
    };

    const onTouchStart = (event) => {
      if (event.touches && event.touches.length === 1) {
        touchStartYRef.current = event.touches[0].clientY;
      }
    };

    const onTouchMove = (event) => {
      event.stopPropagation();
      if (!event.touches || event.touches.length !== 1) return;

      const activeScrollEl = showHistory
        ? historyPanelRef.current
        : messagesContainerRef?.current;

      if (!activeScrollEl) {
        if (event.cancelable) event.preventDefault();
        return;
      }

      const currentY = event.touches[0].clientY;
      const deltaY = touchStartYRef.current - currentY;
      const isInsideScrollArea = activeScrollEl.contains(event.target);

      if (!isInsideScrollArea) {
        if (event.cancelable) event.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = activeScrollEl;
      const canScrollUp = scrollTop > 0;
      const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;

      if (
        scrollHeight <= clientHeight ||
        (deltaY < 0 && !canScrollUp) ||
        (deltaY > 0 && !canScrollDown)
      ) {
        if (event.cancelable) event.preventDefault();
      }
    };

    winEl.addEventListener('wheel', onWheel, { passive: false });
    winEl.addEventListener('touchstart', onTouchStart, { passive: true });
    winEl.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      winEl.removeEventListener('wheel', onWheel);
      winEl.removeEventListener('touchstart', onTouchStart);
      winEl.removeEventListener('touchmove', onTouchMove);
    };
  }, [showHistory, messagesContainerRef]);

  return (
    <section
      ref={windowRef}
      className={`jatin-chatbot-window ${
        isClosing ? 'jatin-chatbot-window--closing' : 'jatin-chatbot-window--opening'
      } ${recruiterMode ? 'jatin-chatbot-window--recruiter' : ''}`}
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
              {recruiterMode && (
                <span className="jatin-chatbot-mode-pill">Recruiter</span>
              )}
            </div>
          </div>
        </div>

        <div className="jatin-chatbot-header-actions">
          {/* Recruiter Mode Toggle */}
          {onToggleRecruiterMode && (
            <button
              type="button"
              className={`jatin-chatbot-icon-btn ${
                recruiterMode ? 'jatin-chatbot-icon-btn--active' : ''
              }`}
              onClick={onToggleRecruiterMode}
              title={recruiterMode ? 'Disable Recruiter Mode' : 'Enable Recruiter Mode'}
              aria-label="Toggle Recruiter Mode"
              aria-pressed={recruiterMode}
            >
              <Briefcase size={15} />
            </button>
          )}

          {/* Session History Toggle */}
          {onToggleHistory && (
            <button
              type="button"
              className={`jatin-chatbot-icon-btn jatin-chatbot-history-btn ${
                showHistory ? 'jatin-chatbot-icon-btn--active' : ''
              }`}
              onClick={onToggleHistory}
              title="Session conversation history"
              aria-label="Conversation history"
              aria-pressed={showHistory}
            >
              <History size={15} />
              {sessionHistory.length > 0 && (
                <span className="jatin-chatbot-history-count">
                  {sessionHistory.length}
                </span>
              )}
            </button>
          )}

          {/* Voice Output Toggle */}
          {onToggleVoiceOutput && (
            <button
              type="button"
              className={`jatin-chatbot-icon-btn ${
                voiceEnabled ? 'jatin-chatbot-icon-btn--active' : ''
              }`}
              onClick={
                voiceEnabled && onDisableVoice
                  ? onDisableVoice
                  : onToggleVoiceOutput
              }
              title={voiceEnabled ? 'Mute voice responses (Voice Off)' : 'Enable voice responses'}
              aria-label={voiceEnabled ? 'Mute voice responses' : 'Enable voice responses'}
              aria-pressed={voiceEnabled}
            >
              {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
          )}

          {/* Clear Conversation */}
          <button
            type="button"
            className="jatin-chatbot-icon-btn"
            onClick={onClearChat}
            title="Clear chat"
            aria-label="Clear chat"
          >
            <RotateCcw size={15} />
          </button>

          {/* Close Window */}
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

      {/* Browser-Native Voice Controls & Privacy Bar */}
      <div
        className="jatin-chatbot-voice-bar"
        role="region"
        aria-label="Voice controls and privacy information"
      >
        <div className="jatin-chatbot-voice-controls-row">
          {/* Voice-Off / Auto-Read Toggle */}
          <button
            type="button"
            className={`jatin-chatbot-voice-toggle-pill ${
              voiceEnabled ? 'jatin-chatbot-voice-toggle-pill--on' : ''
            }`}
            onClick={
              voiceEnabled && onDisableVoice ? onDisableVoice : onToggleVoiceOutput
            }
            aria-label={voiceEnabled ? 'Turn voice off' : 'Turn voice on'}
            aria-pressed={voiceEnabled}
            title={
              voiceEnabled
                ? 'Voice auto-read is ON (Click for Voice Off)'
                : 'Voice is OFF (Click to enable auto-read)'
            }
          >
            {voiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>

          {/* Play / Resume, Pause, and Stop Controls */}
          <div
            className="jatin-chatbot-tts-group"
            role="group"
            aria-label="Speech playback controls"
          >
            <button
              type="button"
              className={`jatin-chatbot-tts-btn ${
                isPlayingSpeech ? 'jatin-chatbot-tts-btn--active' : ''
              }`}
              onClick={isPausedSpeech ? onResumeVoiceOutput : onPlayVoiceOutput}
              disabled={!speechSynthesisSupported}
              aria-label={
                isPausedSpeech ? 'Resume voice output' : 'Play voice output'
              }
              title={
                !speechSynthesisSupported
                  ? 'Speech synthesis is not supported in this browser'
                  : isPausedSpeech
                  ? 'Resume speaking'
                  : 'Play latest response aloud'
              }
            >
              <Play size={11} />
              <span>{isPausedSpeech ? 'Resume' : 'Play'}</span>
            </button>

            <button
              type="button"
              className="jatin-chatbot-tts-btn"
              onClick={onPauseVoiceOutput}
              disabled={!speechSynthesisSupported || !isPlayingSpeech}
              aria-label="Pause voice output"
              title="Pause speech"
            >
              <Pause size={11} />
              <span>Pause</span>
            </button>

            <button
              type="button"
              className="jatin-chatbot-tts-btn"
              onClick={onStopVoiceOutput}
              disabled={
                !speechSynthesisSupported ||
                (!isPlayingSpeech && !isPausedSpeech)
              }
              aria-label="Stop voice output"
              title="Stop speech"
            >
              <Square size={10} />
              <span>Stop</span>
            </button>
          </div>

          {/* Speech Rate Selector */}
          <label className="jatin-chatbot-voice-field">
            <span className="jatin-chatbot-sr-only">Speech rate</span>
            <select
              className="jatin-chatbot-voice-select jatin-chatbot-rate-select"
              aria-label="Speech rate"
              value={speechRate}
              onChange={(e) => onSpeechRateChange?.(Number(e.target.value))}
              disabled={!speechSynthesisSupported}
              title="Adjust speech rate"
            >
              {(speechRateOptions || SPEECH_RATE_OPTIONS).map((rateOpt) => (
                <option key={rateOpt} value={rateOpt}>
                  {rateOpt}x
                </option>
              ))}
            </select>
          </label>

          {/* Browser Voice Selector */}
          <label className="jatin-chatbot-voice-field jatin-chatbot-voice-field--grow">
            <span className="jatin-chatbot-sr-only">Select voice</span>
            <select
              className="jatin-chatbot-voice-select"
              aria-label="Select voice"
              value={selectedVoiceURI}
              onChange={(e) => onSelectVoice?.(e.target.value)}
              disabled={!speechSynthesisSupported || availableVoices.length === 0}
              title={
                availableVoices.length > 0
                  ? 'Select speech synthesis voice'
                  : 'Using default browser voice'
              }
            >
              <option value="">
                {availableVoices.length > 0
                  ? 'Default Voice'
                  : 'Default System Voice'}
              </option>
              {availableVoices.map((voice) => {
                const val = voice.voiceURI || voice.name;
                return (
                  <option key={val} value={val}>
                    {voice.name} ({voice.lang})
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        {/* Privacy & Browser Support Notice */}
        <p className="jatin-chatbot-voice-privacy">
          <ShieldCheck size={11} className="jatin-chatbot-voice-privacy-icon" aria-hidden="true" />
          <span>{voicePrivacyNotice}</span>
          {(!speechRecognitionSupported || !speechSynthesisSupported) && (
            <span className="jatin-chatbot-voice-unsupported-note">
              {' '}
              •{' '}
              {!speechRecognitionSupported && !speechSynthesisSupported
                ? 'Voice features are unsupported in this browser; typed chat remains available.'
                : !speechRecognitionSupported
                ? 'Voice input is unsupported in this browser; typed chat remains available.'
                : 'Voice output is unsupported in this browser; typed chat remains available.'}
            </span>
          )}
        </p>
      </div>

      {/* Recruiter Mode Active Panel */}
      {recruiterMode && !showHistory && (
        <RecruiterMode
          recruiterMode={recruiterMode}
          onToggleRecruiterMode={onToggleRecruiterMode}
          onSelectQuery={onSendMessage}
          disabled={isTyping}
        />
      )}

      {/* Error State Banner */}
      {error && (
        <div className="jatin-chatbot-error-banner" role="alert">
          <div className="jatin-chatbot-error-text">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
          <div className="jatin-chatbot-error-actions">
            {onRetryLastMessage && (
              <button
                type="button"
                className="jatin-chatbot-error-btn"
                onClick={onRetryLastMessage}
              >
                Retry
              </button>
            )}
            {onClearError && (
              <button
                type="button"
                className="jatin-chatbot-error-btn"
                onClick={onClearError}
                aria-label="Dismiss error"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Session History View vs Messages Stream */}
      {showHistory ? (
        <div
          ref={historyPanelRef}
          className="jatin-chatbot-history-panel"
          role="region"
          aria-label="Session conversation history"
        >
          <div className="jatin-chatbot-history-header">
            <div>
              <h3 className="jatin-chatbot-history-title">Session History</h3>
              <p className="jatin-chatbot-history-subtitle">
                Questions asked during your current session ({sessionHistory.length})
              </p>
            </div>
            <button
              type="button"
              className="jatin-chatbot-history-back"
              onClick={onToggleHistory}
            >
              Back to Chat
            </button>
          </div>

          {sessionHistory.length === 0 ? (
            <div className="jatin-chatbot-empty-state">
              <div className="jatin-chatbot-empty-icon">
                <MessageSquarePlus size={22} />
              </div>
              <h4 className="jatin-chatbot-empty-title">No questions asked yet</h4>
              <p className="jatin-chatbot-empty-desc">
                Your session history is currently empty. Select a topic below to start exploring Jatin&apos;s portfolio:
              </p>
              <div className="jatin-chatbot-starter-grid">
                {STARTER_CARDS.map((card) => {
                  const IconComp = card.icon;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      className="jatin-chatbot-starter-card"
                      onClick={() => onSendMessage(card.query, 'empty_state')}
                    >
                      <div className="jatin-chatbot-starter-icon">
                        <IconComp size={15} />
                      </div>
                      <div className="jatin-chatbot-starter-info">
                        <span className="jatin-chatbot-starter-label">{card.label}</span>
                        <span className="jatin-chatbot-starter-sub">{card.sub}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="jatin-chatbot-history-list">
              {sessionHistory.map((item, idx) => (
                <button
                  key={item.id || `${item.query}-${idx}`}
                  type="button"
                  className="jatin-chatbot-history-item"
                  onClick={() => onSendMessage(item.query, 'history_replay')}
                >
                  <div className="jatin-chatbot-history-item-top">
                    <span className="jatin-chatbot-history-intent">
                      #{item.intent}
                    </span>
                    <span className="jatin-chatbot-history-time">{item.timestamp}</span>
                  </div>
                  <span className="jatin-chatbot-history-query">{item.query}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="jatin-chatbot-messages-wrap">
          <div
            ref={messagesContainerRef}
            className="jatin-chatbot-messages"
            role="log"
            aria-live="polite"
            onScroll={onMessagesScroll}
          >
            {messages.length === 0 ? (
              <div className="jatin-chatbot-empty-state">
                <Sparkles size={22} />
                <h4 className="jatin-chatbot-empty-title">Start a Conversation</h4>
                <p className="jatin-chatbot-empty-desc">
                  Ask anything about Jatin Patil&apos;s skills, projects, education, or credentials.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isCopied={copiedMessageId === msg.id}
                  onCopy={onCopyMessage}
                  onSelectQuestion={onSendMessage}
                  speechSynthesisSupported={speechSynthesisSupported}
                  isSpeakingThis={speakingMessageId === msg.id}
                  synthesisState={synthesisState}
                  onSpeak={onSpeakMessage}
                  onPause={onPauseVoiceOutput}
                  onResume={onResumeVoiceOutput}
                  onStop={onStopVoiceOutput}
                />
              ))
            )}

            {/* Interactive Starter Grid on initial welcome screen */}
            {showStarterGrid && (
              <div className="jatin-chatbot-starter-section" aria-label="Quick topic starters">
                <span className="jatin-chatbot-starter-heading">
                  <Sparkles size={11} /> Quick Explore
                </span>
                <div className="jatin-chatbot-starter-grid">
                  {STARTER_CARDS.map((card) => {
                    const IconComp = card.icon;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        className="jatin-chatbot-starter-card"
                        onClick={() => onSendMessage(card.query, 'starter_card')}
                      >
                        <div className="jatin-chatbot-starter-icon">
                          <IconComp size={15} />
                        </div>
                        <div className="jatin-chatbot-starter-info">
                          <span className="jatin-chatbot-starter-label">{card.label}</span>
                          <span className="jatin-chatbot-starter-sub">{card.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

          {/* Floating Scroll-to-Bottom Button */}
          {(isScrolledUp || messages.length > 2) && onScrollToBottom && (
            <button
              type="button"
              className={`jatin-chatbot-scroll-btn ${
                isScrolledUp ? 'jatin-chatbot-scroll-btn--visible' : ''
              }`}
              onClick={() => onScrollToBottom('smooth')}
              aria-label="Scroll to bottom"
              title="Scroll to latest message"
            >
              <ArrowDown size={14} />
            </button>
          )}
        </div>
      )}

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
        recognitionState={recognitionState}
        interimTranscript={interimTranscript}
        micPermissionDenied={micPermissionDenied}
        onStopVoiceInput={onStopVoiceInput}
        onToggleVoiceInput={onToggleVoiceInput}
      />
    </section>
  );
};

export default ChatWindow;
