import Redis from 'ioredis'
import pino from 'pino'

class RedisClient {
  private static instance: RedisClient
  private client: Redis | null = null
  private logger: pino.Logger

  private constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
    })
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient()
    }
    return RedisClient.instance
  }

  connect(): Redis {
    if (this.client) {
      return this.client
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError(err) {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          return true
        }
        return false
      },
    })

    this.client.on('connect', () => {
      this.logger.info('Redis client connected')
    })

    this.client.on('error', (err) => {
      this.logger.error({ error: err }, 'Redis client error')
    })

    this.client.on('close', () => {
      this.logger.info('Redis client connection closed')
    })

    return this.client
  }

  getClient(): Redis | null {
    return this.client
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.client = null
      this.logger.info('Redis client disconnected')
    }
  }
}

export const redisClient = RedisClient.getInstance()

// Helper function to get Redis client
export function getRedis(): Redis | null {
  try {
    return redisClient.connect()
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    return null
  }
}