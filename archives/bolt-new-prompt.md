# Bolt.new Prompt for Amaya Cafe POS System

## Project Request

Create a modern, minimalist restaurant POS (Point of Sale) system with a professional monochrome design. The system should handle restaurant operations efficiently with a clean, distraction-free interface.

## Design Requirements

### Visual Design
- **Color Scheme**: Strictly monochrome (black, white, grays)
- **Typography**: Clean, modern sans-serif fonts
- **Layout**: Minimalist with plenty of whitespace
- **Components**: Flat design, subtle shadows, no gradients
- **Icons**: Simple line icons, consistent stroke width
- **Animations**: Subtle, professional transitions only

### UI Principles
- Professional and corporate appearance
- Maximum readability and usability
- Distraction-free interface
- Focus on functionality over decoration
- Consistent spacing using 8px grid system

## Core Features

### 1. Dashboard
- Clean overview with key metrics (Today's Sales, Orders, Average Order Value)
- Simple charts with monochrome colors
- Quick action buttons
- Recent orders list

### 2. Order Management
- **Order Types**: Walk-in, Takeaway, Delivery, Dine-in
- **Order Flow**:
  - Select order type
  - Add items from menu
  - Enter customer details
  - Process payment
  - Generate receipt

### 3. Menu System
- Grid layout for menu items
- Categories sidebar
- Search functionality
- Item details: name, price, description
- Size and option modifiers
- Quick add buttons

### 4. Table Management
- Visual floor plan with tables
- Table status indicators (Available/Occupied)
- Drag-and-drop table assignment
- Guest count tracking

### 5. Customer Management
- Customer database
- Phone number as primary identifier
- Order history
- Basic contact information

### 6. Payment Processing
- Multiple payment methods (Cash, Card)
- Split payment capability
- Receipt generation
- Change calculation

### 7. Kitchen Display
- Order queue view
- Status progression (New → Preparing → Ready)
- Timer for each order
- Clear item details

### 8. Reports
- Daily sales summary
- Payment method breakdown
- Top selling items
- Simple, clean data tables
- Export to CSV

### 9. Settings
- Restaurant information
- Tax configuration
- User management
- Order type settings

## Technical Stack

```javascript
// Use these technologies:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS (configured for monochrome)
- Prisma with SQLite (for simplicity)
- Shadcn/ui components (styled monochrome)
- React Hook Form
- Zustand for state management
- Recharts for charts (monochrome theme)
```

## Database Schema

```prisma
model Restaurant {
  id       String @id
  name     String
  settings Json
}

model User {
  id       String @id
  name     String
  email    String @unique
  pin      String
  role     String // ADMIN, CASHIER, KITCHEN
}

model Customer {
  id        String @id
  firstName String?
  lastName  String?
  phone     String @unique
  email     String?
  orders    Order[]
}

model Order {
  id           String @id
  orderNumber  Int @unique
  type         String // WALK_IN, TAKEAWAY, DELIVERY, DINE_IN
  status       String // PENDING, PREPARING, READY, COMPLETED
  customerId   String?
  items        OrderItem[]
  total        Float
  tax          Float
  paymentMethod String
  createdAt    DateTime
}

model MenuItem {
  id          String @id
  name        String
  price       Float
  category    String
  description String?
  available   Boolean @default(true)
}

model Table {
  id       String @id
  number   String
  capacity Int
  status   String // AVAILABLE, OCCUPIED
  x        Int
  y        Int
}
```

## Component Structure

```
/components
  /ui (shadcn components - monochrome styled)
    - button.tsx
    - card.tsx
    - dialog.tsx
    - table.tsx
    - input.tsx
    - select.tsx
  /dashboard
    - stats-card.tsx
    - recent-orders.tsx
    - sales-chart.tsx
  /pos
    - menu-grid.tsx
    - cart.tsx
    - payment-modal.tsx
  /tables
    - floor-plan.tsx
    - table-card.tsx
  /kitchen
    - order-card.tsx
    - order-pipeline.tsx
```

## Tailwind Configuration

```javascript
// tailwind.config.js - Monochrome theme
module.exports = {
  theme: {
    colors: {
      white: '#ffffff',
      black: '#000000',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      }
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    }
  }
}
```

## Sample Pages Layout

### 1. Dashboard Page
```
Header: [Logo] Amaya Cafe POS    [User] [Settings]
Stats:  [Today's Sales] [Orders: 45] [Avg Order: $25]
Chart:  [Simple line chart showing hourly sales]
Table:  Recent Orders (Order#, Customer, Amount, Status)
```

### 2. POS Page
```
Left:   Categories (vertical list)
Center: Menu Items (grid of cards)
Right:  Cart (items list, total, checkout button)
```

### 3. Table Management
```
Header: Floor Sections [Ground | First Floor | Outdoor]
Main:   Visual grid with table rectangles
        Gray = Available, Black = Occupied
        Shows table number and guest count
```

### 4. Kitchen Display
```
Pipeline: [New Orders] → [Preparing] → [Ready]
Cards:    Order #, Items, Time elapsed
```

## Key Implementation Notes

1. **Authentication**: Simple PIN-based login for quick access
2. **State Management**: Use Zustand for cart and order state
3. **Real-time**: Use polling for kitchen display updates (WebSockets optional)
4. **Responsive**: Desktop-first, tablet-compatible
5. **Performance**: Lazy load components, optimize images
6. **Data**: Use SQLite for development, PostgreSQL ready

## File Structure

```
/app
  /dashboard
    page.tsx
  /pos
    page.tsx
  /tables
    page.tsx
  /kitchen
    page.tsx
  /customers
    page.tsx
  /reports
    page.tsx
  /settings
    page.tsx
  /api
    /orders
    /menu
    /customers
    /tables
  layout.tsx
  page.tsx (login)
```

## Start with These Core Features

1. **Phase 1**: Dashboard with static data
2. **Phase 2**: Menu display and cart functionality
3. **Phase 3**: Order creation and management
4. **Phase 4**: Table management visual interface
5. **Phase 5**: Kitchen display system
6. **Phase 6**: Basic reporting

## Example Component (Menu Item Card)

```tsx
// Minimalist menu item card
<div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors cursor-pointer">
  <h3 className="font-medium text-gray-900 mb-1">Margherita Pizza</h3>
  <p className="text-sm text-gray-500 mb-3">Fresh mozzarella, tomato, basil</p>
  <div className="flex justify-between items-center">
    <span className="font-semibold text-gray-900">$12.99</span>
    <button className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800">
      Add
    </button>
  </div>
</div>
```

## Important: Keep It Simple

- No fancy animations or effects
- No colorful badges or labels
- Use borders and spacing for visual hierarchy
- Gray scale for all status indicators
- Focus on typography and layout for visual interest
- Professional, clean, efficient

Build this as a working prototype with all basic CRUD operations functional. Use mock data where needed but ensure the flow works end-to-end.