/**
 * Simple in-memory cache service
 * Can be replaced with Redis in production
 */
class CacheService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set a value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to store
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set(key, value, ttl = null) {
    const item = {
      value,
      expiry: ttl ? Date.now() + ttl * 1000 : null
    };
    this.cache.set(key, item);
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any} - Cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }
}

module.exports = new CacheService();