/**
 * Text Normalization, Contraction Expansion & Spelling Variation Utilities for Jatin AI 3.0
 *
 * Implements:
 * 1. Lowercase conversion
 * 2. Contraction expansion (both apostrophe and apostrophe-free forms)
 * 3. Unnecessary punctuation removal (preserving technical tokens like c++, c#, node.js, 3.0, ai/ml)
 * 4. Space normalization
 * 5. Common spelling & technical variation normalization
 */

export const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'from',
  'as',
  'into',
  'can',
  'could',
  'would',
  'should',
  'do',
  'does',
  'did',
  'has',
  'have',
  'had',
  'me',
  'my',
  'you',
  'your',
  'he',
  'his',
  'him',
  'it',
  'its',
  'please',
]);

/**
 * Contraction expansion rules applied before stripping punctuation.
 */
export const CONTRACTIONS_MAP = [
  [/\bwhat['’`]?s\b/gi, 'what is'],
  [/\bwho['’`]?s\b/gi, 'who is'],
  [/\bhow['’`]?s\b/gi, 'how is'],
  [/\bwhere['’`]?s\b/gi, 'where is'],
  [/\bwhen['’`]?s\b/gi, 'when is'],
  [/\bwhy['’`]?s\b/gi, 'why is'],
  [/\bhe['’`]?s\b/gi, 'he is'],
  [/\bshe['’`]?s\b/gi, 'she is'],
  [/\bthat['’`]?s\b/gi, 'that is'],
  [/\bthere['’`]?s\b/gi, 'there is'],
  [/\bhere['’`]?s\b/gi, 'here is'],
  [/\bit['’`]s\b/gi, 'it is'],
  [/\blet['’`]?s\b/gi, 'let us'],
  [/\bi['’`]?m\b/gi, 'i am'],
  [/\byou['’`]?re\b/gi, 'you are'],
  [/\bwe['’`]re\b/gi, 'we are'],
  [/\bthey['’`]?re\b/gi, 'they are'],
  [/\bi['’`]?ve\b/gi, 'i have'],
  [/\byou['’`]?ve\b/gi, 'you have'],
  [/\bwe['’`]?ve\b/gi, 'we have'],
  [/\bthey['’`]?ve\b/gi, 'they have'],
  [/\bi['’`]ll\b/gi, 'i will'],
  [/\bhe['’`]ll\b/gi, 'he will'],
  [/\byou['’`]ll\b/gi, 'you will'],
  [/\bi['’`]d\b/gi, 'i would'],
  [/\byou['’`]d\b/gi, 'you would'],
  [/\bcan['’`]?t\b/gi, 'cannot'],
  [/\bwon['’`]?t\b/gi, 'will not'],
  [/\bdon['’`]?t\b/gi, 'do not'],
  [/\bdoesn['’`]?t\b/gi, 'does not'],
  [/\bdidn['’`]?t\b/gi, 'did not'],
  [/\bisn['’`]?t\b/gi, 'is not'],
  [/\baren['’`]?t\b/gi, 'are not'],
  [/\bwasn['’`]?t\b/gi, 'was not'],
  [/\bweren['’`]?t\b/gi, 'were not'],
  [/\bhaven['’`]?t\b/gi, 'have not'],
  [/\bhasn['’`]?t\b/gi, 'has not'],
  [/\bhadn['’`]?t\b/gi, 'had not'],
  [/\bwouldn['’`]?t\b/gi, 'would not'],
  [/\bcouldn['’`]?t\b/gi, 'could not'],
  [/\bshouldn['’`]?t\b/gi, 'should not'],
];

/**
 * Common single-token spelling variations and typo corrections.
 */
export const SPELLING_VARIATIONS = {
  // Skills & programming
  skil: 'skills',
  skils: 'skills',
  sklls: 'skills',
  skillz: 'skills',
  programing: 'programming',
  progaming: 'programming',
  langauge: 'language',
  langauges: 'languages',
  lanuages: 'languages',
  languges: 'languages',
  tecnical: 'technical',
  techincal: 'technical',
  tecnologies: 'technologies',
  technolgies: 'technologies',

  // Languages & frameworks
  pyhton: 'python',
  phyton: 'python',
  pyton: 'python',
  javasript: 'javascript',
  javscript: 'javascript',
  jaavscript: 'javascript',
  jvascript: 'javascript',
  typescipt: 'typescript',
  typscript: 'typescript',
  typesript: 'typescript',
  tenserflow: 'tensorflow',
  tensorfow: 'tensorflow',
  scikitlearn: 'scikit-learn',
  sklearn: 'scikit-learn',
  tailwindcss: 'tailwind',

  // Projects
  proect: 'project',
  proects: 'projects',
  porject: 'project',
  porjects: 'projects',
  projet: 'project',
  projets: 'projects',
  prjcts: 'projects',
  projecs: 'projects',
  studymat: 'studymate',
  studymateai: 'studymate',

  // Education
  eduction: 'education',
  educaton: 'education',
  edcuation: 'education',
  univeristy: 'university',
  univesity: 'university',
  univercity: 'university',
  colege: 'college',
  collge: 'college',
  colg: 'college',
  acadmics: 'academics',
  acadmic: 'academic',

  // Certifications & Achievements
  certifcate: 'certificate',
  certficate: 'certificate',
  certifcates: 'certificates',
  certficates: 'certificates',
  certifcation: 'certification',
  certfication: 'certification',
  certifcations: 'certifications',
  certfications: 'certifications',
  cerifications: 'certifications',
  certifictions: 'certifications',
  acheivement: 'achievement',
  achievment: 'achievement',
  achivement: 'achievement',
  acheivements: 'achievements',
  achievments: 'achievements',
  acheivments: 'achievements',
  achivements: 'achievements',
  hackaton: 'hackathon',
  hackathn: 'hackathon',
  hackatons: 'hackathons',
  ambasador: 'ambassador',
  ambassdor: 'ambassador',
  ambassader: 'ambassador',

  // Experience & Recruiter
  experiance: 'experience',
  expereince: 'experience',
  exprience: 'experience',
  experince: 'experience',
  intership: 'internship',
  interships: 'internships',
  recuiter: 'recruiter',
  recruter: 'recruiter',
  recruters: 'recruiters',

  // Profile, Links & Contact
  introdution: 'introduction',
  intoduction: 'introduction',
  introducion: 'introduction',
  linkdin: 'linkedin',
  linkedn: 'linkedin',
  lnkedin: 'linkedin',
  gihub: 'github',
  gitub: 'github',
  githb: 'github',
  contct: 'contact',
  conatct: 'contact',

  // Comparisons & Recommendations
  comparision: 'comparison',
  comparisions: 'comparisons',
  recomend: 'recommend',
  reccomend: 'recommend',
  recommand: 'recommend',
  recomendation: 'recommendation',
  reccomendation: 'recommendation',
  recomendations: 'recommendations',
  reccomendations: 'recommendations',
};

/**
 * Multi-word phrase normalizations applied on space-normalized text.
 */
export const PHRASE_VARIATIONS = [
  [/\bb\.?\s*e\.?\b/g, 'be'],
  [/\bb\.?\s*tech\.?\b/g, 'btech'],
  [/\bc\s+plus\s+plus\b/g, 'c++'],
  [/\bc\s+sharp\b/g, 'c#'],
  [/\bnode\s+js\b/g, 'node.js'],
  [/\breact\s+js\b/g, 'reactjs'],
  [/\bchart\s+js\b/g, 'chart.js'],
  [/\bopen\s+cv\b/g, 'opencv'],
  [/\bscikit\s+learn\b/g, 'scikit-learn'],
  [/\bcyber\s+security\b/g, 'cybersecurity'],
  [/\bstudy\s+mate\b/g, 'studymate'],
  [/\blinked\s+in\b/g, 'linkedin'],
  [/\bgit\s+hub\b/g, 'github'],
  [/\be\s*-\s*mail\b/g, 'email'],
  [/\bfull\s*-\s*stack\b/g, 'full stack'],
  [/\bopen\s*-\s*source\b/g, 'open source'],
  [/\bsem\s*-\s*(\d+)\b/g, 'sem $1'],
];

/**
 * Expands contractions in a text string.
 *
 * @param {string} text
 * @returns {string}
 */
export function expandContractions(text = '') {
  if (typeof text !== 'string' || !text) return '';
  let result = text;
  for (const [pattern, replacement] of CONTRACTIONS_MAP) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

/**
 * Applies phrase-level and token-level spelling variation normalization.
 *
 * @param {string} text
 * @returns {string}
 */
export function normalizeSpellingVariations(text = '') {
  if (typeof text !== 'string' || !text) return '';
  let result = text;

  for (const [pattern, replacement] of PHRASE_VARIATIONS) {
    result = result.replace(pattern, replacement);
  }

  const words = result.split(' ').filter(Boolean);
  const correctedWords = words.map((word) => {
    const clean = word.replace(/^[./-]+|[./-]+$/g, '');
    return SPELLING_VARIATIONS[clean] || clean;
  });

  return correctedWords.filter(Boolean).join(' ');
}

/**
 * Normalizes user input and extracts cleaned tokens and non-stopword keywords.
 *
 * @param {string} rawInput
 * @returns {{
 *   normalized: string,
 *   tokens: string[],
 *   keywords: string[],
 *   original: string
 * }}
 */
export function normalizeText(rawInput) {
  if (typeof rawInput !== 'string') {
    return { normalized: '', tokens: [], keywords: [], original: '' };
  }

  const original = rawInput;

  // Step 1: Lowercase & trim
  let text = rawInput.toLowerCase().trim();

  // Step 2: Expand contractions before removing apostrophes
  text = expandContractions(text);

  // Step 3: Strip remaining apostrophes (e.g., "jatin's" -> "jatins") and unnecessary punctuation
  text = text
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Step 4: Normalize common spelling and multi-word variations
  const normalized = normalizeSpellingVariations(text)
    .replace(/\s+/g, ' ')
    .trim();

  // Step 5: Extract tokens and filter stop words for keywords
  const tokens = normalized
    ? normalized
        .split(' ')
        .map((t) => t.replace(/^[./-]+|[./-]+$/g, ''))
        .filter(Boolean)
    : [];

  const keywords = tokens.filter((t) => !STOP_WORDS.has(t));

  return { normalized, tokens, keywords, original };
}

/**
 * Alias for backward compatibility with existing utilities and tests.
 */
export const normalizeQuery = normalizeText;

/**
 * Checks whether a normalized query contains a multi-word phrase or single-token keyword.
 * Also supports matching possessive/singular variations (e.g. "jatin" / "jatins").
 *
 * @param {string} normalized
 * @param {Set<string>} tokenSet
 * @param {string} term
 * @returns {boolean}
 */
export function hasTerm(normalized, tokenSet, term) {
  if (!term) return false;
  const cleanTerm = term.toLowerCase().trim();
  if (cleanTerm.includes(' ')) {
    const paddedQuery = ` ${normalized} `;
    if (paddedQuery.includes(` ${cleanTerm} `)) return true;
    // Also support matching when "jatins" vs "jatin" appears in the phrase
    const altTerm = cleanTerm.replace(/\bjatins\b/g, 'jatin');
    const altQuery = normalized.replace(/\bjatins\b/g, 'jatin');
    return ` ${altQuery} `.includes(` ${altTerm} `);
  }
  return tokenSet.has(cleanTerm);
}

export default normalizeText;
