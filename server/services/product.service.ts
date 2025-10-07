import { BaseService } from './base.service'
import { Product, Category, Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'

export interface ProductFilters {
  categoryId?: string
  search?: string
  active?: boolean
  lowStock?: boolean
}

export interface PaginationOptions {
  limit: number
  offset: number
}

export class ProductService extends BaseService {
  /**
   * Get products with filtering and pagination
   */
  async getProducts(filters: ProductFilters, pagination: PaginationOptions) {
    try {
      const where: Prisma.ProductWhereInput = {}

      if (filters.categoryId) {
        where.categoryId = filters.categoryId
      }

      if (filters.active !== undefined) {
        where.active = filters.active
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { barcode: { contains: filters.search } },
        ]
      }

      if (filters.lowStock) {
        // This requires raw SQL or a more complex query
        // For now, we'll fetch all and filter in memory (not ideal for large datasets)
        const products = await this.prisma.product.findMany({
          where: {
            ...where,
            active: true,
          },
        })
        const lowStockIds = products
          .filter(p => p.stock <= p.minStock)
          .map(p => p.id)

        if (lowStockIds.length > 0) {
          where.id = { in: lowStockIds }
        }
      }

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: {
            category: true,
          },
          orderBy: { name: 'asc' },
          take: pagination.limit,
          skip: pagination.offset,
        }),
        this.prisma.product.count({ where }),
      ])

      return {
        products,
        total,
        hasMore: pagination.offset + products.length < total,
      }
    } catch (error) {
      this.handleError(error, 'getProducts')
    }
  }

  /**
   * Get single product by ID
   */
  async getProductById(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      return product
    } catch (error) {
      this.handleError(error, 'getProductById')
    }
  }

  /**
   * Create new product
   */
  async createProduct(data: Prisma.ProductCreateInput) {
    try {
      // Validate category exists
      if (data.category?.connect?.id) {
        await this.validateExists<Category>(
          this.prisma.category,
          data.category.connect.id,
          'Category'
        )
      }

      // Check for duplicate barcode
      if (data.barcode) {
        const existing = await this.prisma.product.findFirst({
          where: { barcode: data.barcode },
        })

        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Product with this barcode already exists',
          })
        }
      }

      const product = await this.prisma.product.create({
        data,
        include: {
          category: true,
        },
      })

      this.logger.info({ productId: product.id }, 'Product created')

      return product
    } catch (error) {
      this.handleError(error, 'createProduct')
    }
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    try {
      const existing = await this.validateExists<Product>(
        this.prisma.product,
        id,
        'Product'
      )

      // Check for duplicate barcode if updating
      if (data.barcode && data.barcode !== existing.barcode) {
        const duplicate = await this.prisma.product.findFirst({
          where: {
            barcode: data.barcode as string,
            id: { not: id },
          },
        })

        if (duplicate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Product with this barcode already exists',
          })
        }
      }

      const product = await this.prisma.product.update({
        where: { id },
        data,
        include: {
          category: true,
        },
      })

      this.logger.info({ productId: product.id }, 'Product updated')

      return product
    } catch (error) {
      this.handleError(error, 'updateProduct')
    }
  }

  /**
   * Update product stock
   */
  async updateStock(
    productId: string,
    quantity: number,
    type: 'add' | 'subtract' | 'set',
    userId: string,
    reason?: string
  ) {
    try {
      return await this.transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { stock: true, name: true },
        })

        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }

        let newStock: number

        switch (type) {
          case 'add':
            newStock = product.stock + quantity
            break
          case 'subtract':
            newStock = Math.max(0, product.stock - quantity)
            break
          case 'set':
            newStock = Math.max(0, quantity)
            break
        }

        const updated = await tx.product.update({
          where: { id: productId },
          data: { stock: newStock },
        })

        // Log stock movement
        await tx.stockMovement.create({
          data: {
            productId,
            quantity,
            type: type.toUpperCase(),
            reason,
            userId,
            previousStock: product.stock,
            newStock,
          },
        })

        this.logger.info(
          {
            productId,
            productName: product.name,
            previousStock: product.stock,
            newStock,
            type,
          },
          'Stock updated'
        )

        return updated
      })
    } catch (error) {
      this.handleError(error, 'updateStock')
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts() {
    try {
      const products = await this.prisma.$queryRaw<Product[]>`
        SELECT * FROM "Product"
        WHERE stock <= "minStock"
        AND active = true
        ORDER BY stock ASC
      `

      return products
    } catch (error) {
      this.handleError(error, 'getLowStockProducts')
    }
  }

  /**
   * Soft delete product
   */
  async deleteProduct(id: string) {
    try {
      await this.validateExists<Product>(
        this.prisma.product,
        id,
        'Product'
      )

      await this.prisma.product.update({
        where: { id },
        data: { active: false },
      })

      this.logger.info({ productId: id }, 'Product soft deleted')

      return { success: true }
    } catch (error) {
      this.handleError(error, 'deleteProduct')
    }
  }
}