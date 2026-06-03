const lockService = require('../../services/lockService');
const db = require('../../config/database');

describe('lockService', () => {
  const lockName = `test_lock_${Date.now()}`;
  const ownerA = `ownerA_${process.pid}`;
  const ownerB = `ownerB_${process.pid}`;

  test('acquire, cannot acquire when held, takeover after expiry', async () => {
    // acquire by A
    const ttlMs = 2000; // 2s
    const gotA = await lockService.acquireLock(lockName, ownerA, ttlMs);
    expect(gotA).toBe(true);

    // B should not acquire immediately
    const gotB = await lockService.acquireLock(lockName, ownerB, ttlMs);
    expect(gotB).toBe(false);

    // expire lock by updating expires_at to past
    await db.runAsync(`UPDATE locks SET expires_at = ? WHERE name = ?`, [new Date(0).toISOString(), lockName]);

    // Now B should be able to acquire
    const gotBAfter = await lockService.acquireLock(lockName, ownerB, ttlMs);
    expect(gotBAfter).toBe(true);

    // cleanup
    await lockService.releaseLock(lockName, ownerB);
  });
});
