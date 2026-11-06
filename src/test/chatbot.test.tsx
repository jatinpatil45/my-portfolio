import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PortfolioChatbot from '../components/PortfolioChatbot';
import chatbotKnowledge from '../data/chatbotKnowledge';
import { matchChatbotResponse } from '../utils/chatbotMatcher';

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
