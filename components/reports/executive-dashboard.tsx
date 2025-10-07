'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from 'lucide-react'
// import { ReportData } from '@/app/(authenticated)/reports/page'
import { cn } from '@/lib/utils'

interface ExecutiveDashboardProps {
  data: any
  isLoading?: boolean
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// KPI Card Component
function KPICard({
  title,
  value,
  change,
  icon: Icon,
  color,
  prefix = '$',
  suffix = '',
  decimals = 0,
}: {
  title: string
  value: number
  change?: number
  icon: any
  color: string
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const isPositive = change && change > 0
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    pink: 'bg-pink-100 text-pink-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(circle at top right, ${color} 0%, transparent 70%)`,
          }}
        />
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn('p-3 rounded-lg', colorClasses[color as keyof typeof colorClasses])}>
              <Icon className="h-6 w-6" />
            </div>
            {change !== undefined && (
              <Badge
                variant="outline"
                className={cn(
                  'flex items-center gap-1',
                  isPositive ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
                )}
              >
                {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(change)}%
              </Badge>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold">
              {prefix}
              <CountUp
                start={0}
                end={value}
                duration={2}
                separator=","
                decimals={decimals}
              />
              {suffix}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Performance Gauge Component
function PerformanceGauge({ value, label }: { value: number; label: string }) {
  const getColor = (val: number) => {
    if (val >= 90) return '#10b981'
    if (val >= 70) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="56"
            stroke={getColor(value)}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: '0 352' }}
            animate={{ strokeDasharray: `${(value / 100) * 352} 352` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute">
          <p className="text-3xl font-bold">{value}%</p>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>
    </div>
  )
}

export function ExecutiveDashboard({ data, isLoading }: ExecutiveDashboardProps) {
  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

  // Prepare chart data
  const salesTrendData = data.sales.byHour.slice(-12).map(item => ({
    ...item,
    projected: Math.floor(item.value * 1.1),
  }))

  const categoryData = data.sales.byCategory.map((cat: any, index: any) => ({
    ...cat,
    fill: COLORS[index % COLORS.length],
  }))

  const performanceData = [
    { subject: 'Sales', A: 95, fullMark: 100 },
    { subject: 'Service', A: 88, fullMark: 100 },
    { subject: 'Quality', A: 92, fullMark: 100 },
    { subject: 'Speed', A: 85, fullMark: 100 },
    { subject: 'Satisfaction', A: data.customers.satisfaction, fullMark: 100 },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Revenue"
          value={data.sales.total}
          change={data.sales.growth}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Orders Today"
          value={data.sales.count}
          change={8.5}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title="Active Customers"
          value={data.customers.total}
          change={12.3}
          icon={Users}
          color="purple"
        />
        <KPICard
          title="Avg Order Value"
          value={data.customers.avgOrderValue}
          change={5.2}
          icon={Target}
          color="orange"
          decimals={2}
        />
        <KPICard
          title="Efficiency Score"
          value={data.staff.efficiency}
          change={3.1}
          icon={Zap}
          color="pink"
          prefix=""
          suffix="%"
          decimals={1}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Hourly sales with projections</CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Projection
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={salesTrendData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="url(#salesGradient)"
                  strokeWidth={2}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#ec4899"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  name="Projected"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
            <CardDescription>Sales distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: $${entry.value.toLocaleString()}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Radar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Multi-dimensional performance analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceData}>
                <PolarGrid strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Efficiency Gauges */}
        <Card>
          <CardHeader>
            <CardTitle>Operational Efficiency</CardTitle>
            <CardDescription>Key operational metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PerformanceGauge value={data.operational.kitchenEfficiency} label="Kitchen" />
            <PerformanceGauge value={data.operational.tableUtilization} label="Table Utilization" />
            <PerformanceGauge value={data.staff.efficiency} label="Staff Efficiency" />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.products.topSelling.slice(0, 3).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="text-sm font-medium">{product.name}</span>
                </div>
                <span className="text-sm text-gray-600">{product.quantity}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Inventory Alerts
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.predictions.inventoryAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{alert.item}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    alert.daysLeft <= 1
                      ? 'text-red-600 border-red-200'
                      : alert.daysLeft <= 3
                      ? 'text-orange-600 border-orange-200'
                      : 'text-gray-600 border-gray-200'
                  )}
                >
                  {alert.daysLeft} days
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.operational.peakHours.slice(0, 3).map((hour, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{hour.hour}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(hour.orders / 200) * 100} className="w-20 h-2" />
                  <span className="text-sm text-gray-600">{hour.orders}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New Customers</span>
              <Badge>{data.customers.new}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Order Time</span>
              <Badge>{data.staff.avgOrderTime}m</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Waste %</span>
              <Badge className={data.operational.wastePercentage < 3 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                {data.operational.wastePercentage}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}