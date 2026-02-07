/**
 * Continuous Trading — Loop through rounds with error recovery.
 *
 * Run: node examples/continuous-trading.js
 */

const { PredictMeAgent } = require('../lib/api');

const ROUNDS = 10;
const INTERVAL_MS = 11000; // 11s (slightly more than 10s round)

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const agent = new PredictMeAgent();

  console.log(`Starting ${ROUNDS} rounds of BTC trading...\n`);

  for (let i = 0; i < ROUNDS; i++) {
    try {
      const result = await agent.pickAndBet({
        asset: 'BTC',
        amount: '1.00',
        strategy: 'value',
        commentary: 'Round {round}: Value strategy at {price}, scanning for mispriced grids with {odds}x odds',
        templateContext: { round: String(i + 1) },
      });

      const d = result.data || {};
      console.log(`Round ${i + 1}: ${d.orderId} | ${d.odds}x | balance=$${d.newBalance} | quality=${d.qualityScore}`);
    } catch (e) {
      console.error(`Round ${i + 1} failed: ${e.message}`);

      // Back off on rate limit or insufficient balance
      if (e.message.includes('rate') || e.message.includes('balance')) {
        console.log('  Backing off 30s...');
        await sleep(30000);
        continue;
      }
    }

    if (i < ROUNDS - 1) await sleep(INTERVAL_MS);
  }

  const balance = await agent.getBalance();
  console.log('\nFinal balance:', balance.data);
}

main().catch(console.error);
