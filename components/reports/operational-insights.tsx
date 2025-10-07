'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Activity,
  Clock,
  Users,
  Utensils,
  Timer,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Gauge,
  Zap,
  Coffee,
  Trash2,
  Package,
  ThermometerSun,
  Droplets,
  Wind,
  ChevronRight,
} from 'lucide-react'
// import { ReportData } from '@/app/(authenticated)/reports/page'
import { cn } from '@/lib/utils'

interface OperationalInsightsProps {
  data: any
  isLoading?: boolean
}

export function OperationalInsights({ data, isLoading }: OperationalInsightsProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('today')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Table turnover data
  const tableTurnoverData = [
    { time: '11:00', turnover: 2.5, target: 3 },
    { time: '12:00', turnover: 4.2, target: 3 },
    { time: '13:00', turnover: 4.8, target: 3 },
    { time: '14:00', turnover: 3.2, target: 3 },
    { time: '15:00', turnover: 2.8, target: 3 },
    { time: '16:00', turnover: 2.5, target: 3 },
    { time: '17:00', turnover: 3.0, target: 3 },
    { time: '18:00', turnover: 4.5, target: 3 },
    { time: '19:00', turnover: 5.2, target: 3 },
    { time: '20:00', turnover: 4.8, target: 3 },
  ]

  // Service time distribution
  const serviceTimeData = [
    { range: '0-5 min', orders: 234, percentage: 20 },
    { range: '5-10 min', orders: 456, percentage: 40 },
    { range: '10-15 min', orders: 312, percentage: 27 },
    { range: '15-20 min', orders: 98, percentage: 8 },
    { range: '20+ min', orders: 56, percentage: 5 },
  ]

  // Kitchen station performance
  const kitchenStationData = [
    { station: 'Grill', efficiency: 92, orders: 234, avgTime: 8 },
    { station: 'Salad', efficiency: 95, orders: 189, avgTime: 5 },
    { station: 'Dessert', efficiency: 88, orders: 145, avgTime: 6 },
    { station: 'Beverages', efficiency: 97, orders: 456, avgTime: 3 },
  ]

  // Waste tracking
  const wasteData = [
    { category: 'Food Prep', amount: 12, cost: 234 },
    { category: 'Spoilage', amount: 8, cost: 156 },
    { category: 'Customer Returns', amount: 5, cost: 89 },
    { category: 'Overproduction', amount: 15, cost: 298 },
  ]

  // Resource utilization
  const resourceData = [
    { resource: 'Kitchen Staff', utilization: 85, optimal: 80 },
    { resource: 'Dining Tables', utilization: data.operational.tableUtilization, optimal: 75 },
    { resource: 'Equipment', utilization: 78, optimal: 85 },
    { resource: 'Storage', utilization: 65, optimal: 70 },
  ]

  // Quality metrics
  const qualityMetrics = [
    { metric: 'Order Accuracy', score: 96, target: 95 },
    { metric: 'Food Temperature', score: 94, target: 90 },
    { metric: 'Presentation', score: 92, target: 90 },
    { metric: 'Portion Control', score: 89, target: 90 },
  ]

  // Efficiency gauge data for radial chart
  const efficiencyData = [
    { name: 'Kitchen', value: data.operational.kitchenEfficiency, fill: '#10b981' },
    { name: 'Service', value: 85, fill: '#3b82f6' },
    { name: 'Overall', value: data.staff.efficiency, fill: '#8b5cf6' },
  ]

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Key Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Gauge className="h-8 w-8 text-blue-600" />
              <Badge className="bg-blue-100 text-blue-700">
                {data.operational.kitchenEfficiency}%
              </Badge>
            </div>
            <p className="text-lg font-bold">Kitchen Efficiency</p>
            <Progress value={data.operational.kitchenEfficiency} className="mt-3 h-2" />
            <p className="text-xs text-gray-500 mt-2">Target: 85%</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-100 text-green-700">Good</Badge>
            </div>
            <p className="text-lg font-bold">Table Utilization</p>
            <Progress value={data.operational.tableUtilization} className="mt-3 h-2" />
            <p className="text-xs text-gray-500 mt-2">{data.operational.tableUtilization}% occupied</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Timer className="h-8 w-8 text-orange-600" />
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                {data.operational.avgTurnoverTime}m
              </Badge>
            </div>
            <p className="text-lg font-bold">Table Turnover</p>
            <p className="text-sm text-gray-600 mt-1">{data.operational.avgTurnoverTime} min avg</p>
            <p className="text-xs text-gray-500 mt-2">Target: 45 min</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
              <Badge className={cn(
                'text-white',
                data.operational.wastePercentage < 3 ? 'bg-green-500' : 'bg-orange-500'
              )}>
                {data.operational.wastePercentage}%
              </Badge>
            </div>
            <p className="text-lg font-bold">Waste Level</p>
            <Progress
              value={data.operational.wastePercentage * 10}
              className="mt-3 h-2"
            />
            <p className="text-xs text-gray-500 mt-2">Target: &lt;3%</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Efficiency Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Turnover Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Table Turnover Rate</CardTitle>
            <CardDescription>Hourly table turnover vs target</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tableTurnoverData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="turnover"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Actual"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Types</CardTitle>
            <CardDescription>Distribution by service type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.operational.orderTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type}: ${percentage}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.operational.orderTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {data.operational.orderTypes.map((type, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold">{type.count}</p>
                  <p className="text-xs text-gray-600">{type.type}</p>
                  <Badge variant="outline" className="mt-1">
                    {type.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kitchen Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Kitchen Station Performance</CardTitle>
          <CardDescription>Efficiency and output by station</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="efficiency" className="w-full">
            <TabsList>
              <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
              <TabsTrigger value="timing">Service Time</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
            </TabsList>

            <TabsContent value="efficiency" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kitchenStationData.map((station, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{station.station}</h4>
                      <Badge
                        variant="outline"
                        className={cn(
                          station.efficiency > 90
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        )}
                      >
                        {station.efficiency}%
                      </Badge>
                    </div>
                    <Progress value={station.efficiency} className="h-2 mb-3" />
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Orders:</span>
                        <span className="font-medium">{station.orders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Time:</span>
                        <span className="font-medium">{station.avgTime}m</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart data={efficiencyData} cx="50%" cy="50%" innerRadius="10%" outerRadius="90%">
                    <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" label={{ position: 'insideStart', fill: '#fff' }} />
                    <Legend />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {serviceTimeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index <= 1 ? '#10b981' : index <= 2 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="quality" className="mt-4">
              <div className="space-y-4">
                {qualityMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{metric.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Target: {metric.target}%</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              metric.score >= metric.target
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            )}
                          >
                            {metric.score}%
                          </Badge>
                        </div>
                      </div>
                      <Progress
                        value={metric.score}
                        className={cn(
                          'h-2',
                          metric.score >= metric.target && 'bg-green-100'
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Resource & Waste Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Utilization</CardTitle>
            <CardDescription>Current vs optimal utilization rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={resourceData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="resource" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilization" fill="#3b82f6" name="Current" />
                <Bar dataKey="optimal" fill="#10b981" name="Optimal" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Waste Management */}
        <Card>
          <CardHeader>
            <CardTitle>Waste Tracking</CardTitle>
            <CardDescription>Waste categories and reduction opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wasteData.map((waste, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{waste.category}</span>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{waste.amount} kg</Badge>
                      <span className="text-sm font-medium">${waste.cost}</span>
                    </div>
                  </div>
                  <Progress
                    value={(waste.amount / 40) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900">Reduction Opportunity</p>
                  <p className="text-xs text-orange-700 mt-1">
                    Overproduction waste is 25% above target. Consider adjusting prep quantities.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours Analysis</CardTitle>
          <CardDescription>Order volume and staffing recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.operational.peakHours}>
              <defs>
                <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#3b82f6"
                fill="url(#peakGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.operational.peakHours.map((hour, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">{hour.hour}</p>
                <p className="text-lg font-bold">{hour.orders}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'mt-2',
                    hour.orders > 160 ? 'bg-red-50 text-red-700 border-red-200' :
                    hour.orders > 140 ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  )}
                >
                  {hour.orders > 160 ? 'Very High' : hour.orders > 140 ? 'High' : 'Normal'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}