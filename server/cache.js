const { performance } = require('perf_hooks');

class AdvancedCache {
  constructor(maxSize = 1000, defaultTTL = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  set(key, value, ttl) {
    const now = Date.now();
    const entryTTL = ttl || this.defaultTTL;

    // Evict if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data: value,
      timestamp: now,
      ttl: entryTTL,
      hits: 0
    });

    this.stats.sets++;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.data;
  }

  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  clear() {
    this.cache.clear();
    this.resetStats();
  }

  size() {
    return this.cache.size;
  }

  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
    };
  }

  evictLRU() {
    let oldestKey = '';
    let oldestTime = Date.now();
    let leastHits = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.hits < leastHits || (entry.hits === leastHits && entry.timestamp < oldestTime)) {
        oldestKey = key;
        oldestTime = entry.timestamp;
        leastHits = entry.hits;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0
    };
  }
}

// Global cache instances
const apiCache = new AdvancedCache(500, 5 * 60 * 1000); // 5 minutes
const queryCache = new AdvancedCache(1000, 10 * 60 * 1000); // 10 minutes
const staticCache = new AdvancedCache(200, 60 * 60 * 1000); // 1 hour

// Cache middleware for Express
const cacheMiddleware = (ttl = 5 * 60 * 1000) => {
  return (req, res, next) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cached = apiCache.get(key);

    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Wrap res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      apiCache.set(key, data, ttl);
      res.set('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

// Performance tracking
const performanceCache = new AdvancedCache(100, 30 * 60 * 1000);

const trackPerformance = (label) => {
  const start = performance.now();
  return {
    end: () => {
      const duration = performance.now() - start;
      performanceCache.set(`perf:${label}:${Date.now()}`, duration);
      return duration;
    }
  };
};

module.exports = {
  AdvancedCache,
  apiCache,
  queryCache,
  staticCache,
  cacheMiddleware,
  trackPerformance,
  performanceCache
};