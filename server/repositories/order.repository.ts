import { Order, OrderStatus, PaymentMethod } from '@prisma/client'
import { BaseRepository } from './base.repository'

export class OrderRepository extends BaseRepository<Order> {
  constructor(prisma: any) {
    super(prisma, 'order')
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await this.findFirst({
      where: { orderNumber },
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
  }

  /**
   * Find orders by status
   */
  async findByStatus(status: OrderStatus) {
    return await this.findMany({
      where: { status },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find pending orders
   */
  async findPending() {
    return await this.findByStatus(OrderStatus.PENDING)
  }

  /**
   * Find today's orders
   */
  async findToday() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return await this.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
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
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find orders by date range
   */
  async findByDateRange(startDate: Date, endDate: Date) {
    return await this.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
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
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find orders by customer
   */
  async findByCustomer(customerName?: string, customerPhone?: string) {
    const where: any = {
      OR: [],
    }

    if (customerName) {
      where.OR.push({
        customerName: {
          contains: customerName,
          mode: 'insensitive',
        },
      })
    }

    if (customerPhone) {
      where.OR.push({
        customerPhone: {
          contains: customerPhone,
        },
      })
    }

    if (where.OR.length === 0) {
      return []
    }

    return await this.findMany({
      where,
      include: {
        items: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Find orders by user
   */
  async findByUser(userId: string) {
    return await this.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Get order with full details
   */
  async findWithDetails(id: string) {
    return await this.findById(id, {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
      user: true,
      payments: true,
    })
  }

  /**
   * Get daily revenue
   */
  async getDailyRevenue(date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const result = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          not: OrderStatus.CANCELLED,
        },
      },
      _sum: {
        total: true,
        subtotal: true,
        tax: true,
      },
      _count: true,
    })

    return {
      revenue: result._sum.total || 0,
      subtotal: result._sum.subtotal || 0,
      tax: result._sum.tax || 0,
      orderCount: result._count || 0,
    }
  }

  /**
   * Get monthly statistics
   */
  async getMonthlyStats(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const [revenue, ordersByStatus, ordersByPayment, dailyRevenue] = await Promise.all([
      // Total revenue
      this.prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            not: OrderStatus.CANCELLED,
          },
        },
        _sum: {
          total: true,
        },
        _count: true,
        _avg: {
          total: true,
        },
      }),
      // Orders by status
      this.prisma.order.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: true,
      }),
      // Orders by payment method
      this.prisma.order.groupBy({
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
      }),
      // Daily revenue breakdown
      this.prisma.$queryRaw<Array<{ date: Date; revenue: number; orders: bigint }>>`
        SELECT
          DATE(createdAt) as date,
          SUM(total) as revenue,
          COUNT(*) as orders
        FROM "Order"
        WHERE createdAt >= ${startDate}
        AND createdAt <= ${endDate}
        AND status != 'CANCELLED'
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,
    ])

    return {
      totalRevenue: revenue._sum.total || 0,
      totalOrders: revenue._count || 0,
      averageOrderValue: revenue._avg.total || 0,
      ordersByStatus,
      ordersByPayment,
      dailyRevenue: dailyRevenue.map(d => ({
        ...d,
        orders: Number(d.orders),
      })),
    }
  }

  /**
   * Get next order number for today
   */
  async getNextOrderNumber(): Promise<string> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const count = await this.count({
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    })

    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
    return `ORD-${dateStr}-${String(count + 1).padStart(4, '0')}`
  }
}