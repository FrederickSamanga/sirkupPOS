import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId: session.user.restaurantId,
        isAvailable: true,
        ...(categoryId && categoryId !== 'all' ? { categoryId } : {})
      },
      include: {
        category: true,
        sizes: true,
        options: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}