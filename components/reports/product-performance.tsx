'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Treemap,
} from 'recharts'
import {
  Package,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  Info,
  ArrowUp,
  ArrowDown,
  Flame,
  Snowflake,
  Coffee,
  Pizza,
  Cake,
  Wine,
  ChevronRight,
  Filter,
  Download,
} from 'lucide-react'
// import { ReportData } from '@/app/(authenticated)/reports/page'
import { cn } from '@/lib/utils'

interface ProductPerformanceProps {
  data: any
  isLoading?: boolean
}

// Generate heatmap data
const generateHeatmapData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`)

  return days.flatMap((day, dayIndex) =>
    hours.map((hour, hourIndex) => ({
      day,
      hour,
      value: Math.floor(Math.random() * 100),
      x: hourIndex,
      y: dayIndex,
    }))
  )
}

// Product category icons
const CATEGORY_ICONS = {
  'Hot Beverages': Coffee,
  'Main Courses': Pizza,
  'Desserts': Cake,
  'Appetizers': Wine,
} as const

export function ProductPerformance({ data, isLoading }: ProductPerformanceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [timeRange, setTimeRange] = useState('week')
  const heatmapData = generateHeatmapData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Enhanced product data with performance indicators
  const enhancedProducts = data.products.topSelling.map((product, index) => ({
    ...product,
    profitMargin: 35 + Math.random() * 30,
    rating: 3.5 + Math.random() * 1.5,
    trend: Math.random() > 0.5 ? 'up' : 'down',
    trendValue: Math.floor(Math.random() * 20),
    stockLevel: Math.floor(Math.random() * 100),
  }))

  // Scatter plot data for margin vs volume analysis
  const marginVolumeData = enhancedProducts.map(product => ({
    x: product.quantity,
    y: product.profitMargin,
    z: product.revenue,
    name: product.name,
  }))

  // Treemap data for category performance
  const treemapData = data.products.categoryPerformance.map(cat => ({
    name: cat.category,
    size: cat.revenue,
    items: cat.items,
  }))

  // Custom heatmap cell
  const HeatmapCell = ({ x, y, value }: any) => {
    const getColor = (val: number) => {
      if (val > 80) return '#dc2626'
      if (val > 60) return '#f97316'
      if (val > 40) return '#fbbf24'
      if (val > 20) return '#84cc16'
      return '#e5e7eb'
    }

    return (
      <motion.rect
        x={x * 60 + 50}
        y={y * 30 + 20}
        width={55}
        height={25}
        fill={getColor(value)}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: (x + y) * 0.01 }}
        whileHover={{ scale: 1.1 }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Flame className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-100 text-green-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                Hot Item
              </Badge>
            </div>
            <p className="text-lg font-bold">{data.products.topSelling[0].name}</p>
            <p className="text-sm text-gray-600 mt-1">
              {data.products.topSelling[0].quantity} sold today
            </p>
            <Progress
              value={100}
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Star className="h-8 w-8 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">
                Top Rated
              </Badge>
            </div>
            <p className="text-lg font-bold">Chocolate Cake</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i <= 4.8 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  )}
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">4.8</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Based on 234 reviews</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">
                Trending
              </Badge>
            </div>
            <p className="text-lg font-bold">{data.products.trending[0].name}</p>
            <p className="text-sm text-gray-600 mt-1">
              +{data.products.trending[0].growth}% this week
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${data.products.trending[0].growth}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-700">
                Low Stock
              </Badge>
            </div>
            <p className="text-lg font-bold">3 Items</p>
            <p className="text-sm text-gray-600 mt-1">Need restocking</p>
            <div className="mt-3 space-y-1">
              {data.predictions.inventoryAlerts.slice(0, 2).map((alert, i) => (
                <p key={i} className="text-xs text-orange-700">
                  • {alert.item}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Product Sales Heatmap</CardTitle>
          <CardDescription>
            Peak selling times for all products (darker = more sales)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <svg width={800} height={250}>
              {/* Hour labels */}
              {Array.from({ length: 12 }, (_, i) => (
                <text
                  key={`hour-${i}`}
                  x={i * 60 + 75}
                  y={15}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {i + 8}:00
                </text>
              ))}

              {/* Day labels */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <text
                  key={`day-${i}`}
                  x={40}
                  y={i * 30 + 37}
                  textAnchor="end"
                  className="text-xs fill-gray-600"
                >
                  {day}
                </text>
              ))}

              {/* Heatmap cells */}
              {heatmapData.map((cell, index) => (
                <HeatmapCell key={index} {...cell} />
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-xs text-gray-600">Low</span>
            <div className="flex gap-1">
              <div className="w-6 h-4 bg-gray-200 rounded" />
              <div className="w-6 h-4 bg-green-400 rounded" />
              <div className="w-6 h-4 bg-yellow-400 rounded" />
              <div className="w-6 h-4 bg-orange-500 rounded" />
              <div className="w-6 h-4 bg-red-600 rounded" />
            </div>
            <span className="text-xs text-gray-600">High</span>
          </div>
        </CardContent>
      </Card>

      {/* Product Analysis Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Revenue distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8884d8"
              >
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                          <p className="font-medium">{payload[0].payload.name}</p>
                          <p className="text-sm">Revenue: ${payload[0].value.toLocaleString()}</p>
                          <p className="text-sm">Items: {payload[0].payload.items}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </Treemap>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Margin vs Volume Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Profitability Analysis</CardTitle>
            <CardDescription>Product margin vs sales volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name="Quantity" />
                <YAxis dataKey="y" name="Margin %" />
                <ZAxis dataKey="z" name="Revenue" range={[50, 400]} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border">
                          <p className="font-medium">{payload[0].payload.name}</p>
                          <p className="text-sm">Quantity: {payload[0].payload.x}</p>
                          <p className="text-sm">Margin: {payload[0].payload.y.toFixed(1)}%</p>
                          <p className="text-sm">Revenue: ${payload[0].payload.z}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter name="Products" data={marginVolumeData} fill="#8884d8">
                  {marginVolumeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.y > 50 ? '#10b981' : entry.y > 30 ? '#3b82f6' : '#f59e0b'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Product Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Comprehensive product performance metrics</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enhancedProducts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(product.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {product.quantity} sold
                        </span>
                        <span className="text-sm text-gray-600">
                          ${product.revenue.toLocaleString()} revenue
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {product.profitMargin.toFixed(1)}% margin
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {product.trend === 'up' ? (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={cn(
                          'text-sm font-medium',
                          product.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {product.trendValue}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">vs last week</p>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          className={cn(
                            'h-3 w-3',
                            i <= product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Stock indicator */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Stock Level</span>
                    <span>{product.stockLevel}%</span>
                  </div>
                  <Progress
                    value={product.stockLevel}
                    className={cn(
                      'h-1.5',
                      product.stockLevel < 30 && 'bg-red-200'
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}