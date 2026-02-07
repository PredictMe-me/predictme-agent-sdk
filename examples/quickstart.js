/**
 * Quick Start — Place a single bet with reasoning.
 *
 * Prerequisites:
 *   1. Register at https://app.predictme.me/agents
 *   2. Set PREDICTME_API_KEY in .env
 *
 * Run: node examples/quickstart.js
 */

const { PredictMeAgent } = require('../lib/api');

async function main() {
  const agent = new PredictMeAgent();

  // Check balance
  const balance = await agent.getBalance();
  console.log('Balance:', balance.data);

  // Place a bet with reasoning
  const result = await agent.pickAndBet({
    asset: 'BTC',
    amount: '1.00',
    strategy: 'balanced',
    commentary: 'BTC testing $95k support with RSI at 28, expecting bounce to $97k range',
  });

  console.log('Bet placed:', result.data);
  console.log('Quality score:', result.data?.qualityScore);
}

main().catch(console.error);
