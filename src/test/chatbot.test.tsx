import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PortfolioChatbot from '../components/PortfolioChatbot';
import chatbotKnowledge from '../data/chatbotKnowledge';
import { createKnowledgeGraph } from '../data/knowledgeGraph';
import {
  normalizeText,
  expandContractions,
  normalizeSpellingVariations,
  matchIntent,
  matchChatbotResponse,
  levenshteinDistance,
  damerauLevenshteinDistance,
  normalizedEditDistance,
  similarityScore,
  CONFIDENCE_THRESHOLDS,
  classifyConfidence,
  createInitialContext,
  updateContext,
  getRecommendations,
  getStructuredRecommendations,
  deduplicateResponseLines,
  buildCandidateSummaryCard,
} from '../utils/chatbotMatcher';
import {
  RECRUITER_QUESTION_CATEGORIES,
  RECRUITER_QUICK_ACTIONS,
  RECRUITER_OVERVIEW_REQUESTS,
} from '../components/RecruiterMode';
import {
  VOICE_PRIVACY_NOTICE,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  clampSpeechRate,
  getAvailableVoices,
  stripMarkdownForSpeech,
  speakText,
  pauseSpeaking,
  resumeSpeaking,
  stopSpeaking,
  mapSpeechRecognitionError,
  createSpeechRecognizer,
} from '../services/voiceService';
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
      'why should we hire jatin?',
      'compare projects',
      'what do you recommend?',
      'what programming languages does jatin know?',
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

  it('answers verified details for skills, programming languages, projects, education, certifications, achievements, and links', () => {
    const langRes = matchChatbotResponse('WHAT PROGRAMMING LANGUAGES DOES JATIN KNOW?');
    expect(langRes.intent).toBe('programming_languages');
    expect(langRes.reply).toContain('Python');
    expect(langRes.reply).toContain('JavaScript');

    const skillsRes = matchChatbotResponse("What are Jatin's technical skills?");
    expect(skillsRes.intent).toBe('skills');
    expect(skillsRes.reply).toContain('Python');
    expect(skillsRes.reply).toContain('React');

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
    expect(unknown1.confidenceLevel).toBe('low');
    expect(unknown1.reply).toBe(EXPECTED_FALLBACK);

    const unknown2 = matchChatbotResponse("What is Jatin's favorite food?");
    expect(unknown2.intent).toBe('fallback');
    expect(unknown2.confidenceLevel).toBe('low');
    expect(unknown2.reply).toBe(EXPECTED_FALLBACK);
  });
});

