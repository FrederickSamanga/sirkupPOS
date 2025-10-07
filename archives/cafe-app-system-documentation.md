# Amaya Cafe POS System - Complete Documentation

## System Overview

Amaya Cafe POS is a comprehensive restaurant management system that integrates point-of-sale operations, online ordering, kitchen management, and reporting capabilities. The system operates through both web interfaces (pos.eposmatic.com) and appears to be part of the ePOSmatic platform.

## Core Components

### 1. Main Dashboard
- **Brand**: Amaya Cafe with Thai Lemon location/franchise
- **User System**: Personal user profiles with authentication
- **System Status**: Connection monitoring with timezone synchronization
- **Main Navigation**: Bottom toolbar with 7 primary modules

### 2. Order Types

The system supports 6 distinct ordering channels:

#### 2.1 Walk-In
- Traditional counter service
- Customer approaches physical location
- Direct payment processing

#### 2.2 Take Away
- Order for pickup
- Customer information collection
- Phone number required

#### 2.3 Delivery
- Full delivery management system
- Address collection
- Rider assignment capabilities
- Estimated delivery times
- Integration with delivery tracking

#### 2.4 Dine-In
- Visual table management system
- Interactive floor plan with multiple sections:
  - Ground Floor
  - Dine In area
  - Gents Hall
  - Basement
  - Family Hall
  - Rooms
- Table capacity indicators (4, 6, 8, 16 seats)
- Real-time table status:
  - Available (white)
  - Occupied (red with order details)
  - Timer tracking for occupied tables
  - Guest count tracking
- "Start Sitting" functionality
- Table labels (G1-G7 for Gents Hall)

#### 2.5 Drive-Thru
- Quick service lane functionality
- Streamlined ordering process
- Customer information capture

#### 2.6 Kiosk
- Self-service terminal support
- Customer-facing interface

### 3. Menu Management System

#### Menu Structure
- **Categories** (Left Sidebar):
  - Deals
  - Classic Flavours (Pizzas)
  - Special Flavours
  - Pocket Flavours
  - Beef Burgers
  - Burgers
  - Basic Pizzas
  - Signature Pizzas
  - Pan Asian
  - Wok Tossed Fries
  - Wings & Wraps
  - Fries Station
  - MP Steakhouse
  - Lunch & Midnight Deals
  - Summer Deals
  - Party Deals
  - Solo Deals
  - Premium Deals
  - Combo Deals
  - Midnight Cheesy

#### Product Display
- Visual product cards with images
- Pricing in PKR (Pakistani Rupees)
- Promotional badges ("Buy 1 Get 1 Free", discount percentages)
- Add to cart buttons (+)
- Item descriptions
- Size options (e.g., Pizza sizes: 6", 8", Large)
- Crust options (Original, etc.)

#### Deal Types
- **Lunch & Midnight Deals**: Combo meals with beverages (Rs 44-74 range)
- **Summer Deals**: Seasonal promotions
- **Party Deals**: Bulk ordering options
- **Percentage Discounts**: 14% off, etc.

### 4. Customer Management

#### Information Collection
- Phone number (primary identifier)
- First Name
- Last Name
- Email address
- Delivery address (for delivery orders)
- Order instructions field with character limit

#### Authentication
- 6-digit permission code system
- Personal access passwords for staff
- Multi-level access control

### 5. Order Processing Flow

#### Order Creation
1. Select order type
2. Choose products from menu
3. Enter customer information
4. Add special instructions if needed
5. Process payment

#### Order States
- **Unconfirmed**: Initial state
- **Placed**: Confirmed and paid
- **Preparing**: In kitchen
- **Ready**: Prepared, awaiting pickup/delivery
- **Out For Delivery**: With delivery rider
- **Completed**: Fulfilled
- **Delivered**: Final state for delivery orders

### 6. Payment System

#### Payment Methods
- Cash (Unpaid until collected)
- Card Terminal
- UBL Card (specific bank integration)
- Mt D100% (possibly staff/discount)
- Multiple payment splits supported

#### Pricing Features
- GST calculation (5% and 15% rates)
- Service charges (5%)
- Discount application (Item-level and order-level)
- Promotional pricing
- Buy-one-get-one offers

### 7. Kitchen Display System (KDS)

#### Pipeline View
- Horizontal workflow showing order progression
- Stage counters showing pending items
- Order cards with:
  - Table/order number
  - Order time and elapsed time
  - Customer name
  - Items ordered with sizes/options
  - Visual status indicators

#### Features
- Real-time updates
- "Load Past Orders" functionality
- Web-based interface for kitchen staff
- Timer tracking for preparation times

### 8. Order Management Interface

