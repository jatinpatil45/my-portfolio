import { X, MessageSquareCode } from 'lucide-react';
import useChatbot from '../hooks/useChatbot';
import ChatWindow from './chatbot/ChatWindow';
import './PortfolioChatbot.css';

/**
 * PortfolioChatbot (Jatin AI 3.0)
 *
 * Modular custom chatbot container uniting ChatWindow, ChatMessage,
 * QuickReplies, ChatInput, useChatbot state hook, knowledge graph,
 * intent/fuzzy matcher, Recruiter Mode, session history, browser-native
 * voice input/output controls, and local analytics.
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
    recognitionState,
    interimTranscript,
    micPermissionDenied,
    synthesisState,
    speakingMessageId,
    speechRate,
    setSpeechRate,
    speechRateOptions,
    availableVoices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    voicePrivacyNotice,
    speechRecognitionSupported,
    speechSynthesisSupported,
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
          recruiterMode={recruiterMode}
          onToggleRecruiterMode={toggleRecruiterMode}
          showHistory={showHistory}
          onToggleHistory={toggleHistory}
          sessionHistory={sessionHistory}
          copiedMessageId={copiedMessageId}
          onCopyMessage={copyMessageText}
          isScrolledUp={isScrolledUp}
          onMessagesScroll={handleMessagesScroll}
          onScrollToBottom={scrollToBottom}
          error={error}
          onClearError={clearError}
          onRetryLastMessage={retryLastMessage}
          voiceEnabled={voiceEnabled}
          onToggleVoiceOutput={toggleVoiceOutput}
          onDisableVoice={disableVoice}
          speechSynthesisSupported={speechSynthesisSupported}
          speechRecognitionSupported={speechRecognitionSupported}
          isListening={isListening}
          recognitionState={recognitionState}
          interimTranscript={interimTranscript}
          micPermissionDenied={micPermissionDenied}
          onStartVoiceInput={startVoiceInput}
          onStopVoiceInput={stopVoiceInput}
          onToggleVoiceInput={toggleVoiceInput}
          synthesisState={synthesisState}
          speakingMessageId={speakingMessageId}
          speechRate={speechRate}
          speechRateOptions={speechRateOptions}
          onSpeechRateChange={setSpeechRate}
          availableVoices={availableVoices}
          selectedVoiceURI={selectedVoiceURI}
          onSelectVoice={setSelectedVoiceURI}
          voicePrivacyNotice={voicePrivacyNotice}
          onSpeakMessage={speakMessage}
          onPlayVoiceOutput={playVoiceOutput}
          onPauseVoiceOutput={pauseVoiceOutput}
          onResumeVoiceOutput={resumeVoiceOutput}
          onStopVoiceOutput={stopVoiceOutput}
          messagesContainerRef={messagesContainerRef}
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
