import { Product } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class ProductRepository extends BaseRepository<Product> {
  constructor(prisma: any) {
    super(prisma, 'product')
  }

  /**
   * Find product by barcode
   */
  async findByBarcode(barcode: string): Promise<Product | null> {
    return await this.findFirst({
      where: { barcode },
    })
  }

  /**
   * Find active products
   */
  async findActive(includeCategory: boolean = false) {
    return await this.findMany({
      where: { active: true },
      include: includeCategory ? { category: true } : undefined,
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Find products by category
   */
  async findByCategory(categoryId: string) {
    return await this.findMany({
      where: {
        categoryId,
        active: true,
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Find low stock products
   */
  async findLowStock() {
    const products = await this.prisma.$queryRaw<Product[]>`
      SELECT * FROM "Product"
      WHERE stock <= "minStock"
      AND active = true
      ORDER BY stock ASC
    `
    return products
  }

  /**
   * Search products by name or barcode
   */
  async search(query: string) {
    return await this.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { barcode: { contains: query } },
        ],
        active: true,
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Update stock
   */
  async updateStock(id: string, stock: number): Promise<Product> {
    return await this.update(id, { stock })
  }

  /**
   * Increment stock
   */
  async incrementStock(id: string, quantity: number): Promise<Product> {
    return await this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          increment: quantity,
        },
      },
    })
  }

  /**
   * Decrement stock
   */
  async decrementStock(id: string, quantity: number): Promise<Product> {
    return await this.prisma.product.update({
      where: { id },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    })
  }

  /**
   * Check barcode availability
   */
  async isBarcodeAvailable(barcode: string, excludeId?: string): Promise<boolean> {
    const where: any = { barcode }
    if (excludeId) {
      where.id = { not: excludeId }
    }

    const count = await this.count(where)
    return count === 0
  }

  /**
   * Get products with stock movements
   */
  async findWithStockMovements(id: string) {
    return await this.findById(id, {
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    })
  }

  /**
   * Get product statistics
   */
  async getStatistics() {
    const [totalProducts, activeProducts, lowStockCount, outOfStockCount] = await Promise.all([
      this.count(),
      this.count({ active: true }),
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "Product"
        WHERE stock <= "minStock" AND stock > 0 AND active = true
      `,
      this.count({ stock: 0, active: true }),
    ])

    return {
      totalProducts,
      activeProducts,
      lowStockCount: Number(lowStockCount[0].count),
      outOfStockCount,
    }
  }
}