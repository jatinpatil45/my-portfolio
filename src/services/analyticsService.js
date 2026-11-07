/**
 * Local Client-Side Analytics Service for Jatin AI 3.0
 *
 * Tracks chatbot interactions, intent popularity, response confidence,
 * and unanswered fallback queries strictly in localStorage / memory.
 * Zero external tracking or network requests.
 */

const STORAGE_KEY = 'jatin_ai_3_analytics';

function createDefaultMetrics() {
  return {
    version: '3.0',
    totalMessages: 0,
    quickReplyClicks: 0,
    voiceQueries: 0,
    fallbackCount: 0,
    totalConfidenceSum: 0,
    intentCounts: {},
    recentInteractions: [],
  };
}

let memoryStore = createDefaultMetrics();

function loadMetrics() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return memoryStore;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryStore;
    const parsed = JSON.parse(raw);
    return {
      ...createDefaultMetrics(),
      ...parsed,
      intentCounts: { ...(parsed.intentCounts || {}) },
      recentInteractions: Array.isArray(parsed.recentInteractions)
        ? parsed.recentInteractions
        : [],
    };
  } catch {
    return memoryStore;
  }
}

function saveMetrics(metrics) {
  memoryStore = metrics;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
    }
  } catch {
    // Ignore storage quota or privacy mode errors
  }
}

/**
 * Records a user message and its matched bot response.
 *
 * @param {{
 *   query: string,
 *   intent: string,
 *   confidence?: number,
 *   source?: 'text' | 'quick_reply' | 'voice'
 * }} payload
 */
export function trackInteraction(payload = {}) {
  const current = loadMetrics();
  const intent = payload.intent || 'fallback';
  const confidence = typeof payload.confidence === 'number' ? payload.confidence : 0;
  const source = payload.source || 'text';

  const nextIntentCounts = {
    ...current.intentCounts,
    [intent]: (current.intentCounts[intent] || 0) + 1,
  };

  const nextRecent = [
    ...current.recentInteractions.slice(-19),
    {
      query: String(payload.query || '').slice(0, 120),
      intent,
      confidence,
      source,
      timestamp: Date.now(),
    },
  ];

  const updated = {
    ...current,
    totalMessages: current.totalMessages + 1,
    quickReplyClicks:
      source === 'quick_reply' ? current.quickReplyClicks + 1 : current.quickReplyClicks,
    voiceQueries: source === 'voice' ? current.voiceQueries + 1 : current.voiceQueries,
    fallbackCount: intent === 'fallback' ? current.fallbackCount + 1 : current.fallbackCount,
    totalConfidenceSum: Number((current.totalConfidenceSum + confidence).toFixed(4)),
    intentCounts: nextIntentCounts,
    recentInteractions: nextRecent,
  };

  saveMetrics(updated);
  return updated;
}

/**
 * Returns a computed summary of local chatbot analytics.
 */
export function getAnalyticsSummary() {
  const current = loadMetrics();
  const avgConfidence =
    current.totalMessages > 0
      ? Math.round((current.totalConfidenceSum / current.totalMessages) * 100)
      : 100;

  const topIntents = Object.entries(current.intentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([intent, count]) => ({ intent, count }));

  return {
    ...current,
    averageConfidencePercent: avgConfidence,
    topIntents,
  };
}

/**
 * Resets stored analytics metrics.
 */
export function resetAnalytics() {
  const fresh = createDefaultMetrics();
  saveMetrics(fresh);
  return fresh;
}

export default {
  trackInteraction,
  getAnalyticsSummary,
  resetAnalytics,
};
