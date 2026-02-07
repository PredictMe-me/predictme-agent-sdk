/**
 * Configuration loader.
 * Reads from .env file (if exists) and process.env.
 * Zero dependencies — hand-rolled .env parser.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_API_URL = 'https://api.predictme.me/api/v1/agent';

/**
 * Parse a .env file into key-value pairs.
 * @param {string} filePath
 * @returns {object}
 */
function parseEnvFile(filePath) {
  const vars = {};
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      vars[key] = val;
    }
  } catch {
    // .env file doesn't exist — that's fine
  }
  return vars;
}

/**
 * Load configuration from environment + .env file.
 * @param {object} [opts]
 * @param {string} [opts.envPath] - Path to .env file (default: cwd/.env)
 * @returns {{ apiKey: string|undefined, apiUrl: string, noncePath: string }}
 */
function loadConfig(opts = {}) {
  const envPath = opts.envPath || path.join(process.cwd(), '.env');
  const fileVars = parseEnvFile(envPath);

  // process.env takes precedence over .env file
  const merged = { ...fileVars, ...process.env };

  return {
    apiKey: merged.PREDICTME_API_KEY || merged.PREDICTME_AGENT_API_KEY,
    apiUrl: merged.PREDICTME_API_URL || merged.PREDICTME_AGENT_API_URL || DEFAULT_API_URL,
    noncePath: merged.PREDICTME_NONCE_PATH || path.join(process.cwd(), '.predictme-nonce'),
  };
}

module.exports = { loadConfig, DEFAULT_API_URL };
