import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PortfolioChatbot from '../components/PortfolioChatbot';
import chatbotKnowledge from '../data/chatbotKnowledge';
import { createKnowledgeGraph } from '../data/knowledgeGraph';
import { matchChatbotResponse } from '../utils/chatbotMatcher';
import { levenshteinDistance, similarityScore } from '../utils/fuzzyMatcher';
import { createInitialContext, updateContext } from '../utils/contextManager';
import { stripMarkdownForSpeech } from '../services/voiceService';
import { trackInteraction, getAnalyticsSummary, resetAnalytics } from '../services/analyticsService';

const EXPECTED_FALLBACK =
  "I'm not sure about that yet! You can ask me about Jatin's skills, projects, education, certifications or achievements.";

describe('Jatin AI - Rule-Based Matcher & Knowledge Base', () => {
  it('recognizes all initial suggested questions without hitting fallback', () => {
    for (const question of chatbotKnowledge.config.suggestedQuestions) {
      const res = matchChatbotResponse(question, chatbotKnowledge);
      expect(res.intent, `Failed on suggested question: "${question}"`).not.toBe('fallback');
      expect(res.reply).not.toBe(EXPECTED_FALLBACK);
      expect(res.reply.length).toBeGreaterThan(20);
    }
  });

  it('recognizes every follow-up quick-reply suggestion across all intents', () => {
    const seedQueries = [
      ...chatbotKnowledge.config.suggestedQuestions,
      'hello',
      'help',
      'experience',
      'currently learning',
      'github',
      'linkedin',
      'portfolio link',
      'thanks',
      'bye',
    ];

    for (const seed of seedQueries) {
      const seedRes = matchChatbotResponse(seed, chatbotKnowledge);
      for (const followUp of seedRes.suggestions || []) {
        const followRes = matchChatbotResponse(followUp, chatbotKnowledge);
        expect(
          followRes.intent,
          `Follow-up chip "${followUp}" (from "${seed}") fell back unexpectedly`
        ).not.toBe('fallback');
      }
    }
  });

  it('supports greetings case-insensitively and prioritizes topic when combined with a greeting', () => {
    expect(matchChatbotResponse('hello').intent).toBe('greeting');
    expect(matchChatbotResponse('HI!').intent).toBe('greeting');
    expect(matchChatbotResponse('Hey there').intent).toBe('greeting');

    const combined = matchChatbotResponse("Hi, what are Jatin's skills?");
    expect(combined.intent).toBe('skills');
    expect(combined.reply).toContain('Python');
  });

  it('answers verified details for skills, projects, education, certifications, achievements, and links', () => {
    const skillsRes = matchChatbotResponse('WHAT PROGRAMMING LANGUAGES DOES JATIN KNOW?');
    expect(skillsRes.intent).toBe('skills');
    expect(skillsRes.reply).toContain('Python');
    expect(skillsRes.reply).toContain('JavaScript');

    const projRes = matchChatbotResponse('tell me about AI Study Assistant');
    expect(projRes.intent).toBe('project_detail');
    expect(projRes.reply).toContain('https://github.com/jatinpatil45/ai-study-assistant');

    const cloneRes = matchChatbotResponse('tell me about AI Web Clone Builder');
    expect(cloneRes.intent).toBe('project_detail');
    expect(cloneRes.reply).toContain('https://github.com/jatinpatil45/Ai-Web-clone-builder');

    const eduRes = matchChatbotResponse('which university does jatin study at?');
    expect(eduRes.intent).toBe('education');
    expect(eduRes.reply).toContain('UPL University of Sustainable Technology');
    expect(eduRes.reply).toContain('Sem 6');

    const certRes = matchChatbotResponse('show certificates');
    expect(certRes.intent).toBe('certifications');
    expect(certRes.reply).toContain('CodeWithHarry');
    expect(certRes.reply).toContain('Microsoft Learn');

    const achRes = matchChatbotResponse('is jatin a google student ambassador?');
    expect(achRes.intent).toBe('achievements');
    expect(achRes.reply).toContain('Google Student Ambassador');

    const ghRes = matchChatbotResponse('share github link');
    expect(ghRes.reply).toContain('https://github.com/jatinpatil45');

    const liRes = matchChatbotResponse('linkedin profile');
    expect(liRes.reply).toContain('https://www.linkedin.com/in/jatin-patil-b75146376/');

    const portRes = matchChatbotResponse('portfolio website url');
    expect(portRes.reply).toContain('https://jatinpatil45.vercel.app/');
  });

  it('returns the exact required fallback message and never invents unverified info', () => {
    const unknown1 = matchChatbotResponse('What is the weather in Mars today?');
    expect(unknown1.intent).toBe('fallback');
    expect(unknown1.reply).toBe(EXPECTED_FALLBACK);

    const unknown2 = matchChatbotResponse("What is Jatin's favorite food?");
    expect(unknown2.intent).toBe('fallback');
    expect(unknown2.reply).toBe(EXPECTED_FALLBACK);
  });
});

