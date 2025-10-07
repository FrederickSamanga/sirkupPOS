'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  Wallet,
  PiggyBank,
  Calculator,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  BarChart3,
  Filter,
} from 'lucide-react'
// import { ReportData } from '@/app/(authenticated)/reports/page'
import { cn } from '@/lib/utils'

interface FinancialReportsProps {
  data: any
  isLoading?: boolean
}

export function FinancialReports({ data, isLoading }: FinancialReportsProps) {
  const [period, setPeriod] = useState('month')
  const [comparisonEnabled, setComparisonEnabled] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Monthly financial data
  const monthlyData = [
    { month: 'Jan', revenue: 145000, costs: 92000, profit: 53000, margin: 36.5 },
    { month: 'Feb', revenue: 152000, costs: 95000, profit: 57000, margin: 37.5 },
    { month: 'Mar', revenue: 168000, costs: 98000, profit: 70000, margin: 41.7 },
    { month: 'Apr', revenue: 175000, costs: 102000, profit: 73000, margin: 41.7 },
    { month: 'May', revenue: data.financial.revenue, costs: data.financial.costs, profit: data.financial.profit, margin: data.financial.profitMargin },
  ]

  // Cost breakdown
  const costBreakdown = [
    { category: 'Food & Beverages', amount: 35000, percentage: 35.4, color: '#3b82f6' },
    { category: 'Labor', amount: 28000, percentage: 28.3, color: '#10b981' },
    { category: 'Rent & Utilities', amount: 15000, percentage: 15.2, color: '#f59e0b' },
    { category: 'Marketing', amount: 8000, percentage: 8.1, color: '#8b5cf6' },
    { category: 'Operations', amount: 7000, percentage: 7.1, color: '#ec4899' },
    { category: 'Other', amount: 5765, percentage: 5.9, color: '#6b7280' },
  ]

  // Revenue streams
  const revenueStreams = [
    { stream: 'Dine-in', amount: 78000, growth: 12, trend: 'up' },
    { stream: 'Takeaway', amount: 45000, growth: 8, trend: 'up' },
    { stream: 'Delivery', amount: 28000, growth: -5, trend: 'down' },
    { stream: 'Catering', amount: 5789, growth: 15, trend: 'up' },
  ]

  // Cash flow data
  const cashFlowData = [
    { day: 'Mon', inflow: 22000, outflow: 15000, net: 7000 },
    { day: 'Tue', inflow: 18000, outflow: 12000, net: 6000 },
    { day: 'Wed', inflow: 20000, outflow: 14000, net: 6000 },
    { day: 'Thu', inflow: 24000, outflow: 16000, net: 8000 },
    { day: 'Fri', inflow: 32000, outflow: 20000, net: 12000 },
    { day: 'Sat', inflow: 38000, outflow: 22000, net: 16000 },
    { day: 'Sun', inflow: 28000, outflow: 18000, net: 10000 },
  ]

  // Tax breakdown
  const taxBreakdown = [
    { type: 'Sales Tax', amount: 8934, status: 'paid' },
    { type: 'Income Tax', amount: 3633, status: 'pending' },
    { type: 'Payroll Tax', amount: 2456, status: 'paid' },
    { type: 'Property Tax', amount: 1234, status: 'upcoming' },
  ]

  // Key financial metrics
  const metrics = {
    grossMargin: ((data.financial.revenue - 65000) / data.financial.revenue * 100),
    netMargin: (data.financial.profit / data.financial.revenue * 100),
    operatingMargin: ((data.financial.profit + 12000) / data.financial.revenue * 100),
    returnOnInvestment: 24.5,
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <span className="text-sm" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="font-medium">${entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-100 text-green-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </Badge>
            </div>
            <p className="text-2xl font-bold">${data.financial.revenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
            <Progress value={89} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <PiggyBank className="h-8 w-8 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">
                {data.financial.profitMargin}%
              </Badge>
            </div>
            <p className="text-2xl font-bold">${data.financial.profit.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">Net Profit</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-gray-500">Margin:</span>
              <span className="font-medium">{data.financial.profitMargin}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="h-8 w-8 text-orange-600" />
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                Costs
              </Badge>
            </div>
            <p className="text-2xl font-bold">${data.financial.costs.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">Operating Costs</p>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-gray-500">% of Revenue:</span>
              <span className="font-medium">{((data.financial.costs / data.financial.revenue) * 100).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Receipt className="h-8 w-8 text-purple-600" />
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                Taxes
              </Badge>
            </div>
            <p className="text-2xl font-bold">${data.financial.taxes.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">Tax Obligations</p>
            <div className="mt-3 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">75% paid</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Profit Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Financial Performance</CardTitle>
              <CardDescription>Revenue, costs, and profit trends</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlyData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                fill="url(#revenueGradient)"
                strokeWidth={2}
                name="Revenue"
              />

              <Bar
                yAxisId="left"
                dataKey="costs"
                fill="#f59e0b"
                opacity={0.7}
                name="Costs"
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Profit"
                dot={{ fill: '#3b82f6' }}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="margin"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Margin %"
                dot={false}
              />

              <ReferenceLine y={50000} stroke="#ef4444" strokeDasharray="3 3" yAxisId="left" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Operating expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {costBreakdown.map((cost, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cost.color }} />
                    <span className="text-sm">{cost.category}</span>
                  </div>
                  <span className="text-sm font-medium">${cost.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Streams */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Streams</CardTitle>
            <CardDescription>Income sources and growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueStreams.map((stream, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{stream.stream}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">${stream.amount.toLocaleString()}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'flex items-center gap-1',
                          stream.trend === 'up' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
                        )}
                      >
                        {stream.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(stream.growth)}%
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={(stream.amount / data.financial.revenue) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {((stream.amount / data.financial.revenue) * 100).toFixed(1)}% of total revenue
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Quick Metrics */}
            <div className="mt-6 pt-6 border-t grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Avg Transaction</p>
                <p className="text-lg font-bold">${(data.financial.revenue / data.sales.count).toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Daily Average</p>
                <p className="text-lg font-bold">${Math.floor(data.financial.revenue / 30).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
          <CardDescription>Daily cash inflow and outflow</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="flow" className="w-full">
            <TabsList>
              <TabsTrigger value="flow">Cash Flow</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="taxes">Taxes</TabsTrigger>
            </TabsList>

            <TabsContent value="flow" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inflow" stackId="a" fill="#10b981" name="Inflow" />
                  <Bar dataKey="outflow" stackId="a" fill="#ef4444" name="Outflow" />
                  <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} name="Net" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="metrics" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Gross Margin</span>
                    <span className="font-bold text-lg">{metrics.grossMargin.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.grossMargin} className="h-2" />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Net Margin</span>
                    <span className="font-bold text-lg">{metrics.netMargin.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.netMargin} className="h-2" />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Operating Margin</span>
                    <span className="font-bold text-lg">{metrics.operatingMargin.toFixed(1)}%</span>
                  </div>
                  <Progress value={metrics.operatingMargin} className="h-2" />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">ROI</span>
                    <span className="font-bold text-lg">{metrics.returnOnInvestment}%</span>
                  </div>
                  <Progress value={metrics.returnOnInvestment} className="h-2" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="taxes" className="mt-4">
              <div className="space-y-3">
                {taxBreakdown.map((tax, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium">{tax.type}</p>
                        <p className="text-sm text-gray-600">${tax.amount.toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        tax.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                        tax.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      )}
                    >
                      {tax.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {tax.status === 'pending' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {tax.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}