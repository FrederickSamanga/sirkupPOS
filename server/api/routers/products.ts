import { z } from 'zod'
import { router, protectedProcedure, adminProcedure } from '../trpc/init'
import { TRPCError } from '@trpc/server'

const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string(),
  barcode: z.string().optional(),
  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),
  active: z.boolean().default(true),
})

const updateProductSchema = createProductSchema.partial().extend({
  id: z.string(),
})

const productFilterSchema = z.object({
  categoryId: z.string().optional(),
  search: z.string().optional(),
  active: z.boolean().optional(),
  lowStock: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export const productsRouter = router({
  // Get all products with filtering and pagination
  list: protectedProcedure
    .input(productFilterSchema)
    .query(async ({ ctx, input }) => {
      const where: any = {}

      if (input.categoryId) {
        where.categoryId = input.categoryId
      }

      if (input.active !== undefined) {
        where.active = input.active
      }

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { barcode: { contains: input.search } },
        ]
      }

      if (input.lowStock) {
        where.stock = { lte: ctx.prisma.product.fields.minStock }
      }

      const [products, total] = await Promise.all([
        ctx.prisma.product.findMany({
          where,
          include: {
            category: true,
          },
          orderBy: { name: 'asc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.product.count({ where }),
      ])

      return {
        products,
        total,
        hasMore: input.offset + products.length < total,
      }
    }),

  // Get single product
  byId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input },
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
    }),

  // Create product (admin only)
  create: adminProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if category exists
      const category = await ctx.prisma.category.findUnique({
        where: { id: input.categoryId },
      })

      if (!category) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Category not found',
        })
      }

      // Check for duplicate barcode
      if (input.barcode) {
        const existing = await ctx.prisma.product.findFirst({
          where: { barcode: input.barcode },
        })

        if (existing) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Product with this barcode already exists',
          })
        }
      }

      const product = await ctx.prisma.product.create({
        data: input,
        include: {
          category: true,
        },
      })

      return product
    }),

  // Update product (admin only)
  update: adminProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input

      // Check if product exists
      const existing = await ctx.prisma.product.findUnique({
        where: { id },
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      // Check for duplicate barcode
      if (data.barcode && data.barcode !== existing.barcode) {
        const duplicate = await ctx.prisma.product.findFirst({
          where: {
            barcode: data.barcode,
            id: { not: id }
          },
        })

        if (duplicate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Product with this barcode already exists',
          })
        }
      }

      const product = await ctx.prisma.product.update({
        where: { id },
        data,
        include: {
          category: true,
        },
      })

      return product
    }),

  // Delete product (admin only)
  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // Check if product exists
      const product = await ctx.prisma.product.findUnique({
        where: { id: input },
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      // Soft delete by setting active to false
      await ctx.prisma.product.update({
        where: { id: input },
        data: { active: false },
      })

      return { success: true }
    }),

  // Update stock
  updateStock: protectedProcedure
    .input(z.object({
      productId: z.string(),
      quantity: z.number().int(),
      type: z.enum(['add', 'subtract', 'set']),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
        select: { stock: true },
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      let newStock: number

      switch (input.type) {
        case 'add':
          newStock = product.stock + input.quantity
          break
        case 'subtract':
          newStock = Math.max(0, product.stock - input.quantity)
          break
        case 'set':
          newStock = Math.max(0, input.quantity)
          break
      }

      const updated = await ctx.prisma.product.update({
        where: { id: input.productId },
        data: { stock: newStock },
      })

      // Log stock movement
      await ctx.prisma.stockMovement.create({
        data: {
          productId: input.productId,
          quantity: input.quantity,
          type: input.type.toUpperCase(),
          reason: input.reason,
          userId: ctx.session.user.id,
          previousStock: product.stock,
          newStock,
        },
      })

      return updated
    }),
})