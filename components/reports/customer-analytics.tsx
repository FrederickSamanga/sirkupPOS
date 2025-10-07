'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sankey,
} from 'recharts'
import {
  Users,
  UserPlus,
  UserCheck,
  Heart,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Gift,
  Crown,
  Sparkles,
  ChevronRight,
  Coffee,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomerAnalyticsProps {
  data: any
  isLoading?: boolean
}

export function CustomerAnalytics({ data, isLoading }: CustomerAnalyticsProps) {
  const [selectedSegment, setSelectedSegment] = useState('all')
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Customer segments data
  const segmentData = [
    { segment: 'VIP', count: 234, value: 45000, color: '#fbbf24' },
    { segment: 'Regular', count: 1456, value: 78000, color: '#3b82f6' },
    { segment: 'New', count: data.customers.new, value: 12000, color: '#10b981' },
    { segment: 'Occasional', count: 892, value: 23000, color: '#8b5cf6' },
  ]

  // Customer lifetime value distribution
  const lifetimeValueData = [
    { range: '$0-50', customers: 567 },
    { range: '$50-100', customers: 892 },
    { range: '$100-200', customers: 1234 },
    { range: '$200-500', customers: 678 },
    { range: '$500+', customers: 234 },
  ]

  // Visit frequency data
  const frequencyData = [
    { period: 'Daily', customers: 123, percentage: 5 },
    { period: 'Weekly', customers: 567, percentage: 23 },
    { period: '2-3 times/month', customers: 892, percentage: 36 },
    { period: 'Monthly', customers: 678, percentage: 27 },
    { period: 'Rarely', customers: 234, percentage: 9 },
  ]

  // Customer journey stages
  const journeyData = [
    { stage: 'Awareness', customers: 5000 },
    { stage: 'First Visit', customers: 2500 },
    { stage: 'Return Customer', customers: 1500 },
    { stage: 'Regular', customers: 800 },
    { stage: 'VIP', customers: 234 },
  ]

  // Satisfaction metrics
  const satisfactionData = [
    { metric: 'Service', score: 94 },
    { metric: 'Food Quality', score: 92 },
    { metric: 'Ambiance', score: 88 },
    { metric: 'Value', score: 86 },
    { metric: 'Speed', score: 90 },
  ]

  // Enhanced customer data
  const enhancedCustomers = data.customers.topCustomers.map((customer: any, index: any) => ({
    ...customer,
    lastVisit: `${Math.floor(Math.random() * 7) + 1} days ago`,
    frequency: index === 0 ? 'Daily' : index === 1 ? 'Weekly' : 'Monthly',
    favoriteItem: index === 0 ? 'Cappuccino' : index === 1 ? 'Caesar Salad' : 'Club Sandwich',
    loyaltyPoints: Math.floor(Math.random() * 1000) + 200,
    segment: index === 0 ? 'VIP' : 'Regular',
    satisfaction: 85 + Math.random() * 15,
  }))

  // Retention cohort data
  const cohortData = [
    { month: 'Jan', new: 234, m1: 180, m2: 156, m3: 134, m4: 120, m5: 110 },
    { month: 'Feb', new: 256, m1: 198, m2: 167, m3: 145 },
    { month: 'Mar', new: 278, m1: 212, m2: 178 },
    { month: 'Apr', new: 301, m1: 234 },
    { month: 'May', new: 289 },
  ]

  // Customer acquisition channels
  const channelData = [
    { channel: 'Walk-in', customers: 1234, conversion: 34 },
    { channel: 'Online', customers: 892, conversion: 28 },
    { channel: 'Referral', customers: 567, conversion: 45 },
    { channel: 'Social Media', customers: 456, conversion: 22 },
  ]

  const COLORS = ['#fbbf24', '#3b82f6', '#10b981', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-600" />
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Total
              </Badge>
            </div>
            <p className="text-2xl font-bold">{data.customers.total.toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">Total Customers</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <UserPlus className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-100 text-green-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{data.customers.new}</p>
            <p className="text-sm text-gray-600 mt-1">New This Month</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <UserCheck className="h-8 w-8 text-purple-600" />
              <Badge variant="outline" className="text-purple-600 border-purple-200">
                Loyal
              </Badge>
            </div>
            <p className="text-2xl font-bold">{data.customers.returning}</p>
            <p className="text-sm text-gray-600 mt-1">Returning</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="h-8 w-8 text-orange-600" />
              <Badge className="bg-orange-100 text-orange-700">
                {data.customers.satisfaction}%
              </Badge>
            </div>
            <p className="text-2xl font-bold">Excellent</p>
            <p className="text-sm text-gray-600 mt-1">Satisfaction</p>
          </CardContent>
        </Card>

        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Gift className="h-8 w-8 text-pink-600" />
              <Badge variant="outline" className="text-pink-600 border-pink-200">
                AOV
              </Badge>
            </div>
            <p className="text-2xl font-bold">${data.customers.avgOrderValue.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">Avg Order Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Distribution of customers by segment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ segment, percentage = 0 }) => `${segment}: ${percentage.toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {segmentData.map((entry,index: any) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-3 mt-6">
              {segmentData.map((segment: any, index: any) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="text-sm font-medium">{segment.segment}</span>
                  </div>
                  <Badge variant="outline">{segment.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Journey Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Journey</CardTitle>
            <CardDescription>Progression through loyalty stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {journeyData.map((stage: any, index: any) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-sm">{stage.stage}</span>
                    </div>
                    <span className="text-sm text-gray-600">{stage.customers.toLocaleString()}</span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <motion.div
                      className={cn(
                        'h-full rounded-lg',
                        index === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                        index === 1 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        index === 2 ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                        index === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-gradient-to-r from-yellow-400 to-yellow-500'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${(stage.customers / journeyData[0].customers) * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                  {index < journeyData.length - 1 && (
                    <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Satisfaction Scores */}
            <div className="mt-8 pt-6 border-t">
              <h4 className="text-sm font-medium mb-4">Satisfaction Breakdown</h4>
              <div className="space-y-3">
                {satisfactionData.map((item: any, index: any) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.metric}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={item.score} className="w-24 h-2" />
                      <span className="text-sm font-medium w-12 text-right">{item.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit Frequency & Lifetime Value */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visit Frequency</CardTitle>
            <CardDescription>How often customers visit</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customers" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Lifetime Value</CardTitle>
            <CardDescription>Distribution by spending range</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={lifetimeValueData}>
                <defs>
                  <linearGradient id="clvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="customers"
                  stroke="#8b5cf6"
                  fill="url(#clvGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Your most valuable customers</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enhancedCustomers.map((customer: any, index: any) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedCustomer(customer.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`/avatars/customer-${index + 1}.jpg`} />
                      <AvatarFallback>{customer.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{customer.name}</p>
                        {customer.segment === 'VIP' && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            customer.segment === 'VIP'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                              : 'bg-blue-50 text-blue-700 border-blue-300'
                          )}
                        >
                          {customer.segment}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{customer.orders} orders</span>
                        <span>${customer.spent.toLocaleString()} spent</span>
                        <span>{customer.lastVisit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-lg font-bold">{customer.loyaltyPoints}</p>
                      <p className="text-xs text-gray-500">Points</p>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star
                          key={i}
                          className={cn(
                            'h-3 w-3',
                            i <= Math.floor(customer.satisfaction / 20)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Coffee className="h-3 w-3" />
                      {customer.favoriteItem}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {customer.frequency}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Mail className="h-3 w-3 mr-1" />
                    Contact
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}