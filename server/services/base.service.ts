import { PrismaClient } from '@prisma/client'
import pino from 'pino'

/**
 * Base service class that all services should extend
 * Provides common functionality like logging and database access
 */
export abstract class BaseService {
  protected prisma: PrismaClient
  protected logger: pino.Logger

  constructor(prisma: PrismaClient, logger?: pino.Logger) {
    this.prisma = prisma
    this.logger = logger || pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
            },
          }
        : undefined,
    })
  }

  /**
   * Wrapper for database transactions
   */
  protected async transaction<T>(
    fn: (tx: PrismaClient) => Promise<T>
  ): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      return await fn(tx as PrismaClient)
    })
  }

  /**
   * Generic error handler
   */
  protected handleError(error: any, context: string): never {
    this.logger.error({ error, context }, `Error in ${context}`)
    throw error
  }

  /**
   * Validate entity existence
   */
  protected async validateExists<T>(
    model: any,
    id: string,
    name: string
  ): Promise<T> {
    const entity = await model.findUnique({ where: { id } })

    if (!entity) {
      const error = new Error(`${name} not found`)
      ;(error as any).code = 'NOT_FOUND'
      throw error
    }

    return entity as T
  }
}