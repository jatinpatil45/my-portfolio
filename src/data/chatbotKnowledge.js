/**
 * Structured & Verified Knowledge Base for "Jatin AI 3.0 – Personal Portfolio Assistant"
 *
 * File: src/data/chatbotKnowledge.js
 *
 * STRICT DATA INTEGRITY RULES:
 * - Contains ONLY verified facts from the portfolio codebase, GitHub links, and explicitly supplied details.
 * - Unverified details (e.g., university CGPA, phone number, formal corporate internships) are explicitly marked `verificationStatus: 'incomplete'`.
 * - Organized into 10 structured categories where every item has:
 *   `id`, `category`, `title`, `description`, `keywords`, `synonyms`, `relatedIds` (`relatedKnowledgeIds`), `source`, `verificationStatus`, and `portfolioLink`.
 */

export const PORTFOLIO_BASE_URL = 'https://jatinpatil45.vercel.app/';

export const PORTFOLIO_LINKS = {
  home: 'https://jatinpatil45.vercel.app/#home',
  about: 'https://jatinpatil45.vercel.app/#about',
  education: 'https://jatinpatil45.vercel.app/#education',
  skills: 'https://jatinpatil45.vercel.app/#skills',
  projects: 'https://jatinpatil45.vercel.app/#projects',
  certifications: 'https://jatinpatil45.vercel.app/#certifications',
  hackathons: 'https://jatinpatil45.vercel.app/#hackathon-certificates',
  contact: 'https://jatinpatil45.vercel.app/#contact',
  portfolio: 'https://jatinpatil45.vercel.app/',
  github: 'https://github.com/jatinpatil45',
  linkedin: 'https://www.linkedin.com/in/jatin-patil-b75146376/',
  email: 'mailto:jatinpatil2233@gmail.com',
};

export const chatbotConfig = {
  botName: 'Jatin AI',
  version: '3.0',
  engineName: 'Jatin AI 3.0',
  headerTitle: 'Jatin AI – Personal Portfolio Assistant',
  statusText: 'Online',
  welcomeMessage:
    "Hi there! 👋 I'm **Jatin AI**, Jatin Patil's personal portfolio assistant.\n\nAsk me anything about Jatin's **skills**, **projects**, **education**, **certifications**, **achievements**, or **contact details**!",
  fallbackMessage:
    "I'm not sure about that yet! You can ask me about Jatin's skills, projects, education, certifications or achievements.",
  suggestedQuestions: [
    'Who is Jatin Patil?',
    "What are Jatin's technical skills?",
    "Show me Jatin's projects",
    "What is Jatin's education?",
    'What certifications does Jatin have?',
    "What are Jatin's achievements?",
    'How can I contact Jatin?',
  ],
};

// ============================================================================
// CATEGORY 1: PERSONAL PROFILE (`personalProfile`)
// ============================================================================
export const personalProfile = [
  {
    id: 'profile:jatin-patil',
    category: 'Personal profile',
    title: 'Jatin Patil (Jatin Narayanbhai Patil)',
    description:
      'Jatin Patil (Jatin Narayanbhai Patil) is a B.E. Computer Engineering student (3rd Year, Sem 6) at UPL University of Sustainable Technology in Gujarat, India. He focuses on building intelligent web applications where Data Science, AI/ML, and modern Full-Stack Web Development meet.',
    keywords: [
      'jatin',
      'patil',
      'jatin patil',
      'jatin narayanbhai patil',
      'bio',
      'profile',
      'introduction',
      'about',
      'who is jatin',
      'student',
      'developer',
    ],
    synonyms: [
      'about jatin',
      'personal introduction',
      'bio of jatin',
      'who is he',
      'full name',
      'overview',
    ],
    relatedIds: [
      'edu:be-computer-engineering',
      'ach:google-student-ambassador',
      'interest:data-science',
      'interest:ai-ml',
      'interest:web-development',
      'contact:portfolio',
    ],
    relatedKnowledgeIds: [
      'edu:be-computer-engineering',
      'ach:google-student-ambassador',
      'interest:data-science',
      'interest:ai-ml',
      'interest:web-development',
      'contact:portfolio',
    ],
    source: 'Verified from Hero.tsx, About.tsx, and index.html metadata',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.about,
  },
  {
    id: 'profile:tagline-roles',
    category: 'Personal profile',
    title: 'Headline & Engineering Focus',
    description:
      'Tagline: "Engineering Intelligent Solutions: Where Data Science Meets Modern Web Development." Aspiring roles highlighted on portfolio: AI/ML Engineer, Full Stack Developer, and Data Scientist.',
    keywords: ['tagline', 'headline', 'role', 'roles', 'focus', 'ai/ml engineer', 'full stack developer', 'data scientist'],
    synonyms: ['what does jatin do', 'specialization', 'domain focus'],
    relatedIds: ['profile:jatin-patil', 'skill:ai-ml-stack', 'skill:web-stack'],
    relatedKnowledgeIds: ['profile:jatin-patil', 'skill:ai-ml-stack', 'skill:web-stack'],
    source: 'Verified from Hero.tsx and About.tsx',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.home,
  },
];

export const personalIntroduction = {
  id: 'profile:jatin-patil',
  name: 'Jatin Patil',
  fullName: 'Jatin Narayanbhai Patil',
  headline: 'B.E. Computer Engineering Student | AI/ML & Full-Stack Developer',
  location: 'Gujarat, India',
  summary:
    'Jatin Patil (Jatin Narayanbhai Patil) is a B.E. Computer Engineering student (3rd Year, Sem 6) at UPL University of Sustainable Technology, passionate about building intelligent web applications where Data Science meets modern Web Development.',
  interests: [
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Cybersecurity',
    'Web Development',
  ],
  currentlyLearning: [
    'Data Science',
    'Python',
    'Google Cloud Cybersecurity',
  ],
  activities: ['Google Student Ambassador'],
  portfolioLink: PORTFOLIO_LINKS.about,
};

