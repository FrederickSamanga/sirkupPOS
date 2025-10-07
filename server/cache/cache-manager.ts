import { getRedis } from './redis-client'
import pino from 'pino'

export interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
}

export class CacheManager {
  private logger: pino.Logger
  private defaultTTL = 3600 // 1 hour
  private keyPrefix: string

  constructor(prefix: string = 'cafe-app') {
    this.keyPrefix = prefix
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
    })
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string): string {
    return `${this.keyPrefix}:${key}`
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const redis = getRedis()
    if (!redis) return null

    try {
      const fullKey = this.generateKey(key)
      const value = await redis.get(fullKey)

      if (value) {
        this.logger.debug({ key: fullKey }, 'Cache hit')
        return JSON.parse(value) as T
      }

      this.logger.debug({ key: fullKey }, 'Cache miss')
      return null
    } catch (error) {
      this.logger.error({ error, key }, 'Cache get error')
      return null
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    const redis = getRedis()
    if (!redis) return false

    try {
      const fullKey = this.generateKey(key)
      const ttl = options.ttl || this.defaultTTL
      const serialized = JSON.stringify(value)

      if (ttl > 0) {
        await redis.setex(fullKey, ttl, serialized)
      } else {
        await redis.set(fullKey, serialized)
      }

      this.logger.debug({ key: fullKey, ttl }, 'Cache set')
      return true
    } catch (error) {
      this.logger.error({ error, key }, 'Cache set error')
      return false
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const redis = getRedis()
    if (!redis) return false

    try {
      const fullKey = this.generateKey(key)
      const result = await redis.del(fullKey)

      this.logger.debug({ key: fullKey }, 'Cache delete')
      return result > 0
    } catch (error) {
      this.logger.error({ error, key }, 'Cache delete error')
      return false
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    const redis = getRedis()
    if (!redis) return 0

    try {
      const fullPattern = this.generateKey(pattern)
      const keys = await redis.keys(fullPattern)

      if (keys.length === 0) {
        return 0
      }

      const result = await redis.del(...keys)
      this.logger.debug({ pattern: fullPattern, deleted: result }, 'Cache delete by pattern')
      return result
    } catch (error) {
      this.logger.error({ error, pattern }, 'Cache delete by pattern error')
      return 0
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const redis = getRedis()
    if (!redis) return false

    try {
      const fullKey = this.generateKey(key)
      const exists = await redis.exists(fullKey)
      return exists > 0
    } catch (error) {
      this.logger.error({ error, key }, 'Cache exists error')
      return false
    }
  }

  /**
   * Get or set value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // If not in cache, get from factory
    const value = await factory()

    // Store in cache
    await this.set(key, value, options)

    return value
  }

  /**
   * Invalidate all cache entries
   */
  async flush(): Promise<boolean> {
    const redis = getRedis()
    if (!redis) return false

    try {
      const pattern = this.generateKey('*')
      const keys = await redis.keys(pattern)

      if (keys.length === 0) {
        return true
      }

      await redis.del(...keys)
      this.logger.info({ count: keys.length }, 'Cache flushed')
      return true
    } catch (error) {
      this.logger.error({ error }, 'Cache flush error')
      return false
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<any> {
    const redis = getRedis()
    if (!redis) return null

    try {
      const info = await redis.info('stats')
      const pattern = this.generateKey('*')
      const keys = await redis.keys(pattern)

      return {
        keyCount: keys.length,
        info,
      }
    } catch (error) {
      this.logger.error({ error }, 'Failed to get cache stats')
      return null
    }
  }
}

// Cache instances for different domains
export const productCache = new CacheManager('cafe-app:products')
export const orderCache = new CacheManager('cafe-app:orders')
export const userCache = new CacheManager('cafe-app:users')
export const sessionCache = new CacheManager('cafe-app:sessions')