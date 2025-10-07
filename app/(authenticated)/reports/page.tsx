'use client'

import { useState } from 'react'
import { Navigation } from '@/components/ui/navigation'
import {
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign, ArrowUp, ArrowDown,
  Calendar, Download, Filter, ShoppingCart, Clock, Package, Target,
  PieChart, Activity, Zap, Star, Award, AlertCircle
} from 'lucide-react'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Comprehensive mock data
  const stats = {
    revenue: { value: 45678.90, change: 12.5, target: 50000 },
    orders: { value: 287, change: 8.2, target: 300 },
    avgOrderValue: { value: 159.16, change: -2.3, target: 165 },
    customers: { value: 234, change: 15.4, target: 250 },
    tableOccupancy: { value: 78, change: 5.2, target: 85 },
    orderCompletionTime: { value: 18.5, change: -8.1, target: 15 },
  }

  const hourlyData = [
    { hour: '9AM', sales: 1890, orders: 15, customers: 12 },
    { hour: '10AM', sales: 2250, orders: 18, customers: 15 },
    { hour: '11AM', sales: 3890, orders: 28, customers: 24 },
    { hour: '12PM', sales: 5450, orders: 42, customers: 38 },
    { hour: '1PM', sales: 6890, orders: 48, customers: 42 },
    { hour: '2PM', sales: 4650, orders: 35, customers: 30 },
    { hour: '3PM', sales: 3450, orders: 28, customers: 22 },
    { hour: '4PM', sales: 3890, orders: 32, customers: 28 },
    { hour: '5PM', sales: 5250, orders: 38, customers: 35 },
    { hour: '6PM', sales: 6990, orders: 45, customers: 40 },
    { hour: '7PM', sales: 7450, orders: 52, customers: 48 },
    { hour: '8PM', sales: 5890, orders: 42, customers: 38 },
  ]

  const topProducts = [
    { name: 'Signature Burger', quantity: 78, revenue: 1248.22, trend: 18.5, profit: 45, category: 'Mains' },
    { name: 'Caesar Salad', quantity: 56, revenue: 728.00, trend: 12.3, profit: 62, category: 'Salads' },
    { name: 'Premium Steak', quantity: 34, revenue: 2176.00, trend: -4.2, profit: 52, category: 'Mains' },
    { name: 'Espresso', quantity: 156, revenue: 624.00, trend: 22.7, profit: 75, category: 'Beverages' },
    { name: 'Fresh OJ', quantity: 89, revenue: 534.00, trend: 8.1, profit: 68, category: 'Beverages' },
    { name: 'Pasta Carbonara', quantity: 45, revenue: 787.50, trend: 15.2, profit: 58, category: 'Mains' },
    { name: 'Tiramisu', quantity: 38, revenue: 418.00, trend: 9.5, profit: 65, category: 'Desserts' },
  ]

  const categoryPerformance = [
    { name: 'Mains', revenue: 15678, orders: 145, avgPrice: 108.12, growth: 12.5 },
    { name: 'Beverages', revenue: 8234, orders: 289, avgPrice: 28.49, growth: 18.2 },
    { name: 'Desserts', revenue: 3456, orders: 98, avgPrice: 35.27, growth: 8.7 },
    { name: 'Salads', revenue: 4567, orders: 112, avgPrice: 40.78, growth: -2.3 },
    { name: 'Appetizers', revenue: 5123, orders: 156, avgPrice: 32.84, growth: 15.6 },
  ]

  const paymentMethods = [
    { method: 'Credit Card', count: 178, amount: 28456.90, percentage: 62 },
    { method: 'Cash', count: 67, amount: 10234.50, percentage: 22 },
    { method: 'Digital Wallet', count: 42, amount: 6987.50, percentage: 16 },
  ]

  const maxSales = Math.max(...hourlyData.map(d => d.sales))
  const progressPercent = (stats.revenue.value / stats.revenue.target) * 100

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-2">Real-time business intelligence and insights</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>

              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {[
              { title: 'Revenue', value: `$${stats.revenue.value.toLocaleString()}`, change: stats.revenue.change, icon: DollarSign, color: 'emerald', target: stats.revenue.target },
              { title: 'Orders', value: stats.orders.value, change: stats.orders.change, icon: ShoppingCart, color: 'blue', target: stats.orders.target },
              { title: 'Avg Order', value: `$${stats.avgOrderValue.value.toFixed(2)}`, change: stats.avgOrderValue.change, icon: TrendingUp, color: 'purple', target: stats.avgOrderValue.target },
              { title: 'Customers', value: stats.customers.value, change: stats.customers.change, icon: Users, color: 'orange', target: stats.customers.target },
              { title: 'Table Occupancy', value: `${stats.tableOccupancy.value}%`, change: stats.tableOccupancy.change, icon: Target, color: 'pink', target: stats.tableOccupancy.target },
              { title: 'Avg Prep Time', value: `${stats.orderCompletionTime.value}m`, change: stats.orderCompletionTime.change, icon: Clock, color: 'indigo', target: stats.orderCompletionTime.target },
            ].map((stat, i) => {
              const isPositive = stat.change > 0
              const progress = (parseFloat(stat.value.toString().replace(/[^0-9.]/g, '')) / stat.target) * 100

              return (
                <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 bg-${stat.color}-100 rounded-lg`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      isPositive ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      {Math.abs(stat.change)}%
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-500 mb-2">{stat.title}</div>
                  {/* Progress bar to target */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`bg-${stat.color}-600 h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Sales Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Hourly Sales Performance
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-900 rounded-full" />
                    <span className="text-xs text-gray-600">Sales</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {hourlyData.map((data, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-16 text-sm font-medium text-gray-700">{data.hour}</div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3 group-hover:from-gray-900"
                          style={{ width: `${(data.sales / maxSales) * 100}%` }}
                        >
                          <span className="text-white text-xs font-bold">${data.sales}</span>
                        </div>
                      </div>
                      <div className="w-20 text-sm text-gray-600 text-right">{data.orders} orders</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Performance */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Performance
              </h2>
              <div className="space-y-4">
                {categoryPerformance.map((cat, i) => {
                  const colors = ['emerald', 'blue', 'purple', 'orange', 'pink']
                  const color = colors[i % colors.length]
                  const isGrowth = cat.growth > 0

                  return (
                    <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{cat.name}</span>
                        <div className={`flex items-center gap-1 text-xs font-semibold ${
                          isGrowth ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isGrowth ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {Math.abs(cat.growth)}%
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">${cat.revenue.toLocaleString()}</div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{cat.orders} orders</span>
                        <span className="font-medium">${cat.avgPrice.toFixed(2)} avg</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Top Performing Products
                </h2>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 text-sm bg-gray-50 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Categories</option>
                  <option value="mains">Mains</option>
                  <option value="beverages">Beverages</option>
                  <option value="desserts">Desserts</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">#</th>
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Product</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Qty</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Trend</th>
                      <th className="text-right py-3 px-2 text-xs font-semibold text-gray-600 uppercase">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, i) => {
                      const isPositive = product.trend > 0
                      return (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold">
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.category}</div>
                          </td>
                          <td className="py-3 px-2 text-right font-semibold text-gray-900">{product.quantity}</td>
                          <td className="py-3 px-2 text-right font-bold text-gray-900">${product.revenue.toFixed(2)}</td>
                          <td className="py-3 px-2 text-right">
                            <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                              isPositive ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                              {Math.abs(product.trend)}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              {product.profit}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Payment Methods Distribution
              </h2>

              <div className="space-y-6">
                {paymentMethods.map((method, i) => {
                  const colors = ['gray', 'blue', 'purple']
                  const color = colors[i]

                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{method.method}</span>
                        <span className="text-sm font-bold text-gray-900">${method.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-3 relative overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 bg-${color}-600 rounded-full transition-all duration-500`}
                            style={{ width: `${method.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-700 w-12 text-right">{method.percentage}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{method.count} transactions</div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Total Processed</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${paymentMethods.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}