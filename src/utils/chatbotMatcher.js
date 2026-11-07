import defaultKnowledge from '../data/chatbotKnowledge';

const EXACT_FALLBACK_MESSAGE =
  "I'm not sure about that yet! You can ask me about Jatin's skills, projects, education, certifications or achievements.";

/**
 * Normalizes user input for case-insensitive, punctuation-tolerant matching
 * while preserving tech tokens like c++, c#, node.js, and ai/ml.
 *
 * @param {string} rawInput
 * @returns {{ normalized: string, tokens: string[] }}
 */
export function normalizeQuery(rawInput) {
  if (typeof rawInput !== 'string') {
    return { normalized: '', tokens: [] };
  }

  const normalized = rawInput
    .toLowerCase()
    .trim()
    .replace(/['’`]/g, '')
    .replace(/\bwhats\b/g, 'what is')
    .replace(/\bwhos\b/g, 'who is')
    .replace(/\bhows\b/g, 'how is')
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = normalized
    ? normalized.split(' ').map((t) => t.replace(/^[./-]+|[./-]+$/g, '')).filter(Boolean)
    : [];

  return { normalized, tokens };
}

/**
 * Checks whether a normalized query contains a phrase or whole-token keyword.
 */
function hasTerm(normalized, tokenSet, term) {
  if (!term) return false;
  const cleanTerm = term.toLowerCase().trim();
  if (cleanTerm.includes(' ')) {
    // Multi-word phrase boundary check
    const paddedQuery = ` ${normalized} `;
    return paddedQuery.includes(` ${cleanTerm} `);
  }
  return tokenSet.has(cleanTerm);
}

/**
 * Calculates an intent score based on phrase matches (high weight) and keyword matches.
 */
function scoreRule(normalized, tokenSet, phrases = [], keywords = []) {
  let score = 0;

  for (const phrase of phrases) {
    if (hasTerm(normalized, tokenSet, phrase)) {
      score += 6;
    }
  }

  for (const keyword of keywords) {
    if (hasTerm(normalized, tokenSet, keyword)) {
      score += 3;
    }
  }

  return score;
}

/**
 * Formats response builders directly from the editable knowledge base sections.
 */
function buildResponses(kb) {
  const intro = kb.personalIntroduction;
  const eduList = kb.education || [];
  const skills = kb.technicalSkills || {};
  const projectList = kb.projects || [];
  const certList = kb.certifications || [];
  const achievementList = kb.achievements || [];
  const expList = kb.experience || [];
  const contact = kb.contactInfo || {};

  return {
    greeting: () => ({
      intent: 'greeting',
      reply:
        `Hello! 👋 I'm **${kb.config?.botName || 'Jatin AI'}**, Jatin Patil's personal portfolio assistant.\n\n` +
        `How can I help you today? You can ask me about Jatin's **skills**, **projects**, **education**, **certifications**, **achievements**, or **contact links**.`,
      suggestions: [
        'Who is Jatin Patil?',
        "What are Jatin's technical skills?",
        "Show me Jatin's projects",
        'How can I contact Jatin?',
      ],
    }),

    botHelp: () => ({
      intent: 'bot_help',
      reply:
        `I'm **${kb.config?.botName || 'Jatin AI'}** — a fast, offline portfolio assistant built for **${intro.name}**.\n\n` +
        `Here are things you can ask me:\n` +
        `• **Introduction:** Who is Jatin & what are his interests?\n` +
        `• **Skills:** Programming languages, AI/ML & web stack\n` +
        `• **Projects:** Featured AI/ML & Full-Stack work\n` +
        `• **Education:** University, degree, year & semester\n` +
        `• **Certifications & Achievements:** Verified credentials & activities\n` +
        `• **Contact & Links:** GitHub, LinkedIn, Portfolio & Email`,
      suggestions: [
        "What are Jatin's technical skills?",
        "Show me Jatin's projects",
        'What certifications does Jatin have?',
        'How can I contact Jatin?',
      ],
    }),

    about: () => ({
      intent: 'about',
      reply:
        `**${intro.fullName || intro.name}** is a **B.E. Computer Engineering student** (3rd Year, Sem 6) based in **${intro.location}**.\n\n` +
        `${intro.summary}\n\n` +
        `• **Interests:** ${intro.interests.join(', ')}\n` +
        `• **Currently Learning:** ${intro.currentlyLearning.join(', ')}\n` +
        `• **Activities:** ${intro.activities.join(', ')}\n` +
        `• **Portfolio:** ${contact.portfolio}`,
      suggestions: [
        "What are Jatin's technical skills?",
        "Show me Jatin's projects",
        "What are Jatin's achievements?",
        'How can I contact Jatin?',
      ],
    }),

    interestsAndLearning: () => ({
      intent: 'interests_learning',
      reply:
        `Here is what **${intro.name}** is passionate about and currently studying:\n\n` +
        `• **Core Interests:** ${intro.interests.join(', ')}\n` +
        `• **Currently Learning:** ${intro.currentlyLearning.join(', ')}\n` +
        `• **Campus Activity:** ${intro.activities.join(', ')}`,
      suggestions: [
        "What are Jatin's technical skills?",
        'What certifications does Jatin have?',
        "Show me Jatin's projects",
      ],
    }),

    education: () => {
      const lines = eduList.map(
        (item) =>
          `• **${item.degree}** — ${item.institution} (${item.period} | ${item.status})`
      );
      return {
        intent: 'education',
        reply:
          `🎓 **${intro.name}'s Academic Background:**\n\n` +
          lines.join('\n') +
          `\n\nHe is currently in **3rd Year (Sem 6)**, specializing in **Data Science**.`,
        suggestions: [
          'What certifications does Jatin have?',
          "What are Jatin's technical skills?",
          "What are Jatin's achievements?",
        ],
      };
    },

    skills: (matchedSkill) => {
      const prefix = matchedSkill
        ? `Yes! **${matchedSkill}** is part of Jatin's technical toolkit.\n\n`
        : '';

      return {
        intent: 'skills',
        reply:
          `${prefix}💻 **${intro.name}'s Technical Skills:**\n\n` +
          `• **Programming:** ${[...(skills.coreProgramming || []), ...(skills.additionalLanguages || [])].join(', ')}\n` +
          `• **Web Development:** ${(skills.webDevelopment || []).join(', ')}\n` +
          `• **Data Science & AI:** ${(skills.dataScienceAndAI || []).join(', ')}\n` +
          `• **Cybersecurity & Cloud:** ${(skills.cybersecurityAndCloud || []).join(', ')}\n` +
          `• **Tools & Platforms:** ${(skills.toolsAndPlatforms || []).join(', ')}`,
        suggestions: [
          "Show me Jatin's projects",
          'What certifications does Jatin have?',
          'What is Jatin currently learning?',
        ],
      };
    },

    projects: (specificProject) => {
      if (specificProject) {
        const repoLine = specificProject.github
          ? `\n• **GitHub Repo:** ${specificProject.github}`
          : `\n• **More Code on GitHub:** ${contact.github}`;
        const demoLine = specificProject.liveUrl
          ? `\n• **Live Demo:** ${specificProject.liveUrl}`
          : '';

        return {
          intent: 'project_detail',
          reply:
            `🚀 **${specificProject.title}** (${specificProject.category})\n\n` +
            `${specificProject.description}\n\n` +
            `• **Tech Stack:** ${specificProject.tech.join(', ')}` +
            repoLine +
            demoLine,
          suggestions: [
            "Show me Jatin's projects",
            "What are Jatin's technical skills?",
            'Share GitHub link',
          ],
        };
      }

      const projectLines = projectList.map((p) => {
        const linkSuffix = p.github ? ` — ${p.github}` : '';
        return `• **${p.title}** (${p.category}): ${p.description} *[${p.tech.join(', ')}]*${linkSuffix}`;
      });

      return {
        intent: 'projects',
        reply:
          `🚀 **${intro.name}'s Projects:**\n\n` +
          projectLines.join('\n') +
          `\n\nExplore all repositories on **GitHub:** ${contact.github}`,
        suggestions: [
          'Tell me about AI Study Assistant',
          'Tell me about AI Web Clone Builder',
          "What are Jatin's technical skills?",
          'How can I contact Jatin?',
        ],
      };
    },

    certifications: () => {
      const certLines = certList.map(
        (c) => `• **${c.title}** — *${c.issuer}*${c.date ? ` (${c.date})` : ''}`
      );

      return {
        intent: 'certifications',
        reply:
          `📜 **${intro.name}'s Verified Certifications:**\n\n` +
          certLines.join('\n') +
          `\n\nYou can also click any certificate card in the **Certifications** section of this portfolio to view it in full.`,
        suggestions: [
          "What are Jatin's achievements?",
          "What is Jatin's education?",
          "What are Jatin's technical skills?",
        ],
      };
    },

    achievements: () => {
      const achLines = achievementList.map(
        (a) => `• **${a.title}:** ${a.description}`
      );

      return {
        intent: 'achievements',
        reply:
          `🏆 **${intro.name}'s Achievements & Activities:**\n\n` +
          achLines.join('\n'),
        suggestions: [
          "What is Jatin's experience?",
          'What certifications does Jatin have?',
          'How can I contact Jatin?',
        ],
      };
    },

    experience: () => {
      const expLines = expList.map(
        (e) => `• **${e.role}** — *${e.organization}* (${e.period}): ${e.details}`
      );

      return {
        intent: 'experience',
        reply:
          `💼 **${intro.name}'s Experience & Leadership:**\n\n` +
          expLines.join('\n') +
          `\n\n**Availability:** ${contact.availability}`,
        suggestions: [
          "Show me Jatin's projects",
          "What are Jatin's achievements?",
          'How can I contact Jatin?',
        ],
      };
    },

    github: () => ({
      intent: 'github_link',
      reply:
        `🐙 **Jatin's GitHub Profile:**\n${contact.github}\n\n` +
        `Check it out to explore his AI/ML, Data Science, and Full-Stack repositories!`,
      suggestions: [
        "Show me Jatin's projects",
        'Share LinkedIn profile',
        'How can I contact Jatin?',
      ],
    }),

    linkedin: () => ({
      intent: 'linkedin_link',
      reply:
        `💼 **Jatin's LinkedIn Profile:**\n${contact.linkedin}\n\n` +
        `Feel free to connect with Jatin on LinkedIn for networking, internships, or collaborations!`,
      suggestions: [
        'Share GitHub link',
        "What is Jatin's experience?",
        'How can I contact Jatin?',
      ],
    }),

    portfolioLink: () => ({
      intent: 'portfolio_link',
      reply:
        `🌐 **Jatin's Official Portfolio Links:**\n\n` +
        `• **Portfolio Website:** ${contact.portfolio}\n` +
        `• **GitHub:** ${contact.github}\n` +
        `• **LinkedIn:** ${contact.linkedin}`,
      suggestions: [
        "Show me Jatin's projects",
        'How can I contact Jatin?',
      ],
    }),

    contact: () => ({
      intent: 'contact',
      reply:
        `📬 **Connect with ${intro.name}:**\n\n` +
        `• **Email:** mailto:${contact.email}\n` +
        `• **LinkedIn:** ${contact.linkedin}\n` +
        `• **GitHub:** ${contact.github}\n` +
        `• **Portfolio:** ${contact.portfolio}\n` +
        `• **Location:** ${contact.location}`,
      suggestions: [
        'Who is Jatin Patil?',
        "Show me Jatin's projects",
        "What are Jatin's technical skills?",
      ],
    }),

    thanks: () => ({
      intent: 'thanks',
      reply:
        `You're very welcome! 😊 Let me know if you'd like to explore anything else about Jatin's **projects**, **skills**, or **contact details**.`,
      suggestions: [
        "Show me Jatin's projects",
        "What are Jatin's technical skills?",
        'How can I contact Jatin?',
      ],
    }),

    goodbye: () => ({
      intent: 'goodbye',
      reply:
        `Thanks for stopping by Jatin's portfolio! 👋 Have a great day, and feel free to connect via LinkedIn (${contact.linkedin}) or email (mailto:${contact.email}).`,
      suggestions: [
        'How can I contact Jatin?',
        "Show me Jatin's projects",
      ],
    }),

    fallback: () => ({
      intent: 'fallback',
      reply: kb.config?.fallbackMessage || EXACT_FALLBACK_MESSAGE,
      suggestions: [
        "What are Jatin's technical skills?",
        "Show me Jatin's projects",
        "What is Jatin's education?",
        'What certifications does Jatin have?',
        "What are Jatin's achievements?",
      ],
    }),
  };
}

/**
 * Reusable rule-based question matcher for Jatin AI.
 *
 * @param {string} userInput - Raw text entered by the user
 * @param {object} [knowledge=defaultKnowledge] - Knowledge base object
 * @returns {{ intent: string, reply: string, suggestions: string[] }}
 */
export function matchChatbotResponse(userInput, knowledge = defaultKnowledge) {
  try {
    const kb = knowledge || defaultKnowledge;
    const responses = buildResponses(kb);
    const { normalized, tokens } = normalizeQuery(userInput);

    if (!normalized) {
      return responses.fallback();
    }

    const tokenSet = new Set(tokens);

    // 1. Check specific project mentions first for tailored answers
    const projectMatchers = [
      {
        index: 0,
        terms: ['ai study assistant', 'study assistant', 'studymate', 'studymate ai'],
      },
      {
        index: 1,
        terms: ['ai web clone builder', 'web clone builder', 'clone builder', 'ai website builder', 'website builder'],
      },
      { index: 2, terms: ['smart city', 'traffic analyzer', 'traffic flow'] },
      { index: 3, terms: ['sales forecaster', 'quarterly sales', 'sales trends'] },
      { index: 4, terms: ['mern stack dashboard', 'mern dashboard', 'administrative dashboard'] },
      { index: 5, terms: ['portfolio engine', 'this portfolio'] },
    ];

    for (const pm of projectMatchers) {
      if (pm.terms.some((term) => hasTerm(normalized, tokenSet, term))) {
        const targetProject = kb.projects?.[pm.index];
        if (targetProject) {
          return responses.projects(targetProject);
        }
      }
    }

    // 2. Check specific skill recognition (e.g., "Does Jatin know Python?")
    const allSkills = [
      ...(kb.technicalSkills?.coreProgramming || []),
      ...(kb.technicalSkills?.additionalLanguages || []),
      ...(kb.technicalSkills?.webDevelopment || []),
      ...(kb.technicalSkills?.dataScienceAndAI || []),
      ...(kb.technicalSkills?.toolsAndPlatforms || []),
    ];
    const matchedSpecificSkill = allSkills.find((skill) => {
      const cleanSkill = skill.toLowerCase();
      if (cleanSkill === 'c') return tokenSet.has('c');
      return hasTerm(normalized, tokenSet, cleanSkill);
    });

    // 3. Exact short name queries (e.g., user just types "Jatin" or "Jatin Patil")
    if (
      normalized === 'jatin' ||
      normalized === 'jatin patil' ||
      normalized === 'jatin narayanbhai patil'
    ) {
      return responses.about();
    }

    // 4. Score all rule-based intents
    const rules = [
      {
        id: 'github',
        phrases: ['github link', 'github profile', 'github url', 'git repo', 'source code'],
        keywords: ['github', 'repos', 'repositories'],
        respond: () => responses.github(),
      },
      {
        id: 'linkedin',
        phrases: ['linkedin link', 'linkedin profile', 'linkedin url', 'linked in'],
        keywords: ['linkedin'],
        respond: () => responses.linkedin(),
      },
      {
        id: 'skills',
        phrases: [
          'technical skills',
          'tech stack',
          'programming languages',
          'what does jatin know',
          'what languages',
          'web development',
          'data science',
          'machine learning',
          'artificial intelligence',
          'full stack',
        ],
        keywords: [
          'skill',
          'skills',
          'stack',
          'tech',
          'technologies',
          'technology',
          'programming',
          'languages',
          'language',
          'coding',
          'frameworks',
          'framework',
          'tools',
          'frontend',
          'backend',
          'fullstack',
          'nodejs',
          'reactjs',
          'ai',
          'ml',
          'ai/ml',
        ],
        respond: () => responses.skills(matchedSpecificSkill),
      },
      {
        id: 'projects',
        phrases: [
          'show me jatins projects',
          'jatins projects',
          'portfolio projects',
          'featured work',
          'featured projects',
          'what has jatin built',
          'what did jatin build',
          'projects list',
        ],
        keywords: [
          'project',
          'projects',
          'built',
          'created',
          'developed',
          'applications',
          'apps',
          'showcase',
        ],
        respond: () => responses.projects(null),
      },
      {
        id: 'portfolioLink',
        phrases: [
          'portfolio link',
          'portfolio url',
          'portfolio website',
          'website link',
          'website url',
          'live link',
          'vercel link',
          'share links',
          'all links',
        ],
        keywords: ['vercel', 'portfolio', 'website', 'links'],
        respond: () => responses.portfolioLink(),
      },
      {
        id: 'contact',
        phrases: [
          'contact jatin',
          'how can i contact',
          'how to contact',
          'get in touch',
          'reach out',
          'reach jatin',
          'email address',
          'social media',
          'social links',
          'where is jatin from',
          'where does jatin live',
        ],
        keywords: [
          'contact',
          'contacts',
          'email',
          'mail',
          'gmail',
          'connect',
          'reach',
          'socials',
          'location',
          'gujarat',
        ],
        respond: () => responses.contact(),
      },
      {
        id: 'education',
        phrases: [
          'jatins education',
          'educational background',
          'academic journey',
          'academic background',
          'where does jatin study',
          'which university',
          'which college',
          'computer engineering',
          'upl university',
          'narmada vidhyalay',
          '3rd year',
          'third year',
          'sem 6',
          'semester 6',
        ],
        keywords: [
          'education',
          'educational',
          'academic',
          'academics',
          'college',
          'university',
          'school',
          'degree',
          'be',
          'btech',
          'upl',
          'gnfc',
          'semester',
          'sem',
          '10th',
          '12th',
          'percentile',
          'qualifications',
          'qualification',
          'study',
          'studying',
        ],
        respond: () => responses.education(),
      },
      {
        id: 'certifications',
        phrases: [
          'what certifications',
          'jatins certifications',
          'professional credentials',
          'completed courses',
          'microsoft learn',
          'azure cognitive',
          'ai readiness',
          'ai skills house',
        ],
        keywords: [
          'certification',
          'certifications',
          'certificate',
          'certificates',
          'cert',
          'certs',
          'credentials',
          'credential',
          'courses',
          'course',
          'bootcamp',
          'bootcamps',
          'codewithharry',
          'letsupgrade',
          'azure',
          'coursera',
          'iict',
        ],
        respond: () => responses.certifications(),
      },
      {
        id: 'achievements',
        phrases: [
          'jatins achievements',
          'google student ambassador',
          'student ambassador',
          'open source',
          'extra curricular',
          'extracurricular activities',
        ],
        keywords: [
          'achievement',
          'achievements',
          'accomplishment',
          'accomplishments',
          'activity',
          'activities',
          'ambassador',
          'hackathon',
          'hackathons',
          'opensource',
          'workshop',
          'workshops',
          'awards',
          'award',
          'extracurricular',
        ],
        respond: () => responses.achievements(),
      },
      {
        id: 'experience',
        phrases: [
          'work experience',
          'jatins experience',
          'professional experience',
          'open to work',
          'hire jatin',
        ],
        keywords: [
          'experience',
          'experiences',
          'internship',
          'internships',
          'career',
          'job',
          'jobs',
          'hire',
          'hiring',
          'freelance',
          'availability',
          'available',
          'collaborate',
          'collaboration',
          'resume',
          'cv',
        ],
        respond: () => responses.experience(),
      },
      {
        id: 'interestsAndLearning',
        phrases: [
          'currently learning',
          'what is jatin learning',
          'what is he learning',
          'jatins interests',
          'google cloud cybersecurity',
          'passionate about',
        ],
        keywords: ['interest', 'interests', 'learning', 'cybersecurity', 'hobbies', 'passion'],
        respond: () => responses.interestsAndLearning(),
      },
      {
        id: 'about',
        phrases: [
          'who is jatin',
          'about jatin',
          'tell me about jatin',
          'introduce jatin',
          'personal introduction',
          'who is he',
          'tell me about him',
          'full name',
          'jatins bio',
        ],
        keywords: ['introduction', 'introduce', 'bio', 'biography', 'background', 'summary', 'overview'],
        respond: () => responses.about(),
      },
      {
        id: 'botHelp',
        phrases: ['who are you', 'what are you', 'what can you do', 'how can you help', 'jatin ai'],
        keywords: ['help', 'commands', 'assistant', 'chatbot'],
        respond: () => responses.botHelp(),
      },
    ];

    let bestRule = null;
    let bestScore = 0;

    for (const rule of rules) {
      const score = scoreRule(normalized, tokenSet, rule.phrases, rule.keywords);
      if (score > bestScore) {
        bestScore = score;
        bestRule = rule;
      }
    }

    // If user asked about a specific known skill without mentioning the word "skill" (e.g. "Python?" or "Does he know React?")
    if (bestScore === 0 && matchedSpecificSkill) {
      return responses.skills(matchedSpecificSkill);
    }

    if (bestRule && bestScore > 0) {
      return bestRule.respond();
    }

    // 5. Conversational intents (checked after topic rules so "Hi, what are your skills?" answers skills!)
    const greetingScore = scoreRule(
      normalized,
      tokenSet,
      ['good morning', 'good afternoon', 'good evening', 'how are you', 'how are u', 'what is up'],
      ['hello', 'hi', 'hey', 'hiya', 'howdy', 'greetings', 'namaste', 'yo', 'sup']
    );
    if (greetingScore > 0) {
      return responses.greeting();
    }

    const thanksScore = scoreRule(
      normalized,
      tokenSet,
      ['thank you', 'thanks a lot', 'many thanks'],
      ['thanks', 'thx', 'ty', 'appreciate']
    );
    if (thanksScore > 0) {
      return responses.thanks();
    }

    const byeScore = scoreRule(
      normalized,
      tokenSet,
      ['see you', 'good night', 'take care'],
      ['bye', 'goodbye', 'cya']
    );
    if (byeScore > 0) {
      return responses.goodbye();
    }

    // 6. Unrecognized question -> exact required fallback
    return responses.fallback();
  } catch (error) {
    console.error('[Jatin AI] Matcher error:', error);
    return {
      intent: 'fallback',
      reply: EXACT_FALLBACK_MESSAGE,
      suggestions: defaultKnowledge.config?.suggestedQuestions?.slice(0, 4) || [],
    };
  }
}

export default matchChatbotResponse;
