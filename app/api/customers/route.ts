import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const customers = await prisma.customer.findMany({
      where: { restaurantId: session.user.restaurantId },
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Check if customer exists by phone
    let customer = await prisma.customer.findUnique({
      where: { phone: data.phone }
    })

    if (!customer) {
      // Create new customer
      customer = await prisma.customer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email,
          restaurantId: session.user.restaurantId
        }
      })
    } else {
      // Update existing customer
      customer = await prisma.customer.update({
        where: { phone: data.phone },
        data: {
          firstName: data.firstName || customer.firstName,
          lastName: data.lastName || customer.lastName,
          email: data.email || customer.email
        }
      })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error creating/updating customer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}