import { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import chatbotKnowledge, { PORTFOLIO_LINKS } from '../../data/chatbotKnowledge';
import { buildCandidateSummaryCard } from '../../utils/responseGenerator';

/**
 * 15 Required Recruiter Question Categories
 * Every category maps to a query processed by the custom Jatin AI response engine.
 */
export const RECRUITER_QUESTION_CATEGORIES = [
  {
    id: 'candidate_introduction',
    number: 1,
    label: 'Candidate introduction',
    query: 'Candidate introduction',
  },
  {
    id: 'education',
    number: 2,
    label: 'Education',
    query: "What is Jatin's education?",
  },
  {
    id: 'technical_skills',
    number: 3,
    label: 'Technical skills',
    query: "What are Jatin's technical skills?",
  },
  {
    id: 'programming_languages',
    number: 4,
    label: 'Programming languages',
    query: 'What programming languages does Jatin know?',
  },
  {
    id: 'data_science_knowledge',
    number: 5,
    label: 'Data Science knowledge',
    query: 'Data Science knowledge',
  },
  {
    id: 'ai_ml_interests',
    number: 6,
    label: 'AI and Machine Learning interests',
    query: 'AI and Machine Learning interests',
  },
  {
    id: 'web_development_skills',
    number: 7,
    label: 'Web development skills',
    query: 'Web development skills',
  },
  {
    id: 'cybersecurity_learning',
    number: 8,
    label: 'Cybersecurity learning',
    query: 'Cybersecurity learning',
  },
  {
    id: 'projects_technologies',
    number: 9,
    label: 'Projects and technologies used',
    query: 'Projects and technologies used',
  },
  {
    id: 'certifications',
    number: 10,
    label: 'Certifications',
    query: 'What certifications does Jatin have?',
  },
  {
    id: 'google_student_ambassador',
    number: 11,
    label: 'Google Student Ambassador activities',
    query: 'Google Student Ambassador activities',
  },
  {
    id: 'achievements',
    number: 12,
    label: 'Achievements',
    query: "What are Jatin's achievements?",
  },
  {
    id: 'github_repositories',
    number: 13,
    label: 'GitHub repositories',
    query: 'GitHub repositories',
  },
  {
    id: 'linkedin_profile',
    number: 14,
    label: 'LinkedIn profile',
    query: 'Share LinkedIn profile',
  },
  {
    id: 'contact_information',
    number: 15,
    label: 'Contact information',
    query: 'How can I contact Jatin?',
  },
];

/**
 * 7 Required Recruiter Quick Actions
 */
export const RECRUITER_QUICK_ACTIONS = [
  {
    id: 'action_summary',
    label: 'Generate professional candidate summary',
    query: 'Generate professional candidate summary',
  },
  {
    id: 'action_skills',
    label: 'Show technical skills',
    query: 'Skills grouped by category',
  },
  {
    id: 'action_projects',
    label: 'Explore projects',
    query: 'Project portfolio summary',
  },
  {
    id: 'action_achievements',
    label: 'View achievements',
    query: 'Certifications and achievements summary',
  },
  {
    id: 'action_github',
    label: 'View GitHub',
    query: 'GitHub repositories',
  },
  {
    id: 'action_linkedin',
    label: 'View LinkedIn',
    query: 'Share LinkedIn profile',
  },
  {
    id: 'action_contact',
    label: 'Contact candidate',
    query: 'How can I contact Jatin?',
  },
];

/**
 * 4 Required Recruiter Structured Overview Requests
 */
export const RECRUITER_OVERVIEW_REQUESTS = [
  {
    id: 'overview_technical_profile',
    label: 'Technical profile overview',
    query: 'Technical profile overview',
  },
  {
    id: 'overview_project_portfolio',
    label: 'Project portfolio summary',
    query: 'Project portfolio summary',
  },
  {
    id: 'overview_skills_grouped',
    label: 'Skills grouped by category',
    query: 'Skills grouped by category',
  },
  {
    id: 'overview_certs_achievements',
    label: 'Certifications and achievements summary',
    query: 'Certifications and achievements summary',
  },
];

/**
 * Verified Candidate Summary Card Component
 * Uses strictly verified portfolio data and never claims unverified employment or industry experience.
 */
export const CandidateSummaryCard = ({ summary, onSelectQuery }) => {
  const data = summary || buildCandidateSummaryCard(chatbotKnowledge);

  return (
    <div
      className="jatin-chatbot-candidate-card"
      role="region"
      aria-label="Verified Candidate Summary Card"
    >
      <div className="jatin-chatbot-candidate-card-header">
        <div>
          <span className="jatin-chatbot-candidate-tag">
            <UserCheck size={11} /> Verified Candidate Summary
          </span>
          <h3 className="jatin-chatbot-candidate-name">{data.fullName}</h3>
        </div>
        <span className="jatin-chatbot-recruiter-avail">Open to Internships & Roles</span>
      </div>

      <div className="jatin-chatbot-candidate-grid">
        <div className="jatin-chatbot-candidate-row">
          <GraduationCap size={12} className="jatin-chatbot-candidate-icon" />
          <span>
            <strong>Education:</strong> {data.academicStatus} — {data.institution}
          </span>
        </div>
        <div className="jatin-chatbot-candidate-row">
          <Sparkles size={12} className="jatin-chatbot-candidate-icon" />
          <span>
            <strong>Focus:</strong> {data.focusArea}
          </span>
        </div>
        <div className="jatin-chatbot-candidate-row">
          <Code2 size={12} className="jatin-chatbot-candidate-icon" />
          <span>
            <strong>Languages:</strong> {data.coreLanguages} ({data.additionalLanguages})
          </span>
        </div>
        <div className="jatin-chatbot-candidate-row">
          <Award size={12} className="jatin-chatbot-candidate-icon" />
          <span>
            <strong>Leadership & Credentials:</strong> {data.campusRole} • {data.credentialsSummary}
          </span>
        </div>
        <div className="jatin-chatbot-candidate-row">
          <MapPin size={12} className="jatin-chatbot-candidate-icon" />
          <span>
            <strong>Location:</strong> {data.location}
          </span>
        </div>
      </div>

      <p className="jatin-chatbot-candidate-disclosure">
        <ShieldCheck size={12} className="jatin-chatbot-candidate-icon" />
        <span>{data.experienceDisclosure}</span>
      </p>

      <div className="jatin-chatbot-candidate-links">
        <a
          href={data.links?.github || PORTFOLIO_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="jatin-chatbot-recruiter-link"
        >
          <Github size={11} /> GitHub
        </a>
        <a
          href={data.links?.linkedin || PORTFOLIO_LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="jatin-chatbot-recruiter-link"
        >
          <Linkedin size={11} /> LinkedIn
        </a>
        <a
          href={`mailto:${data.links?.email || 'jatinpatil2233@gmail.com'}`}
          className="jatin-chatbot-recruiter-link"
        >
          <Mail size={11} /> Email
        </a>
        <a
          href={data.links?.portfolio || PORTFOLIO_LINKS.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="jatin-chatbot-recruiter-link"
        >
          <ExternalLink size={11} /> Portfolio
        </a>
        {onSelectQuery && (
          <button
            type="button"
            className="jatin-chatbot-recruiter-btn"
            onClick={() =>
              onSelectQuery(
                'Compare AI Study Assistant and AI Web Clone Builder',
                'recruiter_bar'
              )
            }
          >
            <FolderGit2 size={11} /> Compare Projects
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * RecruiterMode Component for Jatin AI
 *
 * Provides recruiters and hiring managers with:
 * - Dedicated Recruiter Mode active state & toggle control
 * - Verified Candidate Summary Card
 * - 7 Quick Actions
 * - 4 Executive Overview Requests
 * - 15 Structured Question Categories
 *
 * Uses the custom deterministic Jatin AI response engine (zero external AI APIs).
 */
const RecruiterMode = ({
  recruiterMode = false,
  onToggleRecruiterMode,
  onSelectQuery,
  disabled = false,
}) => {
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

  if (!recruiterMode) {
    return null;
  }

  const candidateSummary = buildCandidateSummaryCard(chatbotKnowledge);

  const handleActionClick = (query) => {
    if (!query || disabled || typeof onSelectQuery !== 'function') return;
    onSelectQuery(query, 'recruiter_mode');
  };

  return (
    <div
      className="jatin-chatbot-recruiter-banner"
      role="region"
      aria-label="Recruiter Mode Panel"
    >
      {/* Top Bar */}
      <div className="jatin-chatbot-recruiter-top">
        <span className="jatin-chatbot-recruiter-badge">
          <Briefcase size={11} /> Recruiter Mode Active
        </span>

        <div className="jatin-chatbot-recruiter-top-controls">
          <button
            type="button"
            className="jatin-chatbot-recruiter-collapse-btn"
            onClick={() => setIsDetailsExpanded((prev) => !prev)}
            aria-expanded={isDetailsExpanded}
            aria-label={
              isDetailsExpanded
                ? 'Collapse recruiter panel details'
                : 'Expand recruiter panel details'
            }
          >
            <span>{isDetailsExpanded ? 'Compact' : 'Expand Hub'}</span>
            {isDetailsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {onToggleRecruiterMode && (
            <button
              type="button"
              className="jatin-chatbot-recruiter-exit-btn"
              onClick={onToggleRecruiterMode}
              aria-label="Exit Recruiter Mode"
            >
              Exit Recruiter Mode
            </button>
          )}
        </div>
      </div>

      {/* Verified Candidate Summary Card */}
      <CandidateSummaryCard
        summary={candidateSummary}
        onSelectQuery={handleActionClick}
      />

      {isDetailsExpanded && (
        <div className="jatin-chatbot-recruiter-sections">
          {/* 7 Quick Actions */}
          <div className="jatin-chatbot-recruiter-group">
            <span className="jatin-chatbot-recruiter-group-title">
              Quick Actions:
            </span>
            <div
              className="jatin-chatbot-recruiter-actions"
              role="group"
              aria-label="Recruiter quick actions"
            >
              {RECRUITER_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="jatin-chatbot-recruiter-btn"
                  disabled={disabled}
                  onClick={() => handleActionClick(action.query)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Recruiter Overview Requests */}
          <div className="jatin-chatbot-recruiter-group">
            <span className="jatin-chatbot-recruiter-group-title">
              Request Structured Overviews:
            </span>
            <div
              className="jatin-chatbot-recruiter-actions"
              role="group"
              aria-label="Recruiter overview requests"
            >
              {RECRUITER_OVERVIEW_REQUESTS.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  className="jatin-chatbot-recruiter-btn jatin-chatbot-recruiter-btn--overview"
                  disabled={disabled}
                  onClick={() => handleActionClick(req.query)}
                >
                  {req.label}
                </button>
              ))}
            </div>
          </div>

          {/* 15 Question Categories */}
          <div className="jatin-chatbot-recruiter-group">
            <span className="jatin-chatbot-recruiter-group-title">
              Recruiter Question Categories (15):
            </span>
            <div
              className="jatin-chatbot-recruiter-categories"
              role="group"
              aria-label="Recruiter question categories"
            >
              {RECRUITER_QUESTION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className="jatin-chatbot-recruiter-cat-chip"
                  disabled={disabled}
                  onClick={() => handleActionClick(cat.query)}
                >
                  <span className="jatin-chatbot-recruiter-cat-num">
                    {cat.number}.
                  </span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterMode;
