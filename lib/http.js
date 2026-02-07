/**
 * Zero-dependency HTTPS request helper.
 * Uses Node.js built-in https/http modules.
 */

const https = require('https');
const http = require('http');

/**
 * Make an HTTP/HTTPS request.
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} url - Full URL
 * @param {object|null} body - Request body (will be JSON-serialized)
 * @param {object} headers - Additional headers
 * @returns {Promise<object>} Parsed JSON response
 */
function request(method, url, body = null, headers = {}) {
  const parsed = new URL(url);
  const opts = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };

  if (body) {
    const b = typeof body === 'string' ? body : JSON.stringify(body);
    opts.headers['Content-Length'] = Buffer.byteLength(b);
  }

  const mod = parsed.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = mod.request(opts, (res) => {
      let data = '';
      res.on('data', (ch) => (data += ch));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          if (res.statusCode >= 400) {
            const err = new Error(json.error || `HTTP ${res.statusCode}`);
            err.statusCode = res.statusCode;
            err.body = json;
            reject(err);
          } else {
            resolve(json);
          }
        } catch {
          reject(new Error(data || `HTTP ${res.statusCode}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

module.exports = { request };
