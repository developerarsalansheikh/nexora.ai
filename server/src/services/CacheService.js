/**
 * CacheService — Redis-ready decoupled in-memory / TTL cache layer.
 * Provides caching for expensive DB queries (analytics, project statistics, user sessions).
 */
class CacheService {
  constructor() {
    this.store = new Map();
  }

  /** Set key in cache with TTL (in seconds). */
  set(key, data, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { data, expiresAt });
  }

  /** Get key from cache if valid. */
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.data;
  }

  /** Delete key from cache. */
  delete(key) {
    this.store.delete(key);
  }

  /** Clear all keys matching a prefix. */
  clearPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }
}

export default new CacheService();