// ============================================================================
// CATEGORY 2: EDUCATION (`education`)
// ============================================================================
export const education = [
  {
    id: 'edu:be-computer-engineering',
    category: 'Education',
    title: 'Bachelor of Engineering (B.E.) in Computer Engineering',
    degree: 'Bachelor of Engineering (B.E.) in Computer Engineering',
    institution: 'UPL University of Sustainable Technology',
    period: '2023 - Present (3rd Year, Sem 6)',
    status: 'In Progress',
    highlight: 'Specializing in Data Science',
    description:
      'Pursuing Bachelor of Engineering (B.E.) in Computer Engineering at UPL University of Sustainable Technology (2023 - Present, currently in 3rd Year, Semester 6), specializing in Data Science.',
    keywords: [
      'be',
      'btech',
      'bachelor of engineering',
      'computer engineering',
      'upl',
      'upl university',
      'upl university of sustainable technology',
      '3rd year',
      'sem 6',
      'semester 6',
      'college',
      'university',
      'degree',
    ],
    synonyms: [
      'where does jatin study',
      'which university',
      'which college',
      'current degree',
      'undergraduate education',
    ],
    relatedIds: ['profile:jatin-patil', 'interest:data-science', 'edu:be-cgpa-unverified'],
    relatedKnowledgeIds: ['profile:jatin-patil', 'interest:data-science', 'edu:be-cgpa-unverified'],
    source: 'Verified from Education.tsx and About.tsx',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.education,
  },
  {
    id: 'edu:hsc-12th',
    category: 'Education',
    title: 'Higher Secondary (12th) – Science Stream',
    degree: 'Higher Secondary (12th) – Science Stream',
    institution: 'GNFC Narmada Vidhyalay',
    period: 'Completed',
    status: '62 Percentile',
    highlight: 'Foundation in Sciences',
    description:
      'Completed Higher Secondary (12th) in the Science Stream at GNFC Narmada Vidhyalay with 62 Percentile (Foundation in Sciences).',
    keywords: ['12th', 'hsc', 'higher secondary', 'science stream', 'gnfc', 'narmada vidhyalay', '62 percentile'],
    synonyms: ['high school', '12th standard', '12th marks', '12th percentile'],
    relatedIds: ['edu:be-computer-engineering', 'edu:ssc-10th'],
    relatedKnowledgeIds: ['edu:be-computer-engineering', 'edu:ssc-10th'],
    source: 'Verified from Education.tsx',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.education,
  },
  {
    id: 'edu:ssc-10th',
    category: 'Education',
    title: 'Secondary (10th) – General Education',
    degree: 'Secondary (10th) – General Education',
    institution: 'GNFC Narmada Vidhyalay',
    period: 'Completed',
    status: '82.53 Percentile',
    highlight: 'Strong Academic Foundation',
    description:
      'Completed Secondary (10th) General Education at GNFC Narmada Vidhyalay with 82.53 Percentile (Strong Academic Foundation).',
    keywords: ['10th', 'ssc', 'secondary', 'gnfc', 'narmada vidhyalay', '82.53 percentile'],
    synonyms: ['10th standard', '10th marks', '10th percentile', 'schooling'],
    relatedIds: ['edu:hsc-12th', 'edu:be-computer-engineering'],
    relatedKnowledgeIds: ['edu:hsc-12th', 'edu:be-computer-engineering'],
    source: 'Verified from Education.tsx',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.education,
  },
  {
    id: 'edu:be-cgpa-unverified',
    category: 'Education',
    title: 'University CGPA / SPI Details',
    degree: 'B.E. CGPA / SPI (Not Listed)',
    institution: 'UPL University of Sustainable Technology',
    period: '2023 - Present',
    status: 'Incomplete / Not Publicly Listed',
    highlight: 'Unverified in Portfolio',
    description:
      'Exact university CGPA/SPI marks for the ongoing B.E. in Computer Engineering are not publicly listed on the portfolio and are marked as incomplete.',
    keywords: ['cgpa', 'gpa', 'spi', 'cpi', 'college marks', 'university grades'],
    synonyms: ['engineering gpa', 'semester marks'],
    relatedIds: ['edu:be-computer-engineering'],
    relatedKnowledgeIds: ['edu:be-computer-engineering'],
    source: 'Unverified — not present in Education.tsx',
    verificationStatus: 'incomplete',
    portfolioLink: PORTFOLIO_LINKS.education,
  },
];

