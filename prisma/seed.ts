import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Amaya Cafe',
      timezone: 'America/New_York',
      currency: 'USD',
      taxRate: 0.08,
      settings: {
        enableDelivery: true,
        enableTableManagement: true,
        enableKitchenDisplay: true,
        orderNumberPrefix: 'ORD',
        defaultPreparationTime: 15
      }
    }
  })

  // Create demo users with hashed PINs
  const adminPin = await bcrypt.hash('123456', 10)
  const cashierPin = await bcrypt.hash('111111', 10)
  const kitchenPin = await bcrypt.hash('222222', 10)

  await prisma.user.upsert({
    where: { email: 'admin@amayacafe.com' },
    update: {},
    create: {
      email: 'admin@amayacafe.com',
      name: 'Admin User',
      pin: adminPin,
      role: 'ADMIN',
      restaurantId: restaurant.id,
      permissions: ['all']
    }
  })

  await prisma.user.upsert({
    where: { email: 'cashier@amayacafe.com' },
    update: {},
    create: {
      email: 'cashier@amayacafe.com',
      name: 'Cashier User',
      pin: cashierPin,
      role: 'CASHIER',
      restaurantId: restaurant.id,
      permissions: ['pos', 'orders', 'customers']
    }
  })

  await prisma.user.upsert({
    where: { email: 'kitchen@amayacafe.com' },
    update: {},
    create: {
      email: 'kitchen@amayacafe.com',
      name: 'Kitchen Staff',
      pin: kitchenPin,
      role: 'KITCHEN',
      restaurantId: restaurant.id,
      permissions: ['kitchen', 'orders']
    }
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { restaurantId_name: { restaurantId: restaurant.id, name: 'Appetizers' } },
      update: {},
      create: {
        name: 'Appetizers',
        order: 1,
        restaurantId: restaurant.id
      }
    }),
    prisma.category.upsert({
      where: { restaurantId_name: { restaurantId: restaurant.id, name: 'Main Course' } },
      update: {},
      create: {
        name: 'Main Course',
        order: 2,
        restaurantId: restaurant.id
      }
    }),
    prisma.category.upsert({
      where: { restaurantId_name: { restaurantId: restaurant.id, name: 'Desserts' } },
      update: {},
      create: {
        name: 'Desserts',
        order: 3,
        restaurantId: restaurant.id
      }
    }),
    prisma.category.upsert({
      where: { restaurantId_name: { restaurantId: restaurant.id, name: 'Beverages' } },
      update: {},
      create: {
        name: 'Beverages',
        order: 4,
        restaurantId: restaurant.id
      }
    })
  ])

  // Create sample menu items
  const menuItems = [
    // Appetizers
    {
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with caesar dressing',
      price: 8.99,
      categoryId: categories[0].id,
      restaurantId: restaurant.id,
      preparationTime: 5
    },
    {
      name: 'Soup of the Day',
      description: 'Chef\'s special soup',
      price: 6.99,
      categoryId: categories[0].id,
      restaurantId: restaurant.id,
      preparationTime: 5
    },
    // Main Course
    {
      name: 'Grilled Chicken',
      description: 'Grilled chicken breast with vegetables',
      price: 18.99,
      categoryId: categories[1].id,
      restaurantId: restaurant.id,
      preparationTime: 20
    },
    {
      name: 'Beef Steak',
      description: 'Premium beef steak cooked to perfection',
      price: 28.99,
      categoryId: categories[1].id,
      restaurantId: restaurant.id,
      preparationTime: 25
    },
    {
      name: 'Salmon Fillet',
      description: 'Fresh Atlantic salmon with lemon butter',
      price: 24.99,
      categoryId: categories[1].id,
      restaurantId: restaurant.id,
      preparationTime: 18
    },
    // Desserts
    {
      name: 'Chocolate Cake',
      description: 'Rich chocolate layer cake',
      price: 7.99,
      categoryId: categories[2].id,
      restaurantId: restaurant.id,
      preparationTime: 2
    },
    {
      name: 'Ice Cream',
      description: 'Vanilla, chocolate, or strawberry',
      price: 5.99,
      categoryId: categories[2].id,
      restaurantId: restaurant.id,
      preparationTime: 1
    },
    // Beverages
    {
      name: 'Coffee',
      description: 'Freshly brewed coffee',
      price: 2.99,
      categoryId: categories[3].id,
      restaurantId: restaurant.id,
      preparationTime: 3
    },
    {
      name: 'Fresh Juice',
      description: 'Orange, apple, or mixed',
      price: 4.99,
      categoryId: categories[3].id,
      restaurantId: restaurant.id,
      preparationTime: 5
    },
    {
      name: 'Soft Drink',
      description: 'Coke, Sprite, or Fanta',
      price: 2.49,
      categoryId: categories[3].id,
      restaurantId: restaurant.id,
      preparationTime: 1
    }
  ]

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: item
    })
  }

  // Create tables
  const sections = [
    { name: 'Main Floor', prefix: 'M' },
    { name: 'Patio', prefix: 'P' },
    { name: 'VIP', prefix: 'V' }
  ]

  for (const section of sections) {
    for (let i = 1; i <= 4; i++) {
      await prisma.table.create({
        data: {
          number: `${section.prefix}${i}`,
          section: section.name,
          capacity: i === 4 ? 6 : 4,
          position: { x: i * 100, y: 100 },
          restaurantId: restaurant.id
        }
      })
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })