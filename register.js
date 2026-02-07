#!/usr/bin/env node
/**
 * One-time agent registration helper.
 *
 * Usage:
 *   node register.js <email> <agentName> [description] [twitterHandle]
 *
 * Or via environment variables:
 *   EMAIL=you@example.com AGENT_NAME=MyBot node register.js
 */

const { PredictMeAgent } = require('./lib/api');

async function main() {
  const args = process.argv.slice(2);

  const email = args[0] || process.env.EMAIL;
  const agentName = args[1] || process.env.AGENT_NAME;
  const description = args[2] || process.env.DESCRIPTION || '';
  const twitterHandle = args[3] || process.env.TWITTER_HANDLE || '';

  if (!email || !agentName) {
    console.error('Usage: node register.js <email> <agentName> [description] [twitterHandle]');
    console.error('');
    console.error('Or set environment variables:');
    console.error('  EMAIL=you@example.com AGENT_NAME=MyBot node register.js');
    process.exit(1);
  }

  const agent = new PredictMeAgent();

  try {
    console.log(`Registering agent "${agentName}"...`);
    const res = await agent.register({ email, agentName, description, twitterHandle });

    if (res.success && res.data) {
      console.log(`\n  Agent registered!`);
      console.log(`  Agent ID: ${res.data.agentId}`);
      console.log(`\n  Next steps:`);
      console.log(`  1. (Optional) Tweet about your agent for verification`);
      console.log(`  2. Wait for admin approval`);
      console.log(`  3. Poll for API key: predictme status ${res.data.agentId}`);
      console.log(`  4. Save your API key to .env immediately (shown once!)`);
    } else {
      console.error('Registration failed:', res.error || res.message || 'Unknown error');
    }
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

main();
