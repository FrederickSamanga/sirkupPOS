import { CacheManager } from './cache-manager'

/**
 * Cache decorator for methods
 * Usage: @Cacheable({ ttl: 300, key: 'my-key' })
 */
export function Cacheable(options: {
  ttl?: number
  key?: string | ((args: any[]) => string)
  cache?: CacheManager
} = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cache = options.cache || new CacheManager()

      // Generate cache key
      let cacheKey: string
      if (typeof options.key === 'function') {
        cacheKey = options.key(args)
      } else if (options.key) {
        cacheKey = options.key
      } else {
        // Default key generation
        cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`
      }

      // Try to get from cache
      const cached = await cache.get(cacheKey)
      if (cached !== null) {
        return cached
      }

      // Execute original method
      const result = await originalMethod.apply(this, args)

      // Store in cache
      await cache.set(cacheKey, result, { ttl: options.ttl })

      return result
    }

    return descriptor
  }
}

/**
 * Cache eviction decorator
 * Usage: @CacheEvict({ key: 'my-key' })
 */
export function CacheEvict(options: {
  key?: string | ((args: any[]) => string)
  pattern?: string
  cache?: CacheManager
} = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cache = options.cache || new CacheManager()

      // Execute original method
      const result = await originalMethod.apply(this, args)

      // Evict cache
      if (options.pattern) {
        await cache.deleteByPattern(options.pattern)
      } else {
        let cacheKey: string
        if (typeof options.key === 'function') {
          cacheKey = options.key(args)
        } else if (options.key) {
          cacheKey = options.key
        } else {
          // Default key generation
          cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`
        }
        await cache.delete(cacheKey)
      }

      return result
    }

    return descriptor
  }
}

/**
 * Cache put decorator (always updates cache)
 * Usage: @CachePut({ ttl: 300, key: 'my-key' })
 */
export function CachePut(options: {
  ttl?: number
  key?: string | ((args: any[], result: any) => string)
  cache?: CacheManager
} = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cache = options.cache || new CacheManager()

      // Execute original method
      const result = await originalMethod.apply(this, args)

      // Generate cache key
      let cacheKey: string
      if (typeof options.key === 'function') {
        cacheKey = options.key(args, result)
      } else if (options.key) {
        cacheKey = options.key
      } else {
        // Default key generation
        cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`
      }

      // Update cache
      await cache.set(cacheKey, result, { ttl: options.ttl })

      return result
    }

    return descriptor
  }
}