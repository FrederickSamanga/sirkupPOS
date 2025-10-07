# Amaya Cafe POS System

A modern, minimalist restaurant POS system built with Next.js, TypeScript, Prisma, and PostgreSQL. Features a clean monochrome design with professional interface suitable for enterprise environments.

## 🚀 Features Implemented

### ✅ Completed
- **Database Schema**: Comprehensive Prisma schema with all entities (Restaurant, User, Customer, Order, MenuItem, Table, Payment, etc.)
- **Docker Environment**: Full Docker setup with PostgreSQL, Redis, MinIO, and management UIs
- **Authentication System**: PIN-based authentication using NextAuth with 6-digit PIN codes
- **Seed Data**: Initial data including demo users, menu items, categories, and tables
- **Base UI**: Minimalist monochrome interface created by Bolt.new

### 🔄 In Progress
- Enhanced POS features
- Customer management
- Real-time updates
- Payment processing
- Advanced reporting

## 📋 Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm or yarn

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 2. Start Docker Services

```bash
# Start all services (PostgreSQL, Redis, MinIO)
npm run docker:up

# Check service logs
npm run docker:logs
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🔐 Demo Credentials

| Role | Email | PIN |
|------|-------|-----|
| Admin | admin@amayacafe.com | 123456 |
| Cashier | cashier@amayacafe.com | 111111 |
| Kitchen | kitchen@amayacafe.com | 222222 |

## 📁 Project Structure

```
amaya-pos/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── pos/              # POS interface
│   ├── tables/           # Table management
│   ├── kitchen/          # Kitchen display
│   ├── reports/          # Reporting system
│   └── login/            # Authentication
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── pos/              # POS components
│   ├── dashboard/        # Dashboard components
│   └── tables/           # Table components
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth config
│   └── prisma.ts         # Prisma client
├── prisma/                # Database
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── docker-compose.yml     # Docker services
└── Dockerfile            # App container
```

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Caching & sessions |
| MinIO | 9000/9001 | File storage |
| Adminer | 8080 | Database UI |
| RedisInsight | 8001 | Redis UI |

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Database
npm run db:push         # Push schema changes
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Docker
npm run docker:up       # Start services
npm run docker:down     # Stop services
npm run docker:logs     # View logs

# Build
npm run build           # Build for production
npm start              # Start production server
```

## 📊 Database Schema

The system includes comprehensive models for:
- **Restaurant Management**: Multi-tenant support
- **User & Authentication**: PIN-based access with roles
- **Menu Management**: Categories, items, sizes, options
- **Order Processing**: Multiple order types and statuses
- **Table Management**: Visual floor plan support
- **Payment Processing**: Multiple payment methods
- **Reporting**: Various report types and analytics
- **Customer Management**: Profiles and order history

## 🎨 Design Principles

- **Monochrome Color Scheme**: Professional black, white, and gray palette
- **Minimalist Interface**: Clean, distraction-free design
- **Consistent Spacing**: 8px grid system
- **Flat Design**: No unnecessary gradients or shadows
- **Typography Focus**: Clear hierarchy using font weights and sizes

## 🚀 Next Steps

1. **Complete POS Features**
   - Order type selection (Walk-in, Takeaway, Delivery, Dine-in)
   - Advanced cart management
   - Customer information capture

2. **Table Management**
   - Visual floor plan editor
   - Real-time table status
   - Guest tracking

3. **Kitchen Display System**
   - Order pipeline view
   - Timer tracking
   - Status progression

4. **Payment Integration**
   - Stripe/Square integration
   - Split payments
   - Receipt generation

5. **Real-time Updates**
   - WebSocket integration
   - Live order tracking
   - Kitchen notifications

6. **Advanced Reporting**
   - Sales analytics
   - Inventory tracking
   - Staff performance

## 📝 Environment Variables

Key environment variables (see `.env.example` for full list):

```env
DATABASE_URL          # PostgreSQL connection
REDIS_URL            # Redis connection
NEXTAUTH_URL         # Authentication URL
NEXTAUTH_SECRET      # Auth secret key
MINIO_ENDPOINT       # File storage
```

## 🤝 Contributing

This project follows a minimalist, professional approach. Please maintain:
- Monochrome color scheme
- Clean, simple interfaces
- Consistent code style
- Comprehensive testing

## 📄 License

Private - Amaya Cafe

## 🆘 Support

For issues or questions, please contact the development team.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.