describe('PortfolioChatbot UI & Offline Functionality', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('opens, sends messages via suggested buttons and Enter key, clears chat, and makes zero network requests', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    render(<PortfolioChatbot />);

    // Open chat via floating button
    const openBtn = screen.getByLabelText('Open Jatin AI chat');
    fireEvent.click(openBtn);

    // Header & status check
    expect(
      screen.getByText('Jatin AI – Personal Portfolio Assistant')
    ).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();

    // Click a suggested question button
    const skillChip = screen.getByRole('button', {
      name: "What are Jatin's technical skills?",
    });
    fireEvent.click(skillChip);

    // Typing animation appears immediately
    expect(screen.getByLabelText('Jatin AI is typing')).toBeInTheDocument();

    // Advance timer for bot reply
    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(screen.queryByLabelText('Jatin AI is typing')).not.toBeInTheDocument();
    expect(screen.getByText(/Technical Skills:/i)).toBeInTheDocument();

    // Send message using Enter key
    const input = screen.getByLabelText('Message Jatin AI');
    fireEvent.change(input, { target: { value: 'unknown random question xyz' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(screen.getByText(EXPECTED_FALLBACK)).toBeInTheDocument();

    // Clear chat resets conversation to single welcome message
    const clearBtn = screen.getByLabelText('Clear chat');
    fireEvent.click(clearBtn);
    expect(screen.queryByText(EXPECTED_FALLBACK)).not.toBeInTheDocument();

    // Confirm zero network calls (100% offline capable after page load)
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('Jatin AI 3.0 Modular Architecture (Knowledge Graph, Fuzzy NLP, Context, Analytics & Voice)', () => {
  it('resolves typo-tolerant queries via fuzzyMatcher without false positives', () => {
    expect(levenshteinDistance('skills', 'skils')).toBe(1);
    expect(similarityScore('certifications', 'certifcations')).toBeGreaterThan(0.9);

    const typoSkills = matchChatbotResponse('what are jatins skils');
    expect(typoSkills.intent).toBe('skills');

    const typoCerts = matchChatbotResponse('show jatins certifcations');
    expect(typoCerts.intent).toBe('certifications');

    const typoStudyMate = matchChatbotResponse('tell me about studymat');
    expect(typoStudyMate.intent).toBe('project_detail');
    expect(typoStudyMate.reply).toContain('StudyMate AI');
  });

  it('traverses the Knowledge Graph for skill-to-project, project-to-tech, and achievement-to-activity relationships', () => {
    const graph = createKnowledgeGraph(chatbotKnowledge);

    const pythonProjects = graph.getProjectsBySkill('Python');
    expect(pythonProjects.length).toBeGreaterThanOrEqual(2);
    expect(pythonProjects.some((p) => p.title.includes('Smart City'))).toBe(true);

    const studyMateTech = graph.getTechnologiesByProject('AI Study Assistant');
    expect(studyMateTech).toContain('React');
    expect(studyMateTech).toContain('TypeScript');

    const gsaActivities = graph.getActivitiesForAchievement('Google Student Ambassador');
    expect(gsaActivities.length).toBeGreaterThan(0);

    const pythonCerts = graph.getCertificationsBySkill('Python');
    expect(pythonCerts.length).toBeGreaterThanOrEqual(1);

    const relatedToStudyMate = graph.getRelatedProjects('AI Study Assistant (StudyMate AI)');
    expect(relatedToStudyMate.length).toBeGreaterThan(0);
  });

  it('validates all 10 structured knowledge categories, item schema, verification status, and retrieveKnowledge()', () => {
    const expectedCategoryKeys = [
      'personalProfile',
      'education',
      'programmingLanguages',
      'technicalSkills',
      'projects',
      'certifications',
      'achievements',
      'experience',
      'contactInformation',
      'learningInterests',
    ];

    for (const key of expectedCategoryKeys) {
      expect(Array.isArray(chatbotKnowledge.structuredCategories[key])).toBe(true);
      expect(chatbotKnowledge.structuredCategories[key].length).toBeGreaterThan(0);
    }

    const seenIds = new Set();
    for (const item of chatbotKnowledge.allKnowledgeItems) {
      expect(typeof item.id).toBe('string');
      expect(seenIds.has(item.id)).toBe(false);
      seenIds.add(item.id);

      expect(typeof item.category).toBe('string');
      expect(typeof item.title).toBe('string');
      expect(typeof item.description).toBe('string');
      expect(Array.isArray(item.keywords)).toBe(true);
      expect(Array.isArray(item.synonyms)).toBe(true);
      expect(Array.isArray(item.relatedIds)).toBe(true);
      expect(typeof item.source).toBe('string');
      expect(['verified', 'incomplete']).toContain(item.verificationStatus);
    }

    const retrieval = chatbotKnowledge.retrieveKnowledge('Tell me about Python and StudyMate AI');
    expect(retrieval.hasVerifiedMatch).toBe(true);
    expect(retrieval.matchedItems.length).toBeGreaterThan(0);
    expect(retrieval.relatedItems.length).toBeGreaterThan(0);
    expect(retrieval.portfolioLinks.length).toBeGreaterThan(0);
  });

  it('maintains multi-turn conversation context for pronoun follow-up questions', () => {
    let ctx = createInitialContext();
    const firstTurn = matchChatbotResponse('Tell me about AI Study Assistant', chatbotKnowledge, ctx);
    expect(firstTurn.intent).toBe('project_detail');

    ctx = updateContext(ctx, firstTurn.matchResult, 'Tell me about AI Study Assistant');
    expect(ctx.lastProject?.title).toContain('AI Study Assistant');

    const secondTurn = matchChatbotResponse('Is there a live demo for it?', chatbotKnowledge, ctx);
    expect(secondTurn.intent).toBe('project_detail');
    expect(secondTurn.reply).toContain('https://studymate-ai-nine-tau.vercel.app');
  });

  it('tracks client-side analytics and strips markdown cleanly for speech synthesis', () => {
    resetAnalytics();
    trackInteraction({ query: 'skills', intent: 'skills', confidence: 0.95, source: 'quick_reply' });
    const summary = getAnalyticsSummary();
    expect(summary.totalMessages).toBe(1);
    expect(summary.quickReplyClicks).toBe(1);
    expect(summary.topIntents[0].intent).toBe('skills');

    const speechClean = stripMarkdownForSpeech('Hello 👋 **Jatin AI** at https://jatinpatil45.vercel.app/');
    expect(speechClean).toBe('Hello Jatin AI at link');
  });
});
