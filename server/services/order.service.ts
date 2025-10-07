import { BaseService } from './base.service'
import { Order, OrderStatus, PaymentMethod, Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'

export interface CreateOrderInput {
  items: Array<{
    productId: string
    quantity: number
    price: number
    discount: number
  }>
  paymentMethod: PaymentMethod
  customerName?: string
  customerPhone?: string
  notes?: string
  tableNumber?: string
  userId: string
}

export interface OrderFilters {
  status?: OrderStatus
  dateFrom?: Date
  dateTo?: Date
  search?: string
  userId?: string
}

export class OrderService extends BaseService {
  /**
   * Create new order
   */
  async createOrder(input: CreateOrderInput) {
    try {
      return await this.transaction(async (tx) => {
        // Verify all products exist and have sufficient stock
        const productIds = input.items.map(item => item.productId)
        const products = await tx.product.findMany({
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

        const tax = subtotal * 0.1 // 10% tax - should be configurable
        const total = subtotal + tax

        // Generate order number
        const orderNumber = await this.generateOrderNumber(tx)

        // Create order
        const order = await tx.order.create({
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
            userId: input.userId,
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

        // Update product stock and create stock movements
        for (const item of input.items) {
          const product = products.find(p => p.id === item.productId)!

          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'SALE',
              reason: `Order ${orderNumber}`,
              userId: input.userId,
              previousStock: product.stock,
              newStock: product.stock - item.quantity,
              orderId: order.id,
            },
          })
        }

        this.logger.info(
          {
            orderId: order.id,
            orderNumber,
            total,
            itemCount: input.items.length,
          },
          'Order created'
        )

        return order
      })
    } catch (error) {
      this.handleError(error, 'createOrder')
    }
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(tx: any): Promise<string> {
    const date = new Date()
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

    const orderCount = await tx.order.count({
      where: {
        createdAt: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
    })

    return `ORD-${dateStr}-${String(orderCount + 1).padStart(4, '0')}`
  }

  /**
   * Get orders with filtering and pagination
   */
  async getOrders(
    filters: OrderFilters,
    pagination: { limit: number; offset: number }
  ) {
    try {
      const where: Prisma.OrderWhereInput = {}

      if (filters.status) {
        where.status = filters.status
      }

      if (filters.userId) {
        where.userId = filters.userId
      }

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {}
        if (filters.dateFrom) {
          where.createdAt.gte = filters.dateFrom
        }
        if (filters.dateTo) {
          where.createdAt.lte = filters.dateTo
        }
      }

      if (filters.search) {
        where.OR = [
          { orderNumber: { contains: filters.search, mode: 'insensitive' } },
          { customerName: { contains: filters.search, mode: 'insensitive' } },
          { customerPhone: { contains: filters.search } },
        ]
      }

      const [orders, total] = await Promise.all([
        this.prisma.order.findMany({
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
          take: pagination.limit,
          skip: pagination.offset,
        }),
        this.prisma.order.count({ where }),
      ])

      return {
        orders,
        total,
        hasMore: pagination.offset + orders.length < total,
      }
    } catch (error) {
      this.handleError(error, 'getOrders')
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
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
    } catch (error) {
      this.handleError(error, 'getOrderById')
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string
  ) {
    try {
      return await this.transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
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
        if (status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
          for (const item of order.items) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { stock: true, name: true },
            })

            if (product) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: {
                    increment: item.quantity,
                  },
                },
              })

              await tx.stockMovement.create({
                data: {
                  productId: item.productId,
                  quantity: item.quantity,
                  type: 'RETURN',
                  reason: `Cancelled Order ${order.orderNumber}`,
                  userId,
                  previousStock: product.stock,
                  newStock: product.stock + item.quantity,
                  orderId: order.id,
                },
              })
            }
          }
        }

        const updated = await tx.order.update({
          where: { id: orderId },
          data: {
            status,
            completedAt: status === OrderStatus.COMPLETED ? new Date() : undefined,
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

        this.logger.info(
          {
            orderId,
            orderNumber: order.orderNumber,
            oldStatus: order.status,
            newStatus: status,
          },
          'Order status updated'
        )

        return updated
      })
    } catch (error) {
      this.handleError(error, 'updateOrderStatus')
    }
  }

  /**
   * Get order statistics for a date range
   */
  async getOrderStatistics(startDate: Date, endDate: Date) {
    try {
      const [stats] = await this.prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            not: OrderStatus.CANCELLED,
          },
        },
        _count: true,
        _sum: {
          total: true,
          subtotal: true,
          tax: true,
        },
        _avg: {
          total: true,
        },
      })

      const ordersByStatus = await this.prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      })

      const ordersByPaymentMethod = await this.prisma.order.groupBy({
        by: ['paymentMethod'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
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

      // Get top selling products
      const topProducts = await this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: {
              not: OrderStatus.CANCELLED,
            },
          },
        },
        _sum: {
          quantity: true,
          total: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 10,
      })

      // Get product details for top products
      const productIds = topProducts.map(p => p.productId)
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true },
      })

      const topProductsWithDetails = topProducts.map(item => ({
        ...item,
        product: products.find(p => p.id === item.productId),
      }))

      return {
        totalOrders: stats._count || 0,
        totalRevenue: stats._sum.total || 0,
        totalSubtotal: stats._sum.subtotal || 0,
        totalTax: stats._sum.tax || 0,
        averageOrderValue: stats._avg.total || 0,
        ordersByStatus: ordersByStatus.reduce((acc, curr) => {
          acc[curr.status] = curr._count
          return acc
        }, {} as Record<OrderStatus, number>),
        ordersByPaymentMethod,
        topProducts: topProductsWithDetails,
      }
    } catch (error) {
      this.handleError(error, 'getOrderStatistics')
    }
  }
}