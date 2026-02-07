/**
 * Commentary validation, templates, and quality scoring.
 */

const MIN_LENGTH = 20;
const MAX_LENGTH = 500;

const TECHNICAL_TERMS = new Set([
  'rsi', 'macd', 'ema', 'sma', 'bollinger', 'fibonacci', 'fib',
  'support', 'resistance', 'breakout', 'breakdown', 'divergence',
  'oversold', 'overbought', 'volume', 'momentum', 'trend',
  'bullish', 'bearish', 'consolidation', 'reversal', 'wedge',
  'channel', 'moving average', 'funding rate', 'open interest',
  'liquidation', 'whale', 'accumulation', 'distribution',
]);

/**
 * Validate commentary meets API requirements.
 * @param {string} commentary
 * @returns {{ valid: boolean, error?: string }}
 */
function validate(commentary) {
  if (!commentary || commentary.trim() === '') {
    return {
      valid: false,
      error: `Commentary is required (min ${MIN_LENGTH} chars).\n\nGood examples:\n  "BTC testing $95k support with RSI at 28, expecting bounce to $97k"\n  "ETH breaking out of consolidation, volume spike confirms momentum"\n\nBad examples (rejected):\n  "bullish" — too short/vague\n  "going up" — no reasoning`,
    };
  }

  const trimmed = commentary.trim();
  if (trimmed.length < MIN_LENGTH) {
    return {
      valid: false,
      error: `Commentary too short (${trimmed.length} chars, min ${MIN_LENGTH}). Add more detail about WHY.`,
    };
  }

  return { valid: true };
}

/**
 * Render commentary template with variable substitution.
 * Variables: {round}, {price}, {asset}, {odds}, {gridLevel}, {strategy}
 * @param {string} template
 * @param {object} context
 * @returns {string}
 */
function renderTemplate(template, context = {}) {
  if (!template) return '';
  return template
    .replace(/\{round\}/g, context.round || '?')
    .replace(/\{price\}/g, context.price || '?')
    .replace(/\{asset\}/g, context.asset || '?')
    .replace(/\{odds\}/g, context.odds || '?')
    .replace(/\{gridLevel\}/g, context.gridLevel || '?')
    .replace(/\{strategy\}/g, context.strategy || '?')
    .substring(0, MAX_LENGTH);
}

/**
 * Calculate local quality score (mirrors server-side algorithm).
 * @param {string} commentary
 * @returns {number} 0–100
 */
function qualityScore(commentary) {
  if (!commentary) return 0;
  const text = commentary.trim();
  let score = 0;

  // Length score (0–50)
  if (text.length >= 200) score += 50;
  else if (text.length >= 100) score += 40;
  else if (text.length >= 60) score += 30;
  else if (text.length >= 40) score += 20;
  else score += 10;

  // Unique words (0–25)
  const words = text.toLowerCase().split(/\s+/);
  const unique = new Set(words).size;
  if (unique >= 25) score += 25;
  else if (unique >= 15) score += 20;
  else if (unique >= 10) score += 10;

  // Technical terms (0–25)
  const lower = text.toLowerCase();
  let termCount = 0;
  for (const term of TECHNICAL_TERMS) {
    if (lower.includes(term)) termCount++;
  }
  if (termCount >= 4) score += 25;
  else if (termCount >= 2) score += 15;
  else if (termCount >= 1) score += 5;

  return Math.min(100, score);
}

/**
 * Badge tier for a quality score.
 * @param {number} score
 * @returns {string|null}
 */
function badgeTier(score) {
  if (score >= 90) return 'Diamond';
  if (score >= 75) return 'Gold';
  if (score >= 60) return 'Silver';
  if (score >= 40) return 'Bronze';
  return null;
}

module.exports = { validate, renderTemplate, qualityScore, badgeTier, MIN_LENGTH, MAX_LENGTH };
