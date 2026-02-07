/**
 * File-based nonce persistence.
 * Nonces must be strictly monotonically increasing per agent.
 */

const fs = require('fs');

class NonceManager {
  /**
   * @param {string} filePath - Path to nonce file
   */
  constructor(filePath = '.predictme-nonce') {
    this.filePath = filePath;
    this._value = null;
  }

  /** Load current nonce from file. Returns Date.now() if no file. */
  load() {
    if (this._value != null) return this._value;
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8').trim();
      this._value = parseInt(raw, 10) || Date.now();
    } catch {
      this._value = Date.now();
    }
    return this._value;
  }

  /** Get next nonce (current + 1), save to file. */
  next() {
    const current = this.load();
    this._value = current + 1;
    this._save();
    return this._value;
  }

  /** Force-set nonce (for recovery from INVALID_NONCE). */
  set(value) {
    this._value = value;
    this._save();
  }

  /** @private */
  _save() {
    try {
      fs.writeFileSync(this.filePath, String(this._value));
    } catch {
      // Best-effort persistence
    }
  }
}

module.exports = { NonceManager };