// ============================================================================
// CATEGORY 3: PROGRAMMING LANGUAGES (`programmingLanguages`)
// ============================================================================
export const programmingLanguages = [
  {
    id: 'lang:python',
    category: 'Programming languages',
    title: 'Python',
    description:
      'Core programming language used by Jatin for Data Science, Machine Learning, and Deep Learning. Verified by projects (Smart City Traffic Analyzer, AI-Powered Sales Forecaster) and certifications (Complete 2025 Python Bootcamp, Ultimate Job Ready Data Science Course).',
    keywords: ['python', 'py', 'python3', 'scripting', 'data science language'],
    synonyms: ['python programming', 'python developer'],
    relatedIds: [
      'proj:smart-city-traffic-analyzer',
      'proj:ai-sales-forecaster',
      'cert:python-bootcamp-2025',
      'cert:data-science-cwh',
      'skill:data-science-ai',
    ],
    relatedKnowledgeIds: [
      'proj:smart-city-traffic-analyzer',
      'proj:ai-sales-forecaster',
      'cert:python-bootcamp-2025',
      'cert:data-science-cwh',
      'skill:data-science-ai',
    ],
    source: 'Verified across Skills.tsx, Projects.tsx, Certifications.tsx, and supplied profile',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
  {
    id: 'lang:javascript',
    category: 'Programming languages',
    title: 'JavaScript (ES6+)',
    description:
      'Core language for full-stack web development and interactive frontend engineering. Verified by React/Node.js projects and the LetsUpgrade JavaScript Bootcamp certificate.',
    keywords: ['javascript', 'js', 'es6', 'ecmascript', 'vanilla js'],
    synonyms: ['javascript programming', 'js language'],
    relatedIds: [
      'proj:studymate-ai',
      'proj:ai-web-clone-builder',
      'proj:mern-stack-dashboard',
      'cert:javascript-bootcamp',
      'cert:web-dev-2026',
    ],
    relatedKnowledgeIds: [
      'proj:studymate-ai',
      'proj:ai-web-clone-builder',
      'proj:mern-stack-dashboard',
      'cert:javascript-bootcamp',
      'cert:web-dev-2026',
    ],
    source: 'Verified across Skills.tsx, Projects.tsx, Certifications.tsx, and supplied profile',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
  {
    id: 'lang:java',
    category: 'Programming languages',
    title: 'Java',
    description:
      'Object-oriented programming language in Jatin’s core toolkit. Verified via Skills.tsx, the LetsUpgrade Java Bootcamp certificate (Feb 2026), and supplied profile.',
    keywords: ['java', 'core java', 'oop'],
    synonyms: ['java programming', 'java language'],
    relatedIds: ['cert:java-bootcamp', 'skill:core-programming'],
    relatedKnowledgeIds: ['cert:java-bootcamp', 'skill:core-programming'],
    source: 'Verified in Skills.tsx, Certifications.tsx (LUEJAVAFEB126163), and supplied profile',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
  {
    id: 'lang:html-css',
    category: 'Programming languages',
    title: 'HTML5 & CSS3',
    description:
      'Core markup and styling languages for modern responsive web interfaces. Verified across all web projects, Skills.tsx, and the Ultimate Web Development Course 2026 certificate.',
    keywords: ['html', 'html5', 'css', 'css3', 'markup', 'styling', 'frontend markup'],
    synonyms: ['html and css', 'web markup'],
    relatedIds: ['proj:portfolio-engine', 'proj:ai-web-clone-builder', 'cert:web-dev-2026', 'skill:web-stack'],
    relatedKnowledgeIds: ['proj:portfolio-engine', 'proj:ai-web-clone-builder', 'cert:web-dev-2026', 'skill:web-stack'],
    source: 'Verified across Skills.tsx, Projects.tsx, Certifications.tsx, and supplied profile',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
  {
    id: 'lang:typescript',
    category: 'Programming languages',
    title: 'TypeScript',
    description:
      'Typed superset of JavaScript used in Jatin’s production React applications, verified directly in the Portfolio Engine codebase and AI Study Assistant (StudyMate AI).',
    keywords: ['typescript', 'ts', 'typed javascript'],
    synonyms: ['ts programming'],
    relatedIds: ['proj:studymate-ai', 'proj:portfolio-engine', 'skill:web-stack'],
    relatedKnowledgeIds: ['proj:studymate-ai', 'proj:portfolio-engine', 'skill:web-stack'],
    source: 'Verified in Skills.tsx and Projects.tsx (AI Study Assistant & Portfolio Engine)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
  {
    id: 'lang:additional-c-cpp-csharp-sql',
    category: 'Programming languages',
    title: 'C, C++, C#, and SQL',
    description:
      'Additional programming and database query languages listed in the portfolio Skills section (Skills.tsx). Note: Listed as part of academic/skill arsenal; no standalone C/C++/C#/SQL repository is featured in Projects.tsx.',
    keywords: ['c', 'c++', 'cpp', 'c#', 'csharp', 'sql', 'database query'],
    synonyms: ['c programming', 'c plus plus', 'c sharp'],
    relatedIds: ['skill:core-programming', 'edu:be-computer-engineering'],
    relatedKnowledgeIds: ['skill:core-programming', 'edu:be-computer-engineering'],
    source: 'Listed in Skills.tsx logos; project-level proficiency verification is partial',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
];

// ============================================================================
// CATEGORY 4: TECHNICAL SKILLS (`technicalSkills` & `technicalSkillItems`)
// ============================================================================
export const technicalSkillItems = [
  {
    id: 'skill:core-programming',
    category: 'Technical skills',
    title: 'Core & Additional Programming Languages',
    description:
      'Core programming experience in Python, Java, JavaScript, HTML, and CSS, along with TypeScript, C, C++, C#, and SQL displayed in the portfolio Tech Arsenal.',
    keywords: ['programming', 'languages', 'coding', 'python', 'java', 'javascript', 'html', 'css', 'typescript', 'c', 'c++', 'c#', 'sql'],
    synonyms: ['what languages does jatin know', 'coding languages', 'programming skills'],
    relatedIds: ['lang:python', 'lang:javascript', 'lang:java', 'lang:html-css', 'lang:typescript'],
    relatedKnowledgeIds: ['lang:python', 'lang:javascript', 'lang:java', 'lang:html-css', 'lang:typescript'],
    source: 'Verified from Skills.tsx and supplied profile',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
  {
    id: 'skill:web-stack',
    category: 'Technical skills',
    title: 'Full-Stack Web Development',
    description:
      'Frontend and backend web development using React, Node.js, Express, Tailwind CSS, HTML5, CSS3, Framer Motion, Firebase, MongoDB, and Angular (listed in Skills.tsx).',
    keywords: ['react', 'reactjs', 'node.js', 'nodejs', 'express', 'tailwind', 'tailwind css', 'angular', 'html5', 'css3', 'firebase', 'mongodb', 'framer motion', 'web development', 'full stack', 'frontend', 'backend', 'mern'],
    synonyms: ['web stack', 'web technologies', 'frontend skills', 'backend skills', 'fullstack skills'],
    relatedIds: [
      'proj:studymate-ai',
      'proj:ai-web-clone-builder',
      'proj:mern-stack-dashboard',
      'proj:portfolio-engine',
      'cert:web-dev-2026',
    ],
    relatedKnowledgeIds: [
      'proj:studymate-ai',
      'proj:ai-web-clone-builder',
      'proj:mern-stack-dashboard',
      'proj:portfolio-engine',
      'cert:web-dev-2026',
    ],
    source: 'Verified from Skills.tsx and Projects.tsx',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
  {
    id: 'skill:data-science-ai',
    category: 'Technical skills',
    title: 'Data Science, AI & Machine Learning',
    description:
      'Data analysis, computer vision, and machine learning using Python, NumPy, Pandas, Scikit-Learn, TensorFlow, OpenCV, Deep Learning, Linear Regression, Matplotlib, and Azure Cognitive Services.',
    keywords: ['numpy', 'pandas', 'scikit-learn', 'sklearn', 'tensorflow', 'opencv', 'deep learning', 'linear regression', 'matplotlib', 'data science', 'machine learning', 'ai', 'ml', 'ai/ml', 'computer vision'],
    synonyms: ['ai skills', 'ml skills', 'data science stack', 'machine learning tools'],
    relatedIds: [
      'proj:smart-city-traffic-analyzer',
      'proj:ai-sales-forecaster',
      'proj:studymate-ai',
      'cert:data-science-cwh',
      'cert:azure-vision',
      'cert:ai-readiness',
    ],
    relatedKnowledgeIds: [
      'proj:smart-city-traffic-analyzer',
      'proj:ai-sales-forecaster',
      'proj:studymate-ai',
      'cert:data-science-cwh',
      'cert:azure-vision',
      'cert:ai-readiness',
    ],
    source: 'Verified from Skills.tsx, Projects.tsx, and Certifications.tsx',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
  {
    id: 'skill:tools-platforms',
    category: 'Technical skills',
    title: 'Developer Tools, Cloud & Platforms',
    description:
      'Proficient with Git, GitHub, VS Code, Jupyter, Docker, Linux, Figma, Vercel deployment, Azure Cognitive Services, and currently learning Google Cloud Cybersecurity.',
    keywords: ['git', 'github', 'vs code', 'vscode', 'jupyter', 'docker', 'linux', 'figma', 'vercel', 'azure', 'google cloud', 'tools', 'platforms', 'devops'],
    synonyms: ['developer tools', 'software tools', 'cloud platforms'],
    relatedIds: ['ach:opensource', 'cert:azure-vision', 'interest:cybersecurity'],
    relatedKnowledgeIds: ['ach:opensource', 'cert:azure-vision', 'interest:cybersecurity'],
    source: 'Verified from Skills.tsx and Certifications.tsx',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
];

export const technicalSkills = {
  coreProgramming: ['Python', 'Java', 'JavaScript', 'HTML', 'CSS'],
  additionalLanguages: ['C', 'C++', 'C#', 'TypeScript', 'SQL'],
  webDevelopment: ['HTML5', 'CSS3', 'React', 'Angular', 'Node.js', 'Express', 'Tailwind CSS'],
  dataScienceAndAI: [
    'NumPy',
    'Pandas',
    'Scikit-Learn',
    'TensorFlow',
    'OpenCV',
    'Deep Learning',
    'Linear Regression',
    'Matplotlib',
  ],
  cybersecurityAndCloud: [
    'Google Cloud Cybersecurity (Currently Learning)',
    'Azure Cognitive Services',
  ],
  toolsAndPlatforms: ['Git', 'GitHub', 'VS Code', 'Jupyter', 'Docker', 'Linux', 'Figma'],
  items: technicalSkillItems,
};

// ============================================================================
// CATEGORY 5: PROJECTS (`projects`) — Strictly Verified from Projects.tsx
// ============================================================================
export const projects = [
  {
    id: 'proj:studymate-ai',
    category: 'AI/ML',
    knowledgeCategory: 'Projects',
    title: 'AI Study Assistant (StudyMate AI)',
    aliases: ['ai study assistant', 'study assistant', 'studymate', 'studymate ai'],
    featured: true,
    description:
      'Intelligent study platform helping students learn smarter with PDF document Q&A, page-cited AI explanations, structured smart notes, and interactive practice quizzes.',
    tech: ['React', 'TypeScript', 'Node.js', 'Firebase', 'Gemini AI'],
    github: 'https://github.com/jatinpatil45/ai-study-assistant',
    liveUrl: 'https://studymate-ai-nine-tau.vercel.app',
    portfolioLink: PORTFOLIO_LINKS.projects,
    keywords: [
      'ai study assistant',
      'studymate',
      'studymate ai',
      'study platform',
      'pdf qa',
      'smart notes',
      'quizzes',
      'react',
      'typescript',
      'node.js',
      'firebase',
    ],
    synonyms: ['study assistant project', 'studymate app', 'pdf study bot'],
    relatedIds: ['lang:typescript', 'lang:javascript', 'skill:web-stack', 'skill:data-science-ai', 'proj:ai-web-clone-builder'],
    relatedKnowledgeIds: ['lang:typescript', 'lang:javascript', 'skill:web-stack', 'skill:data-science-ai', 'proj:ai-web-clone-builder'],
    source: 'Verified from Projects.tsx, GitHub repo, and live Vercel deployment',
    verificationStatus: 'verified',
  },
  {
    id: 'proj:ai-web-clone-builder',
    category: 'Full Stack',
    knowledgeCategory: 'Projects',
    title: 'AI Web Clone Builder',
    aliases: [
      'ai web clone builder',
      'web clone builder',
      'clone builder',
      'ai website builder',
      'website builder',
    ],
    featured: true,
    description:
      'AI-powered SaaS platform that transforms text prompts or images into complete multi-page websites with real-time chat refinement, live previews, and project tracking.',
    tech: ['React', 'Tailwind CSS', 'Firebase', 'Gemini AI'],
    github: 'https://github.com/jatinpatil45/Ai-Web-clone-builder',
    liveUrl: 'https://ai-clone-builder.vercel.app',
    portfolioLink: PORTFOLIO_LINKS.projects,
    keywords: [
      'ai web clone builder',
      'web clone builder',
      'clone builder',
      'saas platform',
      'website generator',
      'react',
      'tailwind css',
      'firebase',
    ],
    synonyms: ['website builder project', 'ai clone builder', 'web generator'],
    relatedIds: ['lang:javascript', 'lang:html-css', 'skill:web-stack', 'proj:studymate-ai'],
    relatedKnowledgeIds: ['lang:javascript', 'lang:html-css', 'skill:web-stack', 'proj:studymate-ai'],
    source: 'Verified from Projects.tsx, GitHub repo, and live Vercel deployment',
    verificationStatus: 'verified',
  },
  {
    id: 'proj:smart-city-traffic-analyzer',
    category: 'Deep Learning',
    knowledgeCategory: 'Projects',
    title: 'Smart City Traffic Analyzer',
    aliases: ['smart city', 'traffic analyzer', 'traffic flow', 'smart city traffic analyzer'],
    featured: true,
    description:
      'Deep learning model optimizing traffic flow patterns using computer vision and predictive analytics.',
    tech: ['Python', 'TensorFlow', 'OpenCV', 'Deep Learning'],
    github: 'https://github.com/jatinpatil45',
    portfolioLink: PORTFOLIO_LINKS.projects,
    keywords: [
      'smart city',
      'traffic analyzer',
      'traffic flow',
      'computer vision',
      'deep learning',
      'python',
      'tensorflow',
      'opencv',
    ],
    synonyms: ['traffic project', 'smart city project', 'cv traffic model'],
    relatedIds: ['lang:python', 'skill:data-science-ai', 'cert:azure-vision', 'proj:ai-sales-forecaster'],
    relatedKnowledgeIds: ['lang:python', 'skill:data-science-ai', 'cert:azure-vision', 'proj:ai-sales-forecaster'],
    source: 'Verified from Projects.tsx',
    verificationStatus: 'verified',
  },
  {
    id: 'proj:ai-sales-forecaster',
    category: 'AI/ML',
    knowledgeCategory: 'Projects',
    title: 'AI-Powered Sales Forecaster',
    aliases: ['sales forecaster', 'quarterly sales', 'sales trends', 'ai powered sales forecaster'],
    featured: false,
    description:
      'Machine learning model using Linear Regression to predict quarterly sales trends with 90%+ accuracy.',
    tech: ['Python', 'Pandas', 'Linear Regression', 'Matplotlib'],
    portfolioLink: PORTFOLIO_LINKS.projects,
    keywords: [
      'sales forecaster',
      'sales prediction',
      'linear regression',
      'quarterly sales',
      'python',
      'pandas',
      'matplotlib',
    ],
    synonyms: ['sales forecasting model', 'ml sales predictor'],
    relatedIds: ['lang:python', 'skill:data-science-ai', 'cert:data-science-cwh', 'proj:smart-city-traffic-analyzer'],
    relatedKnowledgeIds: ['lang:python', 'skill:data-science-ai', 'cert:data-science-cwh', 'proj:smart-city-traffic-analyzer'],
    source: 'Verified from Projects.tsx',
    verificationStatus: 'verified',
  },
  {
    id: 'proj:mern-stack-dashboard',
    category: 'Full Stack',
    knowledgeCategory: 'Projects',
    title: 'MERN Stack Dashboard',
    aliases: ['mern stack dashboard', 'mern dashboard', 'administrative dashboard'],
    featured: false,
    description:
      'Sleek administrative dashboard with live data visualization and real-time updates.',
    tech: ['React', 'Node.js', 'MongoDB', 'Chart.js'],
    portfolioLink: PORTFOLIO_LINKS.projects,
    keywords: ['mern', 'mern stack', 'dashboard', 'react', 'node.js', 'mongodb', 'chart.js', 'data visualization'],
    synonyms: ['admin dashboard', 'mern project'],
    relatedIds: ['lang:javascript', 'skill:web-stack', 'proj:portfolio-engine'],
    relatedKnowledgeIds: ['lang:javascript', 'skill:web-stack', 'proj:portfolio-engine'],
    source: 'Verified from Projects.tsx',
    verificationStatus: 'verified',
  },
  {
    id: 'proj:portfolio-engine',
    category: 'Web',
    knowledgeCategory: 'Projects',
    title: 'Portfolio Engine',
    aliases: ['portfolio engine', 'this portfolio', 'cyberpunk portfolio', 'jatin ai 3.0'],
    featured: false,
    description:
      'Interactive animated portfolio showcasing modern web development with cyberpunk aesthetics and the modular offline Jatin AI 3.0 assistant.',
    tech: ['React', 'Framer Motion', 'Tailwind CSS', 'TypeScript'],
    github: 'https://github.com/jatinpatil45',
    liveUrl: 'https://jatinpatil45.vercel.app/',
    portfolioLink: PORTFOLIO_LINKS.projects,
    keywords: ['portfolio engine', 'portfolio website', 'cyberpunk', 'framer motion', 'tailwind css', 'react', 'typescript', 'jatin ai 3.0'],
    synonyms: ['personal website project', 'this website'],
    relatedIds: ['lang:typescript', 'lang:html-css', 'skill:web-stack', 'contact:portfolio'],
    relatedKnowledgeIds: ['lang:typescript', 'lang:html-css', 'skill:web-stack', 'contact:portfolio'],
    source: 'Verified from Projects.tsx and live deployment',
    verificationStatus: 'verified',
  },
];

// ============================================================================
// CATEGORY 6: CERTIFICATIONS (`certifications`) — Strictly Verified from Certifications.tsx
// ============================================================================
export const certifications = [
  {
    id: 'cert:web-dev-2026',
    category: 'Certifications',
    title: 'Ultimate Web Development Course 2026 - Build Modern Websites',
    issuer: 'CodeWithHarry',
    date: 'November 7, 2026',
    certificateId: 'CWH-THE-ULTIMATE-WEB-DEV-COURSE-FHH3OS1Z',
    skills: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js'],
    description:
      'Verified certificate in modern full-stack website development issued by CodeWithHarry on November 7, 2026 (ID: CWH-THE-ULTIMATE-WEB-DEV-COURSE-FHH3OS1Z).',
    keywords: ['web development course', 'codewithharry', 'modern websites', 'cwh', 'web dev certificate'],
    synonyms: ['ultimate web development certificate', 'codewithharry web dev'],
    relatedIds: ['skill:web-stack', 'lang:javascript', 'lang:html-css', 'proj:ai-web-clone-builder'],
    relatedKnowledgeIds: ['skill:web-stack', 'lang:javascript', 'lang:html-css', 'proj:ai-web-clone-builder'],
    source: 'Verified from Certifications.tsx (/images/cert-web-dev-2026.png)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.certifications,
  },
  {
    id: 'cert:ai-readiness',
    category: 'Certifications',
    title: 'Foundation Course on AI Readiness',
    issuer: 'IICT & AI Skills House (Google & YouTube)',
    date: 'September 9, 2026',
    certificateId: 'IICT-15082662071',
    skills: ['Artificial Intelligence', 'Deep Learning'],
    description:
      'Foundation Course on AI Readiness issued by IICT & AI Skills House (Google & YouTube) on September 9, 2026 (ID: IICT-15082662071).',
    keywords: ['ai readiness', 'iict', 'ai skills house', 'google', 'youtube', 'foundation course'],
    synonyms: ['iict ai certificate', 'ai readiness course'],
    relatedIds: ['skill:data-science-ai', 'interest:ai-ml', 'cert:google-ai-partner'],
    relatedKnowledgeIds: ['skill:data-science-ai', 'interest:ai-ml', 'cert:google-ai-partner'],
    source: 'Verified from Certifications.tsx (/images/cert-iict-ai-readiness.png)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.certifications,
  },
  {
    id: 'cert:google-ai-partner',
    category: 'Certifications',
    title: 'Use AI as a Creative or Expert Partner',
    issuer: 'Google (via Coursera)',
    date: 'August 28, 2026',
    certificateId: 'CV3CNZVQY6KG',
    verificationUrl: 'https://coursera.org/verify/CV3CNZVQY6KG',
    skills: ['Artificial Intelligence'],
    description:
      'Google certification via Coursera ("Use AI as a Creative or Expert Partner"), completed August 28, 2026 (Verify: https://coursera.org/verify/CV3CNZVQY6KG).',
    keywords: ['coursera', 'google ai', 'creative or expert partner', 'cv3cnzvqy6kg'],
    synonyms: ['google coursera certificate', 'ai partner course'],
    relatedIds: ['skill:data-science-ai', 'interest:ai-ml', 'ach:google-student-ambassador'],
    relatedKnowledgeIds: ['skill:data-science-ai', 'interest:ai-ml', 'ach:google-student-ambassador'],
    source: 'Verified from Certifications.tsx (/images/cert-coursera-google-ai.png)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.certifications,
  },
  {
    id: 'cert:data-science-cwh',
    category: 'Certifications',
    title: 'The Ultimate Job Ready Data Science Course',
    issuer: 'CodeWithHarry',
    date: 'February 20, 2026',
    certificateId: 'CWH-THE-ULTIMATE-JOB-READY-DATA-SCIENCE-COURSE-FHHg0SiZ',
    skills: ['Python', 'NumPy', 'Pandas', 'Scikit-Learn', 'Matplotlib'],
    description:
      'Comprehensive Data Science certification issued by CodeWithHarry on February 20, 2026 (ID: CWH-THE-ULTIMATE-JOB-READY-DATA-SCIENCE-COURSE-FHHg0SiZ).',
    keywords: ['data science course', 'job ready data science', 'codewithharry', 'pandas', 'numpy', 'scikit-learn'],
    synonyms: ['data science certificate', 'cwh data science'],
    relatedIds: ['lang:python', 'skill:data-science-ai', 'proj:ai-sales-forecaster', 'interest:data-science'],
    relatedKnowledgeIds: ['lang:python', 'skill:data-science-ai', 'proj:ai-sales-forecaster', 'interest:data-science'],
    source: 'Verified from Certifications.tsx (/images/certificate.png)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.certifications,
  },
  {
    id: 'cert:python-bootcamp-2025',
    category: 'Certifications',
    title: 'Complete 2025 Python Bootcamp: Learn Python from Scratch',
    issuer: 'CodeWithHarry',
    date: 'January 4, 2026',
    certificateId: 'CWH-COMPLETE-PYTHON-BOOTCAMP-LEARN-PYTHON-FROM-SCRATCH-FHH3OS1Z',
    skills: ['Python'],
    description:
      'Complete 2025 Python Bootcamp certification issued by CodeWithHarry on January 4, 2026 (ID: CWH-COMPLETE-PYTHON-BOOTCAMP-LEARN-PYTHON-FROM-SCRATCH-FHH3OS1Z).',
    keywords: ['python bootcamp', 'codewithharry', 'learn python', 'python certificate'],
    synonyms: ['2025 python bootcamp', 'cwh python'],
    relatedIds: ['lang:python', 'skill:core-programming', 'proj:smart-city-traffic-analyzer'],
    relatedKnowledgeIds: ['lang:python', 'skill:core-programming', 'proj:smart-city-traffic-analyzer'],
    source: 'Verified from Certifications.tsx (/images/cert-python-bootcamp.jpg)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.certifications,
  },
  {
    id: 'cert:azure-vision',
    category: 'Certifications',
    title: 'Build a Computer Vision App with Azure Cognitive Services',
    issuer: 'Microsoft Learn',
    date: 'September 20, 2024',
    certificateId: '3Z8ZHH1SOHC7',
    verificationUrl: 'https://coursera.org/verify/3Z8ZHH1SOHC7',
    skills: ['Azure Cognitive Services', 'OpenCV'],
    description:
      'Microsoft Learn certification for building a Computer Vision application with Azure Cognitive Services, issued September 20, 2024 (Verify: https://coursera.org/verify/3Z8ZHH1SOHC7).',
    keywords: ['azure', 'microsoft learn', 'computer vision', 'cognitive services', '3z8zhh1sohc7'],
    synonyms: ['microsoft azure certificate', 'computer vision certificate'],
    relatedIds: ['skill:data-science-ai', 'skill:tools-platforms', 'proj:smart-city-traffic-analyzer'],
    relatedKnowledgeIds: ['skill:data-science-ai', 'skill:tools-platforms', 'proj:smart-city-traffic-analyzer'],
    source: 'Verified from Certifications.tsx (/images/cert-azure-vision.jpg)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.certifications,
  },
  {
    id: 'cert:java-bootcamp',
    category: 'Certifications',
    title: 'Java Bootcamp',
    issuer: 'LetsUpgrade',
    date: 'February 22, 2026',
    certificateId: 'LUEJAVAFEB126163',
    verificationUrl: 'https://www.letsupgrade.in/verify',
    skills: ['Java'],
    description:
      '3-day Java Bootcamp certificate issued by LetsUpgrade on February 22, 2026 (ID: LUEJAVAFEB126163).',
    keywords: ['java bootcamp', 'letsupgrade', 'java certificate', 'luejavafeb126163'],
    synonyms: ['letsupgrade java'],
    relatedIds: ['lang:java', 'skill:core-programming'],
    relatedKnowledgeIds: ['lang:java', 'skill:core-programming'],
    source: 'Verified from Certifications.tsx (/images/cert-java-bootcamp.png)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.certifications,
  },
  {
    id: 'cert:javascript-bootcamp',
    category: 'Certifications',
    title: 'JavaScript Bootcamp',
    issuer: 'LetsUpgrade',
    date: 'February 22, 2026',
    certificateId: 'LUEJSFEB126199',
    verificationUrl: 'https://www.letsupgrade.in/verify',
    skills: ['JavaScript'],
    description:
      '3-day JavaScript Bootcamp certificate issued by LetsUpgrade on February 22, 2026 (ID: LUEJSFEB126199).',
    keywords: ['javascript bootcamp', 'letsupgrade', 'js certificate', 'luejsfeb126199'],
    synonyms: ['letsupgrade javascript'],
    relatedIds: ['lang:javascript', 'skill:web-stack'],
    relatedKnowledgeIds: ['lang:javascript', 'skill:web-stack'],
    source: 'Verified from Certifications.tsx (/images/cert-javascript-bootcamp.png)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.certifications,
  },
];

// ============================================================================
// CATEGORY 7: ACHIEVEMENTS (`achievements`) — Verified from Portfolio & Hackathons
// ============================================================================
export const achievements = [
  {
    id: 'ach:google-student-ambassador',
    category: 'Achievements',
    title: 'Google Student Ambassador',
    activityType: 'Leadership & Developer Community',
    description:
      'Representing Google technologies, student developer initiatives, and community learning activities as a Google Student Ambassador.',
    keywords: ['google student ambassador', 'gsa', 'ambassador', 'google', 'leadership', 'community'],
    synonyms: ['student ambassador', 'campus ambassador', 'google activity'],
    relatedIds: ['exp:gsa', 'cert:google-ai-partner', 'profile:jatin-patil'],
    relatedKnowledgeIds: ['exp:gsa', 'cert:google-ai-partner', 'profile:jatin-patil'],
    source: 'Verified from explicitly provided profile information',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.about,
  },
  {
    id: 'ach:opensource',
    category: 'Achievements',
    title: 'Open Source Contributor',
    activityType: 'Software Development & Collaboration',
    description:
      'Actively contributing code and collaborating on open-source software projects on GitHub.',
    keywords: ['open source', 'opensource', 'contributor', 'github', 'contributions'],
    synonyms: ['open source activity', 'github contributor'],
    relatedIds: ['contact:github', 'skill:tools-platforms', 'proj:studymate-ai', 'proj:ai-web-clone-builder'],
    relatedKnowledgeIds: ['contact:github', 'skill:tools-platforms', 'proj:studymate-ai', 'proj:ai-web-clone-builder'],
    source: 'Verified from Skills.tsx extra-curricular badges and GitHub profile',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
  {
    id: 'ach:national-innovation-hackathon-2026',
    category: 'Achievements',
    title: 'National Innovation Hackathon 2026 – Certificate of Participation',
    activityType: 'Hackathon Participation',
    description:
      'Participated in the National Innovation Hackathon 2026 (July 17–19, 2026) organized by AMIEE & CMAOI Association in collaboration with Heritage Institute of Technology, Kolkata (Certificate ID: AMH202600484-M544).',
    keywords: ['national innovation hackathon', 'hackathon', 'amiee', 'cmaoi', 'heritage institute of technology', 'amh202600484-m544'],
    synonyms: ['national hackathon 2026', 'kolkata hackathon'],
    relatedIds: ['ach:rift-26-hackathon', 'skill:data-science-ai', 'skill:web-stack'],
    relatedKnowledgeIds: ['ach:rift-26-hackathon', 'skill:data-science-ai', 'skill:web-stack'],
    source: 'Verified from src/data/hackathonCertificates.ts (/images/hackathon-national-innovation-2026.jpg)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.hackathons,
  },
  {
    id: 'ach:rift-26-hackathon',
    category: 'Achievements',
    title: "RIFT '26 – Hackathon (Unstop Freedom Festival) – Certificate of Participation",
    activityType: 'Hackathon Participation',
    description:
      "Participated in RIFT '26 Hackathon of Unstop Freedom Festival organized by Physics Wallah Institute of Innovation & Unstop.",
    keywords: ['rift 26', 'rift', 'unstop', 'unstop freedom festival', 'physics wallah', 'hackathon'],
    synonyms: ['rift hackathon', 'unstop hackathon'],
    relatedIds: ['ach:national-innovation-hackathon-2026', 'skill:web-stack'],
    relatedKnowledgeIds: ['ach:national-innovation-hackathon-2026', 'skill:web-stack'],
    source: 'Verified from src/data/hackathonCertificates.ts (/images/hackathon-rift-26.jpg)',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.hackathons,
  },
  {
    id: 'ach:aiml-workshops',
    category: 'Achievements',
    title: 'AI/ML Workshop Participant',
    activityType: 'Continuous Technical Learning',
    description:
      'Continuous hands-on engagement in artificial intelligence, data science, and cloud workshops.',
    keywords: ['workshop', 'workshops', 'ai/ml workshop', 'extra-curricular', 'extracurricular'],
    synonyms: ['ai workshops', 'technical workshops'],
    relatedIds: ['interest:ai-ml', 'interest:data-science', 'cert:ai-readiness'],
    relatedKnowledgeIds: ['interest:ai-ml', 'interest:data-science', 'cert:ai-readiness'],
    source: 'Verified from Skills.tsx extra-curricular section',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
];

// ============================================================================
// CATEGORY 8: EXPERIENCE (`experience`)
// ============================================================================
export const experience = [
  {
    id: 'exp:gsa',
    category: 'Experience',
    title: 'Google Student Ambassador',
    role: 'Google Student Ambassador',
    organization: 'Campus & Developer Community',
    period: 'Current',
    details:
      'Engaging students with Google developer technologies, cloud learning paths, and tech community initiatives.',
    description:
      'Serving as a Google Student Ambassador, engaging students with Google developer technologies, AI/cloud learning paths, and campus tech initiatives.',
    keywords: ['google student ambassador', 'experience', 'leadership', 'community role', 'ambassador'],
    synonyms: ['campus leadership', 'current role'],
    relatedIds: ['ach:google-student-ambassador', 'cert:google-ai-partner', 'interest:cybersecurity'],
    relatedKnowledgeIds: ['ach:google-student-ambassador', 'cert:google-ai-partner', 'interest:cybersecurity'],
    source: 'Verified from explicitly provided profile information',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.about,
  },
  {
    id: 'exp:student-developer',
    category: 'Experience',
    title: 'AI/ML & Full-Stack Student Developer',
    role: 'AI/ML & Full-Stack Student Developer',
    organization: 'Academic & Independent Portfolio Projects',
    period: '2023 - Present',
    details:
      'Designed and built AI-powered web platforms (StudyMate AI, AI Web Clone Builder), machine learning models (traffic computer vision, sales forecasting), and full-stack MERN applications while pursuing B.E. in Computer Engineering.',
    description:
      'Hands-on project engineering experience (2023 - Present) building StudyMate AI, AI Web Clone Builder, Smart City Traffic Analyzer, AI-Powered Sales Forecaster, and MERN Stack applications.',
    keywords: ['experience', 'work', 'developer', 'projects experience', 'hire', 'internship', 'availability', 'open to work'],
    synonyms: ['practical experience', 'development background'],
    relatedIds: ['proj:studymate-ai', 'proj:ai-web-clone-builder', 'proj:smart-city-traffic-analyzer', 'edu:be-computer-engineering'],
    relatedKnowledgeIds: ['proj:studymate-ai', 'proj:ai-web-clone-builder', 'proj:smart-city-traffic-analyzer', 'edu:be-computer-engineering'],
    source: 'Verified from Projects.tsx and About.tsx',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.projects,
  },
];

// ============================================================================
// CATEGORY 9: CONTACT INFORMATION (`contactInformation` & `contactInfo`)
// ============================================================================
export const contactInformation = [
  {
    id: 'contact:email',
    category: 'Contact information',
    title: 'Email Address',
    value: 'jatinpatil2233@gmail.com',
    href: 'mailto:jatinpatil2233@gmail.com',
    description: 'Official email address for reaching Jatin Patil: jatinpatil2233@gmail.com',
    keywords: ['email', 'mail', 'gmail', 'contact', 'reach out', 'jatinpatil2233@gmail.com'],
    synonyms: ['email id', 'send email', 'mail address'],
    relatedIds: ['contact:linkedin', 'contact:github', 'contact:portfolio'],
    relatedKnowledgeIds: ['contact:linkedin', 'contact:github', 'contact:portfolio'],
    source: 'Verified from Hero.tsx and Contact.tsx',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.contact,
  },
  {
    id: 'contact:portfolio',
    category: 'Contact information',
    title: 'Official Portfolio Website',
    value: 'https://jatinpatil45.vercel.app/',
    href: 'https://jatinpatil45.vercel.app/',
    description: 'Live portfolio website deployed on Vercel: https://jatinpatil45.vercel.app/',
    keywords: ['portfolio', 'website', 'vercel', 'live site', 'url', 'link'],
    synonyms: ['portfolio link', 'website url'],
    relatedIds: ['proj:portfolio-engine', 'contact:github', 'contact:linkedin'],
    relatedKnowledgeIds: ['proj:portfolio-engine', 'contact:github', 'contact:linkedin'],
    source: 'Verified from explicitly provided profile information',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.portfolio,
  },
  {
    id: 'contact:github',
    category: 'Contact information',
    title: 'GitHub Profile',
    value: 'https://github.com/jatinpatil45',
    href: 'https://github.com/jatinpatil45',
    description: 'Jatin Patil’s GitHub profile hosting his AI/ML and Full-Stack repositories: https://github.com/jatinpatil45',
    keywords: ['github', 'git', 'repos', 'repositories', 'source code', 'jatinpatil45'],
    synonyms: ['github link', 'github profile', 'github url'],
    relatedIds: ['proj:studymate-ai', 'proj:ai-web-clone-builder', 'ach:opensource'],
    relatedKnowledgeIds: ['proj:studymate-ai', 'proj:ai-web-clone-builder', 'ach:opensource'],
    source: 'Verified from Hero.tsx, Contact.tsx, Projects.tsx, and supplied profile',
    verificationStatus: 'verified',
    portfolioLink: 'https://github.com/jatinpatil45',
  },
  {
    id: 'contact:linkedin',
    category: 'Contact information',
    title: 'LinkedIn Profile',
    value: 'https://www.linkedin.com/in/jatin-patil-b75146376/',
    href: 'https://www.linkedin.com/in/jatin-patil-b75146376/',
    description: 'Jatin Patil’s LinkedIn profile for professional networking and opportunities: https://www.linkedin.com/in/jatin-patil-b75146376/',
    keywords: ['linkedin', 'linked in', 'network', 'social', 'connect'],
    synonyms: ['linkedin link', 'linkedin url', 'linkedin profile'],
    relatedIds: ['contact:email', 'contact:github', 'exp:gsa'],
    relatedKnowledgeIds: ['contact:email', 'contact:github', 'exp:gsa'],
    source: 'Verified from Hero.tsx, Contact.tsx, and supplied profile',
    verificationStatus: 'verified',
    portfolioLink: 'https://www.linkedin.com/in/jatin-patil-b75146376/',
  },
  {
    id: 'contact:location',
    category: 'Contact information',
    title: 'Location',
    value: 'Gujarat, India',
    description: 'Based in Gujarat, India.',
    keywords: ['location', 'where', 'city', 'state', 'country', 'gujarat', 'india'],
    synonyms: ['where does jatin live', 'where is jatin from'],
    relatedIds: ['edu:be-computer-engineering', 'profile:jatin-patil'],
    relatedKnowledgeIds: ['edu:be-computer-engineering', 'profile:jatin-patil'],
    source: 'Verified from Contact.tsx',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.contact,
  },
  {
    id: 'contact:phone-unverified',
    category: 'Contact information',
    title: 'Phone Number (Not Publicly Listed)',
    value: null,
    description:
      'Phone number is not publicly listed in the portfolio for privacy. Please reach out via email (jatinpatil2233@gmail.com) or LinkedIn.',
    keywords: ['phone', 'mobile', 'number', 'call', 'whatsapp'],
    synonyms: ['contact number', 'telephone'],
    relatedIds: ['contact:email', 'contact:linkedin'],
    relatedKnowledgeIds: ['contact:email', 'contact:linkedin'],
    source: 'Unverified — intentionally omitted from public portfolio',
    verificationStatus: 'incomplete',
    portfolioLink: PORTFOLIO_LINKS.contact,
  },
];

export const contactInfo = {
  email: 'jatinpatil2233@gmail.com',
  portfolio: 'https://jatinpatil45.vercel.app/',
  github: 'https://github.com/jatinpatil45',
  linkedin: 'https://www.linkedin.com/in/jatin-patil-b75146376/',
  location: 'Gujarat, India',
  availability:
    'Open to internships, project collaborations, and opportunities in Data Science, AI/ML, Cybersecurity, and Web Development.',
  sectionLinks: PORTFOLIO_LINKS,
};

// ============================================================================
// CATEGORY 10: LEARNING INTERESTS (`learningInterests`)
// ============================================================================
export const learningInterests = [
  {
    id: 'interest:data-science',
    category: 'Learning interests',
    title: 'Data Science & Predictive Analytics',
    description:
      'Specializing in Data Science as part of his B.E. in Computer Engineering, focusing on Python, Pandas, NumPy, Scikit-Learn, and statistical modeling.',
    keywords: ['data science', 'analytics', 'pandas', 'numpy', 'scikit-learn', 'statistics', 'currently learning'],
    synonyms: ['data analytics interest', 'studying data science'],
    relatedIds: ['edu:be-computer-engineering', 'cert:data-science-cwh', 'proj:ai-sales-forecaster', 'lang:python'],
    relatedKnowledgeIds: ['edu:be-computer-engineering', 'cert:data-science-cwh', 'proj:ai-sales-forecaster', 'lang:python'],
    source: 'Verified from Education.tsx, Certifications.tsx, and supplied profile',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
  {
    id: 'interest:ai-ml',
    category: 'Learning interests',
    title: 'Artificial Intelligence & Machine Learning (AI/ML)',
    description:
      'Exploring Deep Learning, Computer Vision (TensorFlow, OpenCV, Azure Cognitive Services), and generative AI application engineering.',
    keywords: ['artificial intelligence', 'machine learning', 'ai', 'ml', 'deep learning', 'computer vision', 'neural networks'],
    synonyms: ['ai interest', 'ml interest', 'intelligent systems'],
    relatedIds: ['proj:studymate-ai', 'proj:smart-city-traffic-analyzer', 'cert:ai-readiness', 'cert:google-ai-partner'],
    relatedKnowledgeIds: ['proj:studymate-ai', 'proj:smart-city-traffic-analyzer', 'cert:ai-readiness', 'cert:google-ai-partner'],
    source: 'Verified from About.tsx, Projects.tsx, and supplied profile',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.projects,
  },
  {
    id: 'interest:web-development',
    category: 'Learning interests',
    title: 'Modern Full-Stack Web Development',
    description:
      'Building responsive, interactive web applications and SaaS tools using React, TypeScript, Node.js, Tailwind CSS, and modern UI animations.',
    keywords: ['web development', 'full stack', 'frontend', 'backend', 'react', 'node.js', 'saas'],
    synonyms: ['web engineering', 'modern web apps'],
    relatedIds: ['proj:ai-web-clone-builder', 'proj:mern-stack-dashboard', 'proj:portfolio-engine', 'cert:web-dev-2026'],
    relatedKnowledgeIds: ['proj:ai-web-clone-builder', 'proj:mern-stack-dashboard', 'proj:portfolio-engine', 'cert:web-dev-2026'],
    source: 'Verified from About.tsx, Projects.tsx, and supplied profile',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.projects,
  },
  {
    id: 'interest:cybersecurity',
    category: 'Learning interests',
    title: 'Google Cloud Cybersecurity',
    description:
      'Currently learning Google Cloud Cybersecurity and cloud security fundamentals alongside AI/ML and Data Science.',
    keywords: ['cybersecurity', 'google cloud cybersecurity', 'security', 'cloud security', 'currently learning'],
    synonyms: ['studying cybersecurity', 'cloud security learning'],
    relatedIds: ['skill:tools-platforms', 'ach:google-student-ambassador'],
    relatedKnowledgeIds: ['skill:tools-platforms', 'ach:google-student-ambassador'],
    source: 'Verified from explicitly supplied profile details',
    verificationStatus: 'verified',
    portfolioLink: PORTFOLIO_LINKS.skills,
  },
];

// ============================================================================
// UNIFIED STRUCTURED CATEGORIES & INDEX
// ============================================================================
export const structuredCategories = {
  personalProfile,
  education,
  programmingLanguages,
  technicalSkills: technicalSkillItems,
  projects,
  certifications,
  achievements,
  experience,
  contactInformation,
  learningInterests,
};

export const allKnowledgeItems = [
  ...personalProfile,
  ...education,
  ...programmingLanguages,
  ...technicalSkillItems,
  ...projects,
  ...certifications,
  ...achievements,
  ...experience,
  ...contactInformation,
  ...learningInterests,
];

const knowledgeMapById = new Map(allKnowledgeItems.map((item) => [item.id, item]));

/**
 * Looks up a knowledge item by its unique ID.
 *
 * @param {string} id
 * @returns {object | null}
 */
export function getKnowledgeItemById(id) {
  return knowledgeMapById.get(id) || null;
}

/**
 * Knowledge Retrieval Function for Jatin AI 3.0
 *
 * Searches across all 10 structured categories using normalized keywords,
 * synonyms, titles, and descriptions, returning the most relevant items,
 * their connected related items, and appropriate portfolio links.
 *
 * @param {string} question
 * @param {{ limit?: number, includeIncomplete?: boolean }} [options]
 * @returns {{
 *   query: string,
 *   matchedItems: object[],
 *   relatedItems: object[],
 *   portfolioLinks: string[],
 *   categoriesMatched: string[],
 *   hasVerifiedMatch: boolean
 * }}
 */
export function retrieveKnowledge(question, options = {}) {
  const limit = options.limit || 5;
  const includeIncomplete = options.includeIncomplete ?? false;

  if (typeof question !== 'string' || !question.trim()) {
    return {
      query: '',
      matchedItems: [],
      relatedItems: [],
      portfolioLinks: [PORTFOLIO_BASE_URL],
      categoriesMatched: [],
      hasVerifiedMatch: false,
    };
  }

  const normalized = question
    .toLowerCase()
    .trim()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = normalized.split(' ').filter(Boolean);
  const tokenSet = new Set(tokens);
  const paddedQuery = ` ${normalized} `;

  const scored = [];

  for (const item of allKnowledgeItems) {
    if (!includeIncomplete && item.verificationStatus === 'incomplete') {
      continue;
    }

    let score = 0;
    const titleLower = (item.title || '').toLowerCase();

    if (titleLower && paddedQuery.includes(` ${titleLower} `)) {
      score += 10;
    }

    for (const syn of item.synonyms || []) {
      const s = syn.toLowerCase().trim();
      if (s && paddedQuery.includes(` ${s} `)) {
        score += 8;
      }
    }

    for (const kw of item.keywords || []) {
      const k = kw.toLowerCase().trim();
      if (!k) continue;
      if (k.includes(' ')) {
        if (paddedQuery.includes(` ${k} `)) score += 6;
      } else if (tokenSet.has(k)) {
        score += 3;
      }
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const matchedItems = scored.slice(0, limit).map((entry) => ({
    ...entry.item,
    score: entry.score,
  }));

  // Resolve related items from `relatedIds`
  const matchedIdSet = new Set(matchedItems.map((m) => m.id));
  const relatedMap = new Map();

  for (const matched of matchedItems) {
    for (const relId of matched.relatedIds || []) {
      if (matchedIdSet.has(relId) || relatedMap.has(relId)) continue;
      const relItem = knowledgeMapById.get(relId);
      if (relItem && (includeIncomplete || relItem.verificationStatus !== 'incomplete')) {
        relatedMap.set(relId, relItem);
      }
    }
  }

  const relatedItems = Array.from(relatedMap.values()).slice(0, 6);

  // Collect relevant portfolio & external links
  const linkSet = new Set();
  for (const item of matchedItems) {
    if (item.liveUrl) linkSet.add(item.liveUrl);
    if (item.github) linkSet.add(item.github);
    if (item.href && item.href.startsWith('http')) linkSet.add(item.href);
    if (item.verificationUrl) linkSet.add(item.verificationUrl);
    if (item.portfolioLink) linkSet.add(item.portfolioLink);
  }
  if (linkSet.size === 0) {
    linkSet.add(PORTFOLIO_BASE_URL);
  }

  const categoriesMatched = Array.from(
    new Set(matchedItems.map((m) => m.knowledgeCategory || m.category))
  );

  return {
    query: question,
    matchedItems,
    relatedItems,
    portfolioLinks: Array.from(linkSet),
    categoriesMatched,
    hasVerifiedMatch: matchedItems.some((m) => m.verificationStatus === 'verified'),
  };
}

const chatbotKnowledge = {
  config: chatbotConfig,
  portfolioLinks: PORTFOLIO_LINKS,
  personalProfile,
  personalIntroduction,
  education,
  programmingLanguages,
  technicalSkills,
  technicalSkillItems,
  projects,
  certifications,
  achievements,
  experience,
  contactInformation,
  contactInfo,
  learningInterests,
  structuredCategories,
  allKnowledgeItems,
  getKnowledgeItemById,
  retrieveKnowledge,
};

export default chatbotKnowledge;
