/**
 * Grid selection strategies for PredictMe prediction markets.
 *
 * Each strategy receives a grids array from GET /odds/:asset
 * and returns the selected grid to bet on.
 *
 * Grid shape: { gridIdStr, strikePriceMin, strikePriceMax, odds, impliedProbability, expiryAt }
 */

/**
 * Balanced: grid with implied probability closest to 0.5
 * Good all-around strategy — moderate risk, moderate reward.
 */
function balanced(grids, currentPrice) {
  return grids.reduce((best, g) => {
    const diff = Math.abs(parseFloat(g.impliedProbability) - 0.5);
    const bestDiff = Math.abs(parseFloat(best.impliedProbability) - 0.5);
    return diff < bestDiff ? g : best;
  }, grids[0]);
}

/**
 * Underdog: grid with the highest odds (market thinks unlikely).
 * High payout, high risk.
 */
function underdog(grids, currentPrice) {
  return grids.reduce((best, g) => {
    return parseFloat(g.odds) > parseFloat(best.odds) ? g : best;
  }, grids[0]);
}

/**
 * Favorite: grid containing (or closest to) the current price.
 * Conservative — highest probability of winning, lowest payout.
 */
function favorite(grids, currentPrice) {
  const price = parseFloat(currentPrice);
  return grids.reduce((best, g) => {
    const min = parseFloat(g.strikePriceMin);
    const max = parseFloat(g.strikePriceMax);
    const mid = (min + max) / 2;
    const bestMin = parseFloat(best.strikePriceMin);
    const bestMax = parseFloat(best.strikePriceMax);
    const bestMid = (bestMin + bestMax) / 2;
    return Math.abs(mid - price) < Math.abs(bestMid - price) ? g : best;
  }, grids[0]);
}

/**
 * Value: best expected value (odds × impliedProbability).
 * Finds mispriced grids where the market may be wrong.
 */
function value(grids, currentPrice) {
  return grids.reduce((best, g) => {
    const ev = parseFloat(g.odds) * parseFloat(g.impliedProbability);
    const bestEv = parseFloat(best.odds) * parseFloat(best.impliedProbability);
    return ev > bestEv ? g : best;
  }, grids[0]);
}

/** Strategy registry */
const strategies = { balanced, underdog, favorite, value };

/**
 * Pick a grid using a named strategy.
 * @param {Array} grids - Grids from /odds/:asset
 * @param {string|number} currentPrice - Current price
 * @param {string|Function} strategy - Strategy name or custom function
 * @returns {object} Selected grid
 */
function pickGrid(grids, currentPrice, strategy = 'balanced') {
  if (!grids || grids.length === 0) {
    throw new Error('No grids available');
  }

  if (typeof strategy === 'function') {
    return strategy(grids, currentPrice);
  }

  const fn = strategies[strategy];
  if (!fn) {
    throw new Error(`Unknown strategy: ${strategy}. Available: ${Object.keys(strategies).join(', ')}`);
  }

  return fn(grids, currentPrice);
}

module.exports = { pickGrid, strategies, balanced, underdog, favorite, value };
