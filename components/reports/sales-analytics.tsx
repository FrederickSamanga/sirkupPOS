'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  Scatter,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  DollarSign,
  ShoppingCart,
  Filter,
  Download,
  Eye,
  Target,
  Zap,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
// import { ReportData } from '@/app/(authenticated)/reports/page'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface SalesAnalyticsProps {
  data: any
  isLoading?: boolean
}

export function SalesAnalytics({ data, isLoading }: SalesAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [comparisonMode, setComparisonMode] = useState(false)
  const [drillDownView, setDrillDownView] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Prepare comparison data
  const comparisonData = data.sales.byHour.map((item, index) => ({
    ...item,
    previousValue: Math.floor(item.value * (0.8 + Math.random() * 0.4)),
    target: Math.floor(item.value * 1.1),
  }))

  // Sales funnel data
  const funnelData = [
    { stage: 'Views', value: 5000, conversion: '100%' },
    { stage: 'Add to Cart', value: 2500, conversion: '50%' },
    { stage: 'Checkout', value: 1800, conversion: '72%' },
    { stage: 'Purchase', value: 1234, conversion: '68.5%' },
  ]

  // Payment method trends
  const paymentTrends = data.sales.byPaymentMethod.map((method, index) => ({
    ...method,
    trend: index === 0 ? 12 : index === 1 ? 8 : -5,
    icon: index === 0 ? '💵' : index === 1 ? '💳' : '📱',
  }))

  // Calculate key metrics
  const averageOrderValue = data.sales.total / data.sales.count
  const peakSalesHour = data.sales.byHour.reduce((max, item) =>
    item.value > max.value ? item : max
  )
  const salesVelocity = data.sales.total / 24 // Per hour average

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="font-medium">${entry.value.toLocaleString()}</span>
            </div>
          ))}
          {comparisonMode && payload[0]?.payload?.previousValue && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm text-gray-600">
                Change: {payload[0].value > payload[0].payload.previousValue ? '+' : ''}
                {((payload[0].value - payload[0].payload.previousValue) / payload[0].payload.previousValue * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={comparisonMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setComparisonMode(!comparisonMode)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Compare
          </Button>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Insights
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setDrillDownView('revenue')}
          className="cursor-pointer"
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 text-green-600" />
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {data.sales.growth}%
                </Badge>
              </div>
              <p className="text-2xl font-bold">${data.sales.total.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(data.sales.growth * 5, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setDrillDownView('orders')}
          className="cursor-pointer"
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Real-time
                </Badge>
              </div>
              <p className="text-2xl font-bold">{data.sales.count.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Total Orders</p>
              <p className="text-xs text-gray-500 mt-2">
                Avg: ${averageOrderValue.toFixed(2)} per order
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setDrillDownView('velocity')}
          className="cursor-pointer"
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  Peak: {peakSalesHour.hour}
                </Badge>
              </div>
              <p className="text-2xl font-bold">${Math.floor(salesVelocity).toLocaleString()}/hr</p>
              <p className="text-sm text-gray-600 mt-1">Sales Velocity</p>
              <p className="text-xs text-gray-500 mt-2">
                Peak: ${peakSalesHour.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={() => setDrillDownView('targets')}
          className="cursor-pointer"
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-8 w-8 text-orange-600" />
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  89% achieved
                </Badge>
              </div>
              <p className="text-2xl font-bold">$175,000</p>
              <p className="text-sm text-gray-600 mt-1">Monthly Target</p>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                  initial={{ width: 0 }}
                  animate={{ width: '89%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend with Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sales Trend Analysis</span>
              {comparisonMode && (
                <Badge className="bg-gray-100 text-gray-700">
                  Comparison Mode
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Hourly sales performance {comparisonMode && 'vs previous period'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={comparisonData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Brush dataKey="hour" height={30} stroke="#4f46e5" />

                {comparisonMode && (
                  <Area
                    type="monotone"
                    dataKey="previousValue"
                    stroke="#9ca3af"
                    fill="#f3f4f6"
                    strokeWidth={2}
                    name="Previous Period"
                  />
                )}

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  fill="url(#salesGradient)"
                  strokeWidth={3}
                  name="Current Period"
                />

                {comparisonMode && (
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    name="Target"
                    dot={false}
                  />
                )}

                <Scatter dataKey="value" fill="#4f46e5" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Customer journey from view to purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{stage.value.toLocaleString()}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          index === 0 ? 'bg-green-50 text-green-700 border-green-200' :
                          parseFloat(stage.conversion) > 70 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                        )}
                      >
                        {stage.conversion}
                      </Badge>
                    </div>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <motion.div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-lg',
                        index === 0 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        index === 1 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                        index === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                        'bg-gradient-to-r from-orange-400 to-orange-500'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.value / funnelData[0].value) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                    />
                    {index < funnelData.length - 1 && (
                      <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Payment Methods Distribution */}
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-medium mb-4">Payment Methods</h4>
              <div className="space-y-3">
                {paymentTrends.map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <p className="font-medium">{method.method}</p>
                        <p className="text-xs text-gray-600">
                          ${method.value.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'flex items-center gap-1',
                        method.trend > 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
                      )}
                    >
                      {method.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {Math.abs(method.trend)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Period Comparison</CardTitle>
          <CardDescription>Compare sales across different time periods</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.sales.byDay}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]}>
                    {data.sales.byDay.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.value > 25000 ? '#10b981' : entry.value > 15000 ? '#4f46e5' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                  <ReferenceLine y={20000} stroke="#f59e0b" strokeDasharray="3 3" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="weekly" className="mt-4">
              <div className="text-center py-12 text-gray-500">
                Weekly comparison chart
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="mt-4">
              <div className="text-center py-12 text-gray-500">
                Monthly comparison chart
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Drill-down Modal */}
      <AnimatePresence>
        {drillDownView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDrillDownView(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                Detailed {drillDownView} Analysis
              </h3>
              <p className="text-gray-600">
                Deep dive into {drillDownView} metrics and trends...
              </p>
              <Button
                className="mt-4"
                onClick={() => setDrillDownView(null)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}