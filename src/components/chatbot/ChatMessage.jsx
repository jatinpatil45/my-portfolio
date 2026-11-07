import { Bot } from 'lucide-react';

/**
 * Safely renders bold (**text**), italic (*text*), and clickable URLs / mailto links
 * as React nodes without using dangerouslySetInnerHTML.
 */
export function renderInlineTokens(line, keyPrefix) {
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

export function renderFormattedMessage(text) {
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

const ChatMessage = ({ message }) => {
  if (!message) return null;
  const isUser = message.sender === 'user';

  return (
    <div
      className={`jatin-chatbot-msg-row ${
        isUser ? 'jatin-chatbot-msg-row--user' : ''
      }`}
    >
      {!isUser && (
        <div className="jatin-chatbot-msg-avatar" aria-hidden="true">
          <Bot size={15} />
        </div>
      )}

      <div className="jatin-chatbot-bubble-group">
        <div
          className={`jatin-chatbot-bubble ${
            isUser ? 'jatin-chatbot-bubble--user' : 'jatin-chatbot-bubble--bot'
          }`}
        >
          {isUser ? <p>{message.text}</p> : renderFormattedMessage(message.text)}
        </div>
        {message.timestamp && (
          <span className="jatin-chatbot-time">{message.timestamp}</span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
