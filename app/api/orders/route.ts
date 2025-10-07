import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Check authentication
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: session.user.restaurantId,
        ...(status ? { status: status as any } : {})
      },
      include: {
        customer: true,
        items: {
          include: {
            menuItem: true
          }
        },
        table: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Get next order number for this restaurant
    const lastOrder = await prisma.order.findFirst({
      where: { restaurantId: session.user.restaurantId },
      orderBy: { orderNumber: 'desc' }
    })
    const nextOrderNumber = (lastOrder?.orderNumber || 0) + 1

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber: nextOrderNumber,
        type: data.type,
        status: 'PENDING',
        customerId: data.customerId,
        userId: session.user.id,
        restaurantId: session.user.restaurantId,
        tableId: data.tableId,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        instructions: data.notes,
        items: {
          create: data.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            options: item.options || []
          }))
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        customer: true,
        table: true
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}