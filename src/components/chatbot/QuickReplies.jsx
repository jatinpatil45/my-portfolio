/**
 * QuickReplies Component for Jatin AI 3.0
 *
 * Displays context-aware quick-reply suggestion chips.
 */

const QuickReplies = ({ suggestions = [], onSelect, disabled = false }) => {
  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="jatin-chatbot-suggestions">
      <span className="jatin-chatbot-suggestions-label">// Quick questions</span>
      <div className="jatin-chatbot-suggestions-list">
        {suggestions.map((question) => (
          <button
            key={question}
            type="button"
            className="jatin-chatbot-chip"
            onClick={() => onSelect(question, 'quick_reply')}
            disabled={disabled}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;
