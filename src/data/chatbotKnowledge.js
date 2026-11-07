/**
 * Local Knowledge Base for "Jatin AI – Personal Portfolio Assistant"
 *
 * Edit any section below to update what Jatin AI knows.
 * Works 100% offline in the browser — no external APIs or backend required.
 */

export const chatbotConfig = {
  botName: 'Jatin AI',
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
// 1. PERSONAL INTRODUCTION (Editable)
// ============================================================================
export const personalIntroduction = {
  name: 'Jatin Patil',
  fullName: 'Jatin Narayanbhai Patil',
  headline: 'B.E. Computer Engineering Student | AI/ML & Full-Stack Developer',
  location: 'Gujarat, India',
  summary:
    'Jatin Patil (Jatin Narayanbhai Patil) is a B.E. Computer Engineering student (3rd Year, Sem 6) at UPL University of Sustainable Technology, passionate about building intelligent web applications where Data Science meets modern Web Development.',
  interests: [
    'Data Science',
    'Artificial Intelligence',
    'Cybersecurity',
    'Web Development',
  ],
  currentlyLearning: [
    'Data Science',
    'Python',
    'Google Cloud Cybersecurity',
  ],
  activities: ['Google Student Ambassador'],
};

// ============================================================================
// 2. EDUCATION (Editable)
// ============================================================================
export const education = [
  {
    degree: 'Bachelor of Engineering (B.E.) in Computer Engineering',
    institution: 'UPL University of Sustainable Technology',
    period: '2023 - Present (3rd Year, Sem 6)',
    status: 'In Progress',
    highlight: 'Specializing in Data Science',
  },
  {
    degree: 'Higher Secondary (12th) – Science Stream',
    institution: 'GNFC Narmada Vidhyalay',
    period: 'Completed',
    status: '62 Percentile',
    highlight: 'Foundation in Sciences',
  },
  {
    degree: 'Secondary (10th) – General Education',
    institution: 'GNFC Narmada Vidhyalay',
    period: 'Completed',
    status: '82.53 Percentile',
    highlight: 'Strong Academic Foundation',
  },
];

// ============================================================================
// 3. TECHNICAL SKILLS (Editable)
// ============================================================================
export const technicalSkills = {
  coreProgramming: ['Python', 'Java', 'JavaScript', 'HTML', 'CSS'],
  additionalLanguages: ['C', 'C++', 'C#', 'TypeScript', 'SQL'],
  webDevelopment: ['HTML5', 'CSS3', 'React', 'Angular', 'Node.js', 'Express', 'Tailwind CSS'],
  dataScienceAndAI: ['NumPy', 'Pandas', 'Scikit-Learn', 'TensorFlow', 'OpenCV', 'Deep Learning', 'Linear Regression', 'Matplotlib'],
  cybersecurityAndCloud: ['Google Cloud Cybersecurity (Currently Learning)', 'Azure Cognitive Services'],
  toolsAndPlatforms: ['Git', 'GitHub', 'VS Code', 'Jupyter', 'Docker', 'Linux', 'Figma'],
};

// ============================================================================
// 4. PROJECTS (Editable)
// ============================================================================
export const projects = [
  {
    title: 'AI Study Assistant (StudyMate AI)',
    category: 'AI/ML',
    featured: true,
    description:
      'Intelligent study platform helping students learn smarter with PDF document Q&A, page-cited AI explanations, structured smart notes, and interactive practice quizzes.',
    tech: ['React', 'TypeScript', 'Node.js', 'Firebase', 'Gemini AI'],
    github: 'https://github.com/jatinpatil45/ai-study-assistant',
    liveUrl: 'https://studymate-ai-nine-tau.vercel.app',
  },
  {
    title: 'AI Web Clone Builder',
    category: 'Full Stack',
    featured: true,
    description:
      'AI-powered SaaS platform that transforms text prompts or images into complete multi-page websites with real-time chat refinement, live previews, and project tracking.',
    tech: ['React', 'Tailwind CSS', 'Firebase', 'Gemini AI'],
    github: 'https://github.com/jatinpatil45/Ai-Web-clone-builder',
    liveUrl: 'https://ai-clone-builder.vercel.app',
  },
  {
    title: 'Smart City Traffic Analyzer',
    category: 'Deep Learning',
    featured: true,
    description:
      'Deep learning model optimizing traffic flow patterns using computer vision and predictive analytics.',
    tech: ['Python', 'TensorFlow', 'OpenCV', 'Deep Learning'],
  },
  {
    title: 'AI-Powered Sales Forecaster',
    category: 'AI/ML',
    featured: false,
    description:
      'Machine learning model using Linear Regression to predict quarterly sales trends with 90%+ accuracy.',
    tech: ['Python', 'Pandas', 'Linear Regression', 'Matplotlib'],
  },
  {
    title: 'MERN Stack Dashboard',
    category: 'Full Stack',
    featured: false,
    description:
      'Sleek administrative dashboard with live data visualization and real-time updates.',
    tech: ['React', 'Node.js', 'MongoDB', 'Chart.js'],
  },
  {
    title: 'Portfolio Engine',
    category: 'Web',
    featured: false,
    description:
      'Interactive animated portfolio showcasing modern web development with cyberpunk aesthetics.',
    tech: ['React', 'Framer Motion', 'Tailwind CSS', 'TypeScript'],
  },
];

// ============================================================================
// 5. CERTIFICATIONS (Editable)
// ============================================================================
export const certifications = [
  {
    title: 'Ultimate Web Development Course 2026 - Build Modern Websites',
    issuer: 'CodeWithHarry',
    date: 'November 7, 2026',
  },
  {
    title: 'Foundation Course on AI Readiness',
    issuer: 'IICT & AI Skills House (Google & YouTube)',
    date: 'September 9, 2026',
  },
  {
    title: 'Use AI as a Creative or Expert Partner',
    issuer: 'Google (via Coursera)',
    date: 'August 28, 2026',
  },
  {
    title: 'The Ultimate Job Ready Data Science Course',
    issuer: 'CodeWithHarry',
    date: 'February 20, 2026',
  },
  {
    title: 'Complete 2025 Python Bootcamp: Learn Python from Scratch',
    issuer: 'CodeWithHarry',
    date: 'January 4, 2026',
  },
  {
    title: 'Build a Computer Vision App with Azure Cognitive Services',
    issuer: 'Microsoft Learn',
    date: 'September 20, 2024',
  },
  {
    title: 'Java Bootcamp',
    issuer: 'LetsUpgrade',
    date: 'February 22, 2026',
  },
  {
    title: 'JavaScript Bootcamp',
    issuer: 'LetsUpgrade',
    date: 'February 22, 2026',
  },
];

// ============================================================================
// 6. ACHIEVEMENTS & ACTIVITIES (Editable)
// ============================================================================
export const achievements = [
  {
    title: 'Google Student Ambassador',
    description: 'Representing Google technologies, student developer initiatives, and community learning activities.',
  },
  {
    title: 'Open Source Contributor',
    description: 'Actively contributing code and collaborating on open-source software projects on GitHub.',
  },
  {
    title: 'National Innovation Hackathon 2026 – Certificate of Participation',
    description:
      'Participated in the National Innovation Hackathon 2026 (July 17–19, 2026) organized by AMIEE & CMAOI Association in collaboration with Heritage Institute of Technology, Kolkata.',
  },
  {
    title: "RIFT '26 – Hackathon (Unstop Freedom Festival) – Certificate of Participation",
    description:
      "Participated in RIFT '26 Hackathon of Unstop Freedom Festival organized by Physics Wallah Institute of Innovation & Unstop.",
  },
  {
    title: 'AI/ML Workshop Participant',
    description: 'Continuous hands-on engagement in artificial intelligence, data science, and cloud workshops.',
  },
];

// ============================================================================
// 7. EXPERIENCE (Editable)
// ============================================================================
export const experience = [
  {
    role: 'Google Student Ambassador',
    organization: 'Campus & Developer Community',
    period: 'Current',
    details:
      'Engaging students with Google developer technologies, cloud learning paths, and tech community initiatives.',
  },
  {
    role: 'AI/ML & Full-Stack Student Developer',
    organization: 'Academic & Independent Portfolio Projects',
    period: '2023 - Present',
    details:
      'Designed and built AI-powered web platforms (StudyMate AI, AI Web Clone Builder), machine learning models (traffic computer vision, sales forecasting), and full-stack MERN applications while pursuing B.E. in Computer Engineering.',
  },
];

// ============================================================================
// 8. CONTACT INFORMATION (Editable)
// ============================================================================
export const contactInfo = {
  email: 'jatinpatil2233@gmail.com',
  portfolio: 'https://jatinpatil45.vercel.app/',
  github: 'https://github.com/jatinpatil45',
  linkedin: 'https://www.linkedin.com/in/jatin-patil-b75146376/',
  location: 'Gujarat, India',
  availability:
    'Open to internships, project collaborations, and opportunities in Data Science, AI/ML, Cybersecurity, and Web Development.',
};

const chatbotKnowledge = {
  config: chatbotConfig,
  personalIntroduction,
  education,
  technicalSkills,
  projects,
  certifications,
  achievements,
  experience,
  contactInfo,
};

export default chatbotKnowledge;
