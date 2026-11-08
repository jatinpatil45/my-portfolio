import {
  Bot,
  User,
  Copy,
  Check,
  ExternalLink,
  Github,
  Award,
  Sparkles,
  Volume2,
  Briefcase,
  CornerDownRight,
} from 'lucide-react';

/**
 * Navigates smoothly to an in-page hash section if present on the current document,
 * or opens the link in a new tab.
 */
function handlePortfolioLinkClick(event, url) {
  if (!url) return;
  try {
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const hash = url.slice(hashIndex);
      const targetEl = document.querySelector(hash);
      if (targetEl) {
        event.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  } catch {
    // Allow default anchor navigation
  }
}

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
          onClick={(e) => handlePortfolioLinkClick(e, part)}
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

const ProjectCardsList = ({ items = [], onSelectQuestion }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="jatin-chatbot-cards-grid" aria-label="Project cards">
      {items.map((proj) => (
        <div key={proj.id || proj.title} className="jatin-chatbot-card">
          <div className="jatin-chatbot-card-header">
            <span className="jatin-chatbot-card-badge">{proj.category || 'Project'}</span>
            {proj.featured && (
              <span className="jatin-chatbot-card-featured">
                <Sparkles size={10} /> Featured
              </span>
            )}
          </div>
          <h4 className="jatin-chatbot-card-title">{proj.title}</h4>
          <p className="jatin-chatbot-card-desc">{proj.description}</p>

          {Array.isArray(proj.tech) && proj.tech.length > 0 && (
            <div className="jatin-chatbot-card-tags">
              {proj.tech.map((t) => (
                <span key={t} className="jatin-chatbot-card-tag">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="jatin-chatbot-card-actions">
            {proj.liveUrl && (
              <a
                href={proj.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="jatin-chatbot-card-link jatin-chatbot-card-link--primary"
              >
                <ExternalLink size={11} /> Live Demo
              </a>
            )}
            {proj.github && (
              <a
                href={proj.github}
                target="_blank"
                rel="noopener noreferrer"
                className="jatin-chatbot-card-link"
              >
                <Github size={11} /> Code
              </a>
            )}
            {items.length > 1 && onSelectQuestion && (
              <button
                type="button"
                className="jatin-chatbot-card-btn"
                onClick={() => onSelectQuestion(`Tell me about ${proj.title}`, 'card_action')}
                aria-label={`Inspect ${proj.title}`}
              >
                Details
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const CertificationCardsList = ({ items = [] }) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="jatin-chatbot-cards-grid" aria-label="Certification cards">
      {items.map((cert) => (
        <div key={cert.id || cert.title} className="jatin-chatbot-card jatin-chatbot-card--cert">
          <div className="jatin-chatbot-card-header">
            <span className="jatin-chatbot-card-badge">
              <Award size={11} /> {cert.issuer}
            </span>
            {cert.date && <span className="jatin-chatbot-card-date">{cert.date}</span>}
          </div>
          <h4 className="jatin-chatbot-card-title">{cert.title}</h4>
          {Array.isArray(cert.skills) && cert.skills.length > 0 && (
            <div className="jatin-chatbot-card-tags">
              {cert.skills.map((s) => (
                <span key={s} className="jatin-chatbot-card-tag">
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="jatin-chatbot-card-actions">
            {cert.verificationUrl ? (
              <a
                href={cert.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="jatin-chatbot-card-link jatin-chatbot-card-link--primary"
              >
                <ExternalLink size={11} /> Verify Credential
              </a>
            ) : (
              cert.portfolioLink && (
                <a
                  href={cert.portfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="jatin-chatbot-card-link"
                  onClick={(e) => handlePortfolioLinkClick(e, cert.portfolioLink)}
                >
                  <ExternalLink size={11} /> View Certificate
                </a>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const ChatMessage = ({
  message,
  isCopied = false,
  onCopy,
  onSelectQuestion,
  speechSynthesisSupported = false,
  onSpeak,
}) => {
  if (!message) return null;
  const isUser = message.sender === 'user';
  const showRelated =
    !isUser &&
    message.intent !== 'welcome' &&
    Array.isArray(message.relatedQuestions) &&
    message.relatedQuestions.length > 0;

  return (
    <div
      className={`jatin-chatbot-msg-row ${
        isUser ? 'jatin-chatbot-msg-row--user' : ''
      }`}
    >
      <div
        className={`jatin-chatbot-msg-avatar ${
          isUser ? 'jatin-chatbot-msg-avatar--user' : ''
        }`}
        aria-hidden="true"
      >
        {isUser ? <User size={14} /> : <Bot size={15} />}
      </div>

      <div className="jatin-chatbot-bubble-group">
        {/* Recruiter Mode Takeaway Callout */}
        {!isUser && message.recruiterHighlight && (
          <div className="jatin-chatbot-recruiter-note">
            <Briefcase size={12} />
            <span>{message.recruiterHighlight}</span>
          </div>
        )}

        <div
          className={`jatin-chatbot-bubble ${
            isUser ? 'jatin-chatbot-bubble--user' : 'jatin-chatbot-bubble--bot'
          }`}
        >
          {isUser ? <p>{message.text}</p> : renderFormattedMessage(message.text)}
        </div>

        {/* Rich Interactive Cards (Projects or Certifications) */}
        {!isUser && message.cards?.type === 'projects' && (
          <ProjectCardsList
            items={message.cards.items}
            onSelectQuestion={onSelectQuestion}
          />
        )}

        {!isUser && message.cards?.type === 'certifications' && (
          <CertificationCardsList items={message.cards.items} />
        )}

        {/* Clickable Portfolio Action Links */}
        {!isUser && Array.isArray(message.links) && message.links.length > 0 && (
          <div className="jatin-chatbot-action-links" aria-label="Portfolio links">
            {message.links.map((lnk) => (
              <a
                key={`${lnk.label}-${lnk.url}`}
                href={lnk.url}
                target={lnk.url.startsWith('mailto:') ? undefined : '_blank'}
                rel={lnk.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                className="jatin-chatbot-link-pill"
                onClick={(e) => handlePortfolioLinkClick(e, lnk.url)}
              >
                <ExternalLink size={11} />
                <span>{lnk.label}</span>
              </a>
            ))}
          </div>
        )}

        {/* Related Follow-Up Questions After Each Response */}
        {showRelated && onSelectQuestion && (
          <div className="jatin-chatbot-related">
            <span className="jatin-chatbot-related-label">
              <CornerDownRight size={11} /> Related questions:
            </span>
            <div className="jatin-chatbot-related-list">
              {message.relatedQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="jatin-chatbot-related-chip"
                  onClick={() => onSelectQuestion(q, 'related_question')}
                  aria-label={`Follow up: ${q}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Meta Footer: Timestamp, Confidence Badge, Copy & Speak Controls */}
        <div className="jatin-chatbot-msg-meta">
          {message.timestamp && (
            <span className="jatin-chatbot-time">{message.timestamp}</span>
          )}

          {!isUser && message.confidenceLevel && message.intent !== 'welcome' && (
            <span
              className={`jatin-chatbot-conf-badge jatin-chatbot-conf-badge--${message.confidenceLevel}`}
              title={`Match confidence: ${Math.round((message.confidence || 0) * 100)}%`}
            >
              {message.confidenceLevel === 'high'
                ? 'Verified'
                : message.confidenceLevel === 'medium'
                ? 'Clarify'
                : 'Topic Guide'}
            </span>
          )}

          {!isUser && onCopy && (
            <button
              type="button"
              className={`jatin-chatbot-meta-btn ${
                isCopied ? 'jatin-chatbot-meta-btn--copied' : ''
              }`}
              onClick={() => onCopy(message.id, message.text)}
              aria-label={isCopied ? 'Copied response' : 'Copy response'}
              title={isCopied ? 'Copied!' : 'Copy response'}
            >
              {isCopied ? (
                <>
                  <Check size={11} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}

          {!isUser && speechSynthesisSupported && onSpeak && (
            <button
              type="button"
              className="jatin-chatbot-meta-btn"
              onClick={() => onSpeak(message.text)}
              aria-label="Read response aloud"
              title="Listen to response"
            >
              <Volume2 size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