describe('Advanced API-Free Intelligence Engine (8 Core Requirements)', () => {
  it('1. Text normalization: lowercase, punctuation removal, space normalization, spelling variations, and contractions', () => {
    const norm1 = normalizeText("  What's   Jatin's   PYHTON & C++   skils?!  ");
    expect(norm1.normalized).toBe('what is jatins python c++ skills');
    expect(norm1.tokens).toContain('c++');
    expect(norm1.tokens).toContain('python');
    expect(norm1.tokens).toContain('skills');

    expect(expandContractions("Who's he and what's he built? Can't wait!")).toContain('who is');
    expect(expandContractions("Who's he and what's he built? Can't wait!")).toContain('what is');
    expect(expandContractions("Who's he and what's he built? Can't wait!")).toContain('cannot');

    expect(normalizeSpellingVariations('javasript certifcations acheivements')).toBe(
      'javascript certifications achievements'
    );
  });

  it('2 & 3. Recognizes all 18 required intents and synonym variations ("Tell me about Jatin", "Who is Jatin?", "Introduce Jatin")', () => {
    // Synonym variations for Introduction
    const intro1 = matchChatbotResponse('Tell me about Jatin');
    const intro2 = matchChatbotResponse('Who is Jatin?');
    const intro3 = matchChatbotResponse('Introduce Jatin');
    expect(intro1.intent).toBe('about');
    expect(intro2.intent).toBe('about');
    expect(intro3.intent).toBe('about');
    expect(intro1.reply).toContain('Jatin Narayanbhai Patil');
    expect(intro2.reply).toContain('UPL University of Sustainable Technology');
    expect(intro3.reply).toContain('B.E. Computer Engineering');

    // All 18 intents check
    expect(matchIntent('Hello there!').intent).toBe('greeting');
    expect(matchIntent('Introduce Jatin').intent).toBe('about');
    expect(matchIntent("What is Jatin's education?").intent).toBe('education');
    expect(matchIntent("What are Jatin's technical skills?").intent).toBe('skills');
    expect(matchIntent('What programming languages does Jatin know?').intent).toBe('programming_languages');
    expect(matchIntent("Show me Jatin's projects").intent).toBe('projects');
    expect(matchIntent('Tell me about AI Study Assistant').intent).toBe('project_detail');
    expect(matchIntent('What certifications does Jatin have?').intent).toBe('certifications');
    expect(matchIntent("What are Jatin's achievements?").intent).toBe('achievements');
    expect(matchIntent("What is Jatin's work experience?").intent).toBe('experience');
    expect(matchIntent('Share GitHub link').intent).toBe('github_link');
    expect(matchIntent('Share LinkedIn profile').intent).toBe('linkedin_link');
    expect(matchIntent('How can I contact Jatin?').intent).toBe('contact');
    expect(matchIntent('Why should we hire Jatin? Recruiter information').intent).toBe('recruiter_info');
    expect(matchIntent('Compare AI Study Assistant and AI Web Clone Builder').intent).toBe('comparisons');
    expect(matchIntent('What project do you recommend I look at first?').intent).toBe('recommendations');
    expect(matchIntent('Thank you so much!').intent).toBe('thanks');
    expect(matchIntent('Goodbye, see you later').intent).toBe('goodbye');
  });

  it('4. Fuzzy matching: normalized edit distance, typo tolerance, and confidence thresholds', () => {
    expect(levenshteinDistance('skills', 'skils')).toBe(1);
    expect(damerauLevenshteinDistance('python', 'pyhton')).toBe(1);
    expect(normalizedEditDistance('projects', 'projects')).toBe(0);
    expect(similarityScore('certifications', 'certifcations')).toBeGreaterThan(0.9);

    expect(classifyConfidence(0.9)).toBe('high');
    expect(classifyConfidence(0.6)).toBe('medium');
    expect(classifyConfidence(0.2)).toBe('low');
    expect(CONFIDENCE_THRESHOLDS.HIGH).toBeGreaterThan(CONFIDENCE_THRESHOLDS.MEDIUM);

    const typoSkills = matchChatbotResponse('what are jatins skils');
    expect(typoSkills.intent).toBe('skills');
    expect(typoSkills.confidenceLevel).toBe('high');

    const typoCerts = matchChatbotResponse('show jatins certifcations');
    expect(typoCerts.intent).toBe('certifications');

    const typoStudyMate = matchChatbotResponse('tell me about studymat');
    expect(typoStudyMate.intent).toBe('project_detail');
    expect(typoStudyMate.reply).toContain('StudyMate AI');
  });

  it('5. Context resolution: resolves "Which one uses Python?" against previous project results and supports pronoun/ordinal follow-ups', () => {
    let ctx = createInitialContext();

    // Turn 1: User asks "Tell me about Jatin's projects."
    const turn1 = matchChatbotResponse("Tell me about Jatin's projects.", chatbotKnowledge, ctx);
    expect(turn1.intent).toBe('projects');
    ctx = updateContext(ctx, turn1.matchResult, "Tell me about Jatin's projects.", chatbotKnowledge);
    expect(ctx.lastProjectsList.length).toBeGreaterThanOrEqual(6);

    // Turn 2: User asks "Which one uses Python?"
    const turn2 = matchChatbotResponse('Which one uses Python?', chatbotKnowledge, ctx);
    expect(turn2.intent).toBe('project_detail');
    expect(turn2.matchResult.followUpType).toBe('project_list_filter');
    expect(turn2.reply).toContain('Smart City Traffic Analyzer');
    expect(turn2.reply).toContain('AI-Powered Sales Forecaster');
    expect(turn2.reply).toContain('Python');

    // Turn 3: Ordinal reference on previous projects ("Tell me about the first one")
    let ctxAll = createInitialContext();
    const allProj = matchChatbotResponse("Show me Jatin's projects", chatbotKnowledge, ctxAll);
    ctxAll = updateContext(ctxAll, allProj.matchResult, "Show me Jatin's projects", chatbotKnowledge);
    const ordinalTurn = matchChatbotResponse('Tell me about the first one', chatbotKnowledge, ctxAll);
    expect(ordinalTurn.intent).toBe('project_detail');
    expect(ordinalTurn.reply).toContain('AI Study Assistant (StudyMate AI)');

    // Turn 4: Pronoun follow-up ("Is there a live demo for it?")
    ctxAll = updateContext(ctxAll, ordinalTurn.matchResult, 'Tell me about the first one', chatbotKnowledge);
    const demoTurn = matchChatbotResponse('Is there a live demo for it?', chatbotKnowledge, ctxAll);
    expect(demoTurn.intent).toBe('project_detail');
    expect(demoTurn.reply).toContain('https://studymate-ai-nine-tau.vercel.app');
  });

  it('6 & 7. Response generation & Confidence system: handles high/medium/low confidence, avoids duplicate lines, never invents missing facts, and does not pretend to be an LLM', () => {
    // Medium confidence clarifying question on ambiguous query
    const ambiguousProj = matchChatbotResponse('Tell me about the AI project');
    expect(ambiguousProj.intent).toBe('clarification');
    expect(ambiguousProj.confidenceLevel).toBe('medium');
    expect(ambiguousProj.reply).toContain('Clarification Needed');
    expect(ambiguousProj.suggestions).toContain('Tell me about AI Study Assistant');

    // Contextless follow-up triggers medium-confidence clarification
    const contextlessFollowUp = matchChatbotResponse('Which one?');
    expect(contextlessFollowUp.intent).toBe('clarification');
    expect(contextlessFollowUp.confidenceLevel).toBe('medium');

    // Never invents missing facts (CGPA & Phone number)
    const cgpaQuery = matchChatbotResponse("What is Jatin's CGPA?");
    expect(cgpaQuery.intent).toBe('education');
    expect(cgpaQuery.reply).toContain('not publicly listed');
    expect(cgpaQuery.reply).toContain('UPL University of Sustainable Technology');

    const phoneQuery = matchChatbotResponse("What is Jatin's phone number?");
    expect(phoneQuery.intent).toBe('contact');
    expect(phoneQuery.reply).toContain('not publicly listed');
    expect(phoneQuery.reply).toContain('jatinpatil2233@gmail.com');

    // Does not pretend to be an LLM
    const llmQuery = matchChatbotResponse('Are you an LLM or ChatGPT?');
    expect(llmQuery.intent).toBe('bot_help');
    expect(llmQuery.reply).toContain('not an LLM');

    // Deduplicates repeated bullet lines
    const dupText = 'Header\n• Same bullet\n• Same bullet\n• Different bullet';
    expect(deduplicateResponseLines(dupText)).toBe('Header\n• Same bullet\n• Different bullet');
  });

  it('8. Recommendation engine: suggests relevant skills, projects, and profile sections based on conversation context', () => {
    let ctx = createInitialContext();
    const skillTurn = matchChatbotResponse('Does Jatin know Python?', chatbotKnowledge, ctx);
    ctx = updateContext(ctx, skillTurn.matchResult, 'Does Jatin know Python?', chatbotKnowledge);

    const structured = getStructuredRecommendations(skillTurn.matchResult, ctx, chatbotKnowledge);
    expect(structured.projects.length).toBeGreaterThan(0);
    expect(structured.projects.some((p) => p.title.includes('Smart City'))).toBe(true);
    expect(structured.skills.length).toBeGreaterThan(0);
    expect(structured.sections.length).toBeGreaterThan(0);

    const dynamicRecs = getRecommendations(skillTurn.matchResult, ctx, chatbotKnowledge);
    expect(dynamicRecs.length).toBeGreaterThan(0);
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

  it('renders project cards, certification cards, recruiter mode toggle, copy button, scroll-to-bottom, and session history with empty state', async () => {
    render(<PortfolioChatbot />);

    fireEvent.click(screen.getByLabelText('Open Jatin AI chat'));

    // 1. Check Session History Empty State before any questions are asked
    const historyBtn = screen.getByLabelText('Conversation history');
    fireEvent.click(historyBtn);
    expect(screen.getByText('No questions asked yet')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Back to Chat'));

    // 2. Toggle Recruiter Mode ON
    const recruiterToggle = screen.getByLabelText('Toggle Recruiter Mode');
    fireEvent.click(recruiterToggle);
    expect(screen.getByText('Recruiter Mode Active')).toBeInTheDocument();

    // 3. Ask for projects to verify interactive Project Cards, Related Questions, and Scroll-to-Bottom button
    const input = screen.getByLabelText('Message Jatin AI');
    fireEvent.change(input, { target: { value: "Show me Jatin's projects" } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(screen.getByLabelText('Project cards')).toBeInTheDocument();
    expect(screen.getByText(/Recruiter Takeaway:/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Scroll to bottom')).toBeInTheDocument();

    // 4. Ask for certifications to verify Certification Cards
    fireEvent.change(input, { target: { value: 'What certifications does Jatin have?' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(screen.getByLabelText('Certification cards')).toBeInTheDocument();

    // 5. Copy response button
    const copyButtons = screen.getAllByLabelText('Copy response');
    expect(copyButtons.length).toBeGreaterThan(0);
    await act(async () => {
      fireEvent.click(copyButtons[copyButtons.length - 1]);
    });

    // 6. Session History now lists the 2 asked questions
    fireEvent.click(historyBtn);
    expect(screen.getByText(/Questions asked during your current session \(2\)/i)).toBeInTheDocument();
  });
});

describe('Jatin AI 3.0 Knowledge Graph, Structured Schema, Analytics & Voice', () => {
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

describe('Browser-Native Voice Input, Voice Output & Privacy Controls', () => {
  let lastRecognitionInstance: any = null;
  let spokenUtterances: any[] = [];
  let mockVoices: any[] = [];

  class MockSpeechRecognition {
    lang = 'en-US';
    interimResults = true;
    maxAlternatives = 1;
    continuous = false;
    onstart: any = null;
    onaudiostart: any = null;
    onspeechstart: any = null;
    onresult: any = null;
    onerror: any = null;
    onend: any = null;
    start = vi.fn(() => {
      if (this.onstart) this.onstart();
    });
    stop = vi.fn(() => {
      if (this.onend) this.onend();
    });
    abort = vi.fn(() => {
      if (this.onend) this.onend();
    });
    constructor() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      lastRecognitionInstance = this;
    }
  }

  class MockSpeechSynthesisUtterance {
    text: string;
    lang = 'en-US';
    rate = 1;
    pitch = 1;
    voice: any = null;
    onstart: any = null;
    onpause: any = null;
    onresume: any = null;
    onend: any = null;
    onerror: any = null;
    constructor(text: string) {
      this.text = text;
    }
  }

  beforeEach(() => {
    vi.useFakeTimers();
    lastRecognitionInstance = null;
    spokenUtterances = [];
    mockVoices = [
      { name: 'Google US English', lang: 'en-US', voiceURI: 'Google US English' },
      { name: 'Microsoft Aria Online', lang: 'en-GB', voiceURI: 'Microsoft Aria Online' },
    ];

    (window as any).SpeechRecognition = undefined;
    (window as any).webkitSpeechRecognition = MockSpeechRecognition;
    (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    (window as any).speechSynthesis = {
      speaking: false,
      paused: false,
      getVoices: vi.fn(() => mockVoices),
      speak: vi.fn((utterance: any) => {
        spokenUtterances.push(utterance);
        (window as any).speechSynthesis.speaking = true;
        (window as any).speechSynthesis.paused = false;
        if (utterance.onstart) utterance.onstart();
      }),
      cancel: vi.fn(() => {
        (window as any).speechSynthesis.speaking = false;
        (window as any).speechSynthesis.paused = false;
      }),
      pause: vi.fn(() => {
        (window as any).speechSynthesis.Paused = true;
        (window as any).speechSynthesis.paused = true;
      }),
      resume: vi.fn(() => {
        (window as any).speechSynthesis.paused = false;
        (window as any).speechSynthesis.speaking = true;
      }),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    delete (window as any).SpeechSynthesisUtterance;
    delete (window as any).speechSynthesis;
    vi.restoreAllMocks();
  });

  it('does not activate microphone automatically, supports start/stop recognition, shows listening & recognizing states, and passes recognized text to chatbot engine', () => {
    expect(isSpeechRecognitionSupported()).toBe(true);
    expect(isSpeechSynthesisSupported()).toBe(true);

    render(<PortfolioChatbot />);
    fireEvent.click(screen.getByLabelText('Open Jatin AI chat'));

    // Verify microphone is NOT activated automatically on open
    expect(lastRecognitionInstance).toBeNull();
    expect(screen.queryByText('Listening...')).not.toBeInTheDocument();

    // Start microphone recognition
    const startMicBtn = screen.getByLabelText('Start voice input');
    fireEvent.click(startMicBtn);

    expect(lastRecognitionInstance).not.toBeNull();
    expect(lastRecognitionInstance.start).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Listening...')).toBeInTheDocument();

    // Simulate interim recognition state ("Recognizing...")
    act(() => {
      lastRecognitionInstance.onresult({
        resultIndex: 0,
        results: [
          Object.assign([{ transcript: 'what programming languages' }], { isFinal: false }),
        ],
      });
    });

    expect(screen.getByText('Recognizing...')).toBeInTheDocument();
    expect(screen.getByText('"what programming languages"')).toBeInTheDocument();

    // Simulate final speech recognition result -> passed into chatbot engine
    act(() => {
      lastRecognitionInstance.onresult({
        resultIndex: 0,
        results: [
          Object.assign(
            [{ transcript: 'What programming languages does Jatin know?' }],
            { isFinal: true }
          ),
        ],
      });
      lastRecognitionInstance.onend();
    });

    // Advance timer for chatbot engine reply
    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(
      screen.getByText('What programming languages does Jatin know?')
    ).toBeInTheDocument();
    expect(screen.getByText(/Programming Languages:/i)).toBeInTheDocument();
  });

  it('handles microphone permission denial and unsupported browsers gracefully while keeping typed chat functional', () => {
    render(<PortfolioChatbot />);
    fireEvent.click(screen.getByLabelText('Open Jatin AI chat'));

    // Start mic and trigger permission denial ('not-allowed')
    fireEvent.click(screen.getByLabelText('Start voice input'));
    act(() => {
      lastRecognitionInstance.onerror({ error: 'not-allowed' });
      lastRecognitionInstance.onend();
    });

    expect(
      screen.getAllByText(/Microphone permission was denied|Microphone access was denied/i).length
    ).toBeGreaterThan(0);

    // Typed chat remains fully functional after permission denial
    const input = screen.getByLabelText('Message Jatin AI');
    fireEvent.change(input, { target: { value: 'Who is Jatin Patil?' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    act(() => {
      vi.advanceTimersByTime(550);
    });
    expect(screen.getAllByText(/Jatin Narayanbhai Patil/i).length).toBeGreaterThan(0);

    // Now test unsupported browser behavior
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    expect(isSpeechRecognitionSupported()).toBe(false);
    expect(createSpeechRecognizer()).toBeNull();
    expect(mapSpeechRecognitionError('not-allowed').isPermissionDenied).toBe(true);
  });

  it('supports speechSynthesis play, pause, resume, stop, speech rate adjustment, voice selection, voice-off option, and cancels previous speech on new response', () => {
    render(<PortfolioChatbot />);
    fireEvent.click(screen.getByLabelText('Open Jatin AI chat'));

    // Verify clear privacy disclosure (never claims voice recognition is offline, no raw audio stored)
    expect(screen.getByText(VOICE_PRIVACY_NOTICE)).toBeInTheDocument();
    expect(VOICE_PRIVACY_NOTICE.toLowerCase()).not.toContain('offline');
    expect(VOICE_PRIVACY_NOTICE.toLowerCase()).toContain('never recorded or stored');

    // Enable voice output ("Turn voice on")
    const voiceTogglePill = screen.getByLabelText('Turn voice on');
    fireEvent.click(voiceTogglePill);
    expect(screen.getByLabelText('Turn voice off')).toBeInTheDocument();

    // Adjust speech rate to 1.5x
    const rateSelect = screen.getByLabelText('Speech rate');
    fireEvent.change(rateSelect, { target: { value: '1.5' } });
    expect(clampSpeechRate(1.5)).toBe(1.5);
    expect(clampSpeechRate(99)).toBe(2);
    expect(clampSpeechRate(0.1)).toBe(0.5);

    // Select a specific voice from available voices
    expect(getAvailableVoices().length).toBe(2);
    const voiceSelect = screen.getByLabelText('Select voice');
    fireEvent.change(voiceSelect, { target: { value: 'Microsoft Aria Online' } });

    // Send a query so bot responds and reads aloud automatically
    const input = screen.getByLabelText('Message Jatin AI');
    fireEvent.change(input, { target: { value: 'Share GitHub link' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect((window as any).speechSynthesis.cancel).toHaveBeenCalled();
    expect((window as any).speechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(spokenUtterances[0].rate).toBe(1.5);
    expect(spokenUtterances[0].voice.name).toBe('Microsoft Aria Online');

    // Pause, Resume, and Stop controls
    const pauseBtn = screen.getByLabelText('Pause voice output');
    fireEvent.click(pauseBtn);
    expect((window as any).speechSynthesis.pause).toHaveBeenCalledTimes(1);

    const resumeBtn = screen.getByLabelText('Resume voice output');
    fireEvent.click(resumeBtn);
    expect((window as any).speechSynthesis.resume).toHaveBeenCalledTimes(1);

    const stopBtn = screen.getByLabelText('Stop voice output');
    fireEvent.click(stopBtn);
    expect((window as any).speechSynthesis.cancel).toHaveBeenCalled();

    // Direct helper tests for speakText, pauseSpeaking, resumeSpeaking, stopSpeaking
    expect(speakText('Testing speech synthesis', { rate: 1.25 })).toBe(true);
    expect(pauseSpeaking()).toBe(true);
    expect(resumeSpeaking()).toBe(true);
    stopSpeaking();

    // Turn Voice Off via the Voice-Off control
    const voiceOffBtn = screen.getByLabelText('Turn voice off');
    fireEvent.click(voiceOffBtn);
    expect(screen.getByLabelText('Turn voice on')).toBeInTheDocument();
  });
});

describe('Recruiter Mode (RecruiterMode.jsx) & Verified Candidate Briefs', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('includes all 15 required question categories, 7 quick actions, and 4 recruiter overview requests mapped to the custom response engine', () => {
    expect(RECRUITER_QUESTION_CATEGORIES).toHaveLength(15);
    const expectedCategoryLabels = [
      'Candidate introduction',
      'Education',
      'Technical skills',
      'Programming languages',
      'Data Science knowledge',
      'AI and Machine Learning interests',
      'Web development skills',
      'Cybersecurity learning',
      'Projects and technologies used',
      'Certifications',
      'Google Student Ambassador activities',
      'Achievements',
      'GitHub repositories',
      'LinkedIn profile',
      'Contact information',
    ];
    expect(RECRUITER_QUESTION_CATEGORIES.map((c) => c.label)).toEqual(expectedCategoryLabels);

    // Every single one of the 15 categories must resolve with high confidence via the custom engine
    for (const cat of RECRUITER_QUESTION_CATEGORIES) {
      const res = matchChatbotResponse(cat.query, chatbotKnowledge, null, {
        recruiterMode: true,
      });
      expect(res.intent, `Category "${cat.label}" fell back`).not.toBe('fallback');
      expect(res.confidenceLevel).toBe('high');
      expect(res.reply.length).toBeGreaterThan(25);
    }

    expect(RECRUITER_QUICK_ACTIONS).toHaveLength(7);
    const expectedQuickActionLabels = [
      'Generate professional candidate summary',
      'Show technical skills',
      'Explore projects',
      'View achievements',
      'View GitHub',
      'View LinkedIn',
      'Contact candidate',
    ];
    expect(RECRUITER_QUICK_ACTIONS.map((a) => a.label)).toEqual(expectedQuickActionLabels);

    for (const action of RECRUITER_QUICK_ACTIONS) {
      const res = matchChatbotResponse(action.query, chatbotKnowledge, null, {
        recruiterMode: true,
      });
      expect(res.intent, `Quick action "${action.label}" fell back`).not.toBe('fallback');
      expect(res.confidenceLevel).toBe('high');
    }

    expect(RECRUITER_OVERVIEW_REQUESTS).toHaveLength(4);
    const expectedOverviews = [
      'Technical profile overview',
      'Project portfolio summary',
      'Skills grouped by category',
      'Certifications and achievements summary',
    ];
    expect(RECRUITER_OVERVIEW_REQUESTS.map((o) => o.label)).toEqual(expectedOverviews);

    for (const ov of RECRUITER_OVERVIEW_REQUESTS) {
      const res = matchChatbotResponse(ov.query, chatbotKnowledge, null, {
        recruiterMode: true,
      });
      expect(res.intent, `Overview "${ov.label}" fell back`).not.toBe('fallback');
      expect(res.confidenceLevel).toBe('high');
    }
  });

  it('never claims corporate employment, industry experience, or unverified years of experience', () => {
    const summaryCard = buildCandidateSummaryCard(chatbotKnowledge);
    expect(summaryCard.fullName).toBe('Jatin Narayanbhai Patil');
    expect(summaryCard.academicStatus).toContain('B.E. Computer Engineering');
    expect(summaryCard.experienceDisclosure).toContain(
      'no formal corporate employment or commercial industry experience is claimed'
    );

    const yearsRes = matchChatbotResponse(
      'How many years of industry experience does Jatin have?',
      chatbotKnowledge,
      null,
      { recruiterMode: true }
    );
    expect(yearsRes.intent).toBe('experience');
    expect(yearsRes.reply).toContain(
      'does not claim formal corporate employment, commercial industry work experience, or unverified years of professional experience'
    );

    const overviewRes = matchChatbotResponse(
      'Generate professional candidate summary',
      chatbotKnowledge,
      null,
      { recruiterMode: true }
    );
    expect(overviewRes.intent).toBe('recruiter_info');
    expect(overviewRes.candidateSummary).toBeDefined();
    expect(overviewRes.reply).toContain('no formal corporate employment');
  });

  it('renders RecruiterMode.jsx candidate summary card, quick actions, and question categories when toggled on', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    render(<PortfolioChatbot />);
    fireEvent.click(screen.getByLabelText('Open Jatin AI chat'));

    // Toggle Recruiter Mode ON
    fireEvent.click(screen.getByLabelText('Toggle Recruiter Mode'));

    expect(screen.getByLabelText('Recruiter Mode Panel')).toBeInTheDocument();
    expect(screen.getByLabelText('Verified Candidate Summary Card')).toBeInTheDocument();
    expect(screen.getByLabelText('Recruiter quick actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Recruiter question categories')).toBeInTheDocument();

    // Click "Generate professional candidate summary" quick action
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Generate professional candidate summary' })[0]
    );

    act(() => {
      vi.advanceTimersByTime(550);
    });

    expect(
      screen.getByText(/Recruiter & Technical Profile Overview/i)
    ).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
