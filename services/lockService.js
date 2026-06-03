const db = require('../config/database');
const logger = require('../utils/logger');

const acquireLock = async (name, owner, ttlMs) => {
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  try {
    // Try insert
    const insertRes = await db.runAsync(
      `INSERT OR IGNORE INTO locks (name, owner, expires_at) VALUES (?, ?, ?)`,
      [name, owner, expiresAt]
    );
    if (insertRes.changes > 0) return true;

    // Try takeover if expired
    const nowIso = new Date().toISOString();
    const updateRes = await db.runAsync(
      `UPDATE locks SET owner = ?, expires_at = ? WHERE name = ? AND (expires_at IS NULL OR expires_at < ?)`,
      [owner, expiresAt, name, nowIso]
    );
    return updateRes.changes > 0;
  } catch (err) {
    logger.error({ err, name, owner }, 'Failed to acquire lock');
    return false;
  }
};

const releaseLock = async (name, owner) => {
  try {
    const res = await db.runAsync(
      `UPDATE locks SET expires_at = ? WHERE name = ? AND owner = ?`,
      [new Date(0).toISOString(), name, owner]
    );
    return res.changes > 0;
  } catch (err) {
    logger.error({ err, name, owner }, 'Failed to release lock');
    return false;
  }
};

const renewLock = async (name, owner, ttlMs) => {
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  try {
    const res = await db.runAsync(
      `UPDATE locks SET expires_at = ? WHERE name = ? AND owner = ?`,
      [expiresAt, name, owner]
    );
    return res.changes > 0;
  } catch (err) {
    logger.error({ err, name, owner }, 'Failed to renew lock');
    return false;
  }
};

module.exports = { acquireLock, releaseLock, renewLock };
