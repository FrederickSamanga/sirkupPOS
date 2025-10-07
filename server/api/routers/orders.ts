import { z } from 'zod'
import { router, protectedProcedure } from '../trpc/init'
import { TRPCError } from '@trpc/server'
import { OrderStatus, PaymentMethod } from '@prisma/client'

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    discount: z.number().min(0).max(100).default(0),
  })).min(1),
  paymentMethod: z.nativeEnum(PaymentMethod),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  tableNumber: z.string().optional(),
})

const orderFilterSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

export const ordersRouter = router({
  // Create new order
  create: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify all products exist and have sufficient stock
      const productIds = input.items.map(item => item.productId)
      const products = await ctx.prisma.product.findMany({
        where: { id: { in: productIds } },
      })

      if (products.length !== productIds.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'One or more products not found',
        })
      }

      // Check stock availability
      for (const item of input.items) {
        const product = products.find(p => p.id === item.productId)
        if (!product) continue

        if (product.stock < item.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          })
        }
      }

      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity
        const discount = (itemTotal * item.discount) / 100
        return sum + (itemTotal - discount)
      }, 0)

      const tax = subtotal * 0.1 // 10% tax
      const total = subtotal + tax

      // Generate order number
      const date = new Date()
      const orderCount = await ctx.prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
            lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
          },
        },
      })

      const orderNumber = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(orderCount + 1).padStart(4, '0')}`

      // Create order with items
      const order = await ctx.prisma.order.create({
        data: {
          orderNumber,
          subtotal,
          tax,
          total,
          paymentMethod: input.paymentMethod,
          status: OrderStatus.PENDING,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          notes: input.notes,
          tableNumber: input.tableNumber,
          userId: ctx.session.user.id,
          items: {
            create: input.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              discount: item.discount,
              total: (item.price * item.quantity) * (1 - item.discount / 100),
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      })

      // Update product stock
      for (const item of input.items) {
        await ctx.prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        // Log stock movement
        const product = products.find(p => p.id === item.productId)!
        await ctx.prisma.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: 'SALE',
            reason: `Order ${orderNumber}`,
            userId: ctx.session.user.id,
            previousStock: product.stock,
            newStock: product.stock - item.quantity,
            orderId: order.id,
          },
        })
      }

      return order
    }),

  // Get orders list with filtering
  list: protectedProcedure
    .input(orderFilterSchema)
    .query(async ({ ctx, input }) => {
      const where: any = {}

      if (input.status) {
        where.status = input.status
      }

      if (input.dateFrom || input.dateTo) {
        where.createdAt = {}
        if (input.dateFrom) {
          where.createdAt.gte = input.dateFrom
        }
        if (input.dateTo) {
          where.createdAt.lte = input.dateTo
        }
      }

      if (input.search) {
        where.OR = [
          { orderNumber: { contains: input.search, mode: 'insensitive' } },
          { customerName: { contains: input.search, mode: 'insensitive' } },
          { customerPhone: { contains: input.search } },
        ]
      }

      const [orders, total] = await Promise.all([
        ctx.prisma.order.findMany({
          where,
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.prisma.order.count({ where }),
      ])

      return {
        orders,
        total,
        hasMore: input.offset + orders.length < total,
      }
    }),

  // Get single order
  byId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
          payments: true,
        },
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      return order
    }),

  // Update order status
  updateStatus: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      status: z.nativeEnum(OrderStatus),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.orderId },
        include: {
          items: true,
        },
      })

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        })
      }

      // If cancelling order, restore stock
      if (input.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          const product = await ctx.prisma.product.findUnique({
            where: { id: item.productId },
            select: { stock: true },
          })

          if (product) {
            await ctx.prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            })

            // Log stock movement
            await ctx.prisma.stockMovement.create({
              data: {
                productId: item.productId,
                quantity: item.quantity,
                type: 'RETURN',
                reason: `Cancelled Order ${order.orderNumber}`,
                userId: ctx.session.user.id,
                previousStock: product.stock,
                newStock: product.stock + item.quantity,
                orderId: order.id,
              },
            })
          }
        }
      }

      const updated = await ctx.prisma.order.update({
        where: { id: input.orderId },
        data: {
          status: input.status,
          completedAt: input.status === OrderStatus.COMPLETED ? new Date() : undefined,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      })

      return updated
    }),

  // Get today's statistics
  todayStats: protectedProcedure
    .query(async ({ ctx }) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const [stats] = await ctx.prisma.order.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            not: OrderStatus.CANCELLED,
          },
        },
        _count: true,
        _sum: {
          total: true,
        },
      })

      const ordersByStatus = await ctx.prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _count: true,
      })

      return {
        totalOrders: stats._count || 0,
        totalRevenue: stats._sum.total || 0,
        ordersByStatus: ordersByStatus.reduce((acc, curr) => {
          acc[curr.status] = curr._count
          return acc
        }, {} as Record<OrderStatus, number>),
      }
    }),
})