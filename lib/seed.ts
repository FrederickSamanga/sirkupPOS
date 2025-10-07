import { prisma } from './prisma'

export async function seedDatabase() {
  try {
    // Create restaurant
    await prisma.restaurant.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id: 'main',
        name: 'Amaya Cafe',
      }
    })

    // Create admin user
    await prisma.user.upsert({
      where: { email: 'test@sirkupaicafepos.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'test@sirkupaicafepos.com',
        pin: '001433',
        role: 'ADMIN'
      }
    })

    // Create categories
    const categories = [
      'Appetizers',
      'Main Course', 
      'Pizza',
      'Pasta',
      'Desserts',
      'Beverages'
    ]

    for (const [index, category] of categories.entries()) {
      await prisma.category.upsert({
        where: { id: category.toLowerCase() },
        update: {},
        create: {
          id: category.toLowerCase(),
          name: category,
          order: index
        }
      })
    }

    // Create menu items
    const menuItems = [
      { name: 'Caesar Salad', price: 12.99, category: 'Appetizers', description: 'Fresh romaine lettuce with parmesan and croutons' },
      { name: 'Bruschetta', price: 8.99, category: 'Appetizers', description: 'Toasted bread with tomatoes, basil, and garlic' },
      { name: 'Grilled Chicken', price: 18.99, category: 'Main Course', description: 'Seasoned chicken breast with vegetables' },
      { name: 'Salmon Fillet', price: 22.99, category: 'Main Course', description: 'Fresh Atlantic salmon with lemon herbs' },
      { name: 'Margherita Pizza', price: 14.99, category: 'Pizza', description: 'Fresh mozzarella, tomato sauce, basil' },
      { name: 'Pepperoni Pizza', price: 16.99, category: 'Pizza', description: 'Pepperoni, mozzarella, tomato sauce' },
      { name: 'Spaghetti Carbonara', price: 15.99, category: 'Pasta', description: 'Pasta with eggs, cheese, pancetta, and pepper' },
      { name: 'Fettuccine Alfredo', price: 14.99, category: 'Pasta', description: 'Pasta in creamy parmesan sauce' },
      { name: 'Tiramisu', price: 7.99, category: 'Desserts', description: 'Classic Italian dessert with coffee and mascarpone' },
      { name: 'Chocolate Cake', price: 6.99, category: 'Desserts', description: 'Rich chocolate cake with ganache' },
      { name: 'Espresso', price: 3.99, category: 'Beverages', description: 'Strong Italian coffee' },
      { name: 'Cappuccino', price: 4.99, category: 'Beverages', description: 'Espresso with steamed milk foam' },
      { name: 'Fresh Orange Juice', price: 3.99, category: 'Beverages', description: 'Freshly squeezed orange juice' }
    ]

    for (const item of menuItems) {
      await prisma.menuItem.upsert({
        where: { id: item.name.toLowerCase().replace(/\s+/g, '-') },
        update: {},
        create: {
          id: item.name.toLowerCase().replace(/\s+/g, '-'),
          ...item
        }
      })
    }

    // Create tables
    const tables = [
      { number: '1', capacity: 2, section: 'main', x: 100, y: 100 },
      { number: '2', capacity: 4, section: 'main', x: 300, y: 100 },
      { number: '3', capacity: 4, section: 'main', x: 500, y: 100 },
      { number: '4', capacity: 6, section: 'main', x: 100, y: 300 },
      { number: '5', capacity: 8, section: 'main', x: 300, y: 300 },
      { number: '6', capacity: 4, section: 'outdoor', x: 100, y: 500 }
    ]

    for (const table of tables) {
      await prisma.table.upsert({
        where: { id: `table-${table.number}` },
        update: {},
        create: {
          id: `table-${table.number}`,
          ...table
        }
      })
    }

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}