#### Order List View
- Tabbed filtering by order type
- Status filters (All, Paid, Unpaid)
- Order details:
  - Order number (#772, #766, etc.)
  - Customer name (e.g., "Sonny")
  - Order type indicator
  - Total amount
  - Time stamps
  - Payment status
- "Load More Orders" pagination
- Search functionality

### 9. Dispatch/Delivery Management

#### Track Deliveries
- Assigned/Unassigned filter
- Rider tracking capabilities
- Delivery time management
- "Start Tracking" functionality
- Integration with delivery fleet

### 10. Reporting System

#### Report Types

##### Quick Overview
- Daily snapshot
- Total orders count
- Amount collected
- Sales amount
- Payment method breakdown
- Channel breakdown (POS vs Web)

##### Summary Report
- Detailed daily report
- Start/End time selection
- Export capabilities

##### Item Sales Report
- Total items sold
- Revenue by product
- GST breakdown
- Gross sale vs Net sale
- Discount tracking
- Average rate calculations
- Category-wise performance

##### Void Items Report
- Cancelled/voided items tracking
- Reason codes (e.g., "Quality Issue")
- Staff member who voided
- Timestamp tracking
- Original vs adjusted quantities

##### Riders Report
- Delivery driver performance
- Order completion metrics
- (Shows when delivery riders active)

##### X Report (Staff Performance)
- Individual staff metrics:
  - Total orders handled
  - Item sales
  - Gross revenue
  - Net sale
  - Discounts given
  - Payment collections
- Combined platform report
- Service charge tracking
- GST collection breakdown

#### Financial Metrics Tracked
- Total Sales
- Amount Collected
- Service Charges
- Total Discounts
- Gross Revenue
- Net Sale (multiple calculations)
- GST (5% and 15% rates)
- Covers (diner count)
- Payment method distribution

### 11. Settings & Configuration

#### Display Settings
- Dark Mode toggle
- Animation controls
- Notification muting

#### POS Configuration
- POS Enabled toggle
- Show Modifiers On Separate Lines
- Order type enablement (Walk-in, Take-away, etc.)

#### Operational Settings
- Stop Taking Orders (emergency shutdown)
- Sold Out Items management
- Popup notifications

#### Order Type Validations
- Configurable required fields per order type:
  - Walk-In: First Name, Phone Number
  - Take Away: First Name, Phone Number
  - Delivery: First Name, Phone Number, Address
  - Dine-In: First Name, Phone Number
  - Drive-Thru: Configurable
  - Kiosk: First Name, Phone Number

### 12. Integration Points

#### Third-Party Platforms
- Foodpanda menu integration
  - Dietary filters (Halal, Vegetarian, Vegan, Gluten Free, Lactose Free)
  - Separate menu management
  - Order reception from food delivery platforms

#### Multi-Channel Architecture
- Web ordering platform
- POS terminals
- Kitchen displays
- Mobile/tablet interfaces
- Self-service kiosks

### 13. Security & Access Control

#### Authentication Levels
- 6-digit access codes
- Personal passwords
- Role-based permissions
- Session management

#### Audit Features
- User action tracking
- Void reason documentation
- Financial reconciliation
- Time-stamped activities

### 14. Technical Infrastructure

#### Web-Based System
- URL structure: pos.eposmatic.com/[module]/[action]
- Multi-tenant architecture (brand_id, tenant_id parameters)
- Real-time synchronization
- Responsive design for various devices

#### System Requirements
- Internet connectivity for cloud features
- Time synchronization for accurate operations
- Modern web browser support

### 15. Business Intelligence

#### Performance Metrics
- Sales by time period
- Popular items tracking
- Staff productivity
- Payment method preferences
- Order type distribution
- Peak hour analysis
- Discount impact analysis

#### Operational Insights
- Table turnover rates
- Average order values
- Service times
- Void/waste tracking
- Customer patterns

## Key System Features Summary

1. **Comprehensive Order Management**: Six distinct ordering channels with specialized workflows
2. **Advanced Table Management**: Visual floor plans with real-time status
3. **Integrated Kitchen Operations**: KDS with pipeline visibility
4. **Multi-Payment Processing**: Various payment methods with split payment capability
5. **Robust Reporting**: Financial, operational, and staff performance analytics
6. **Customer Database**: Information collection and management
7. **Promotional Tools**: Deals, discounts, and special offers management
8. **Multi-Platform Integration**: Third-party delivery services and internal channels
9. **Security & Access Control**: Multi-level authentication and role management
10. **Real-Time Operations**: Live updates across all system components

## User Roles Identified

1. **Cashiers**: Order taking and payment processing
2. **Kitchen Staff**: Order preparation via KDS
3. **Delivery Riders**: Order delivery management
4. **Managers**: Reporting and system configuration
5. **Customers**: Self-service kiosk interaction
6. **System Administrators**: Full system access and settings

## Business Benefits

- Streamlined operations across multiple service channels
- Real-time visibility into restaurant operations
- Comprehensive financial tracking and reporting
- Improved customer service through information management
- Reduced errors through systematic workflows
- Enhanced kitchen efficiency via KDS
- Data-driven decision making through analytics
- Flexible configuration for different business needs