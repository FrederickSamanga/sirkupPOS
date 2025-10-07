import { PrismaClient } from '@prisma/client'

export interface FindOptions {
  where?: any
  include?: any
  orderBy?: any
  take?: number
  skip?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  hasMore: boolean
  page: number
  pageSize: number
}

/**
 * Base repository class with common CRUD operations
 */
export abstract class BaseRepository<T> {
  protected prisma: PrismaClient
  protected modelName: string

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma
    this.modelName = modelName
  }

  /**
   * Find single entity by ID
   */
  async findById(id: string, include?: any): Promise<T | null> {
    return await (this.prisma as any)[this.modelName].findUnique({
      where: { id },
      include,
    })
  }

  /**
   * Find multiple entities
   */
  async findMany(options: FindOptions = {}): Promise<T[]> {
    return await (this.prisma as any)[this.modelName].findMany(options)
  }

  /**
   * Find single entity
   */
  async findFirst(options: FindOptions = {}): Promise<T | null> {
    return await (this.prisma as any)[this.modelName].findFirst(options)
  }

  /**
   * Find with pagination
   */
  async findPaginated(
    page: number = 1,
    pageSize: number = 50,
    options: FindOptions = {}
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * pageSize
    const take = pageSize

    const [data, total] = await Promise.all([
      this.findMany({
        ...options,
        skip,
        take,
      }),
      this.count(options.where),
    ])

    return {
      data,
      total,
      hasMore: skip + data.length < total,
      page,
      pageSize,
    }
  }

  /**
   * Count entities
   */
  async count(where?: any): Promise<number> {
    return await (this.prisma as any)[this.modelName].count({ where })
  }

  /**
   * Create entity
   */
  async create(data: any, include?: any): Promise<T> {
    return await (this.prisma as any)[this.modelName].create({
      data,
      include,
    })
  }

  /**
   * Update entity
   */
  async update(id: string, data: any, include?: any): Promise<T> {
    return await (this.prisma as any)[this.modelName].update({
      where: { id },
      data,
      include,
    })
  }

  /**
   * Delete entity
   */
  async delete(id: string): Promise<T> {
    return await (this.prisma as any)[this.modelName].delete({
      where: { id },
    })
  }

  /**
   * Soft delete entity (set active to false)
   */
  async softDelete(id: string): Promise<T> {
    return await this.update(id, { active: false })
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.count({ id })
    return count > 0
  }

  /**
   * Bulk create entities
   */
  async createMany(data: any[]): Promise<{ count: number }> {
    return await (this.prisma as any)[this.modelName].createMany({
      data,
      skipDuplicates: true,
    })
  }

  /**
   * Bulk update entities
   */
  async updateMany(where: any, data: any): Promise<{ count: number }> {
    return await (this.prisma as any)[this.modelName].updateMany({
      where,
      data,
    })
  }

  /**
   * Execute transaction
   */
  async transaction<R>(
    fn: (tx: PrismaClient) => Promise<R>
  ): Promise<R> {
    return await this.prisma.$transaction(fn)
  }
}