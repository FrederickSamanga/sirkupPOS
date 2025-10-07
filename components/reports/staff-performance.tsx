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
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import {
  UserCheck,
  Award,
  Clock,
  TrendingUp,
  Star,
  Target,
  Zap,
  Trophy,
  Medal,
  ChevronUp,
  ChevronDown,
  Timer,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Filter,
} from 'lucide-react'
// import { ReportData } from '@/app/(authenticated)/reports/page'
import { cn } from '@/lib/utils'

interface StaffPerformanceProps {
  data: any
  isLoading?: boolean
}

export function StaffPerformance({ data, isLoading }: StaffPerformanceProps) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('today')
  const [sortBy, setSortBy] = useState('efficiency')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Enhanced staff data with additional metrics
  const enhancedStaffData = data.staff.performance.map((staff, index) => ({
    ...staff,
    avatar: `/avatars/staff-${index + 1}.jpg`,
    rating: 4.2 + Math.random() * 0.8,
    speed: 85 + Math.random() * 15,
    accuracy: 92 + Math.random() * 8,
    customerSatisfaction: 88 + Math.random() * 12,
    attendance: 95 + Math.random() * 5,
    rank: index + 1,
    trend: index < 2 ? 'up' : index === 2 ? 'stable' : 'down',
    badges: index === 0 ? ['Top Performer', 'Speed King'] : index === 1 ? ['Customer Favorite'] : [],
  }))

  // Radar chart data for selected staff
  const radarData = selectedStaff
    ? [
        { subject: 'Efficiency', value: 95 },
        { subject: 'Speed', value: 88 },
        { subject: 'Accuracy', value: 92 },
        { subject: 'Customer Service', value: 90 },
        { subject: 'Teamwork', value: 85 },
        { subject: 'Attendance', value: 98 },
      ]
    : []

  // Shift performance data
  const shiftData = [
    { shift: 'Morning', orders: 234, revenue: 12450, efficiency: 92 },
    { shift: 'Afternoon', orders: 456, revenue: 23400, efficiency: 88 },
    { shift: 'Evening', orders: 378, revenue: 19800, efficiency: 94 },
  ]

  // Tasks completion data
  const tasksData = [
    { name: 'Order Taking', completed: 98, target: 100 },
    { name: 'Order Delivery', completed: 92, target: 95 },
    { name: 'Table Service', completed: 88, target: 90 },
    { name: 'Customer Interaction', completed: 95, target: 90 },
    { name: 'Upselling', completed: 78, target: 80 },
  ]

  // Get rank badge color
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-gray-50 text-gray-600 border-gray-200'
  }

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {enhancedStaffData.slice(0, 3).map((staff, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={cn(
              'relative overflow-hidden cursor-pointer hover:shadow-lg transition-all',
              index === 0 && 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
            )}>
              {index === 0 && (
                <div className="absolute top-2 right-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
              )}
              {index === 1 && (
                <div className="absolute top-2 right-2">
                  <Medal className="h-8 w-8 text-gray-500" />
                </div>
              )}
              {index === 2 && (
                <div className="absolute top-2 right-2">
                  <Medal className="h-8 w-8 text-orange-500" />
                </div>
              )}

              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={staff.avatar} />
                    <AvatarFallback>{staff.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{staff.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getRankColor(staff.rank)}>
                        #{staff.rank}
                      </Badge>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star
                            key={i}
                            className={cn(
                              'h-3 w-3',
                              i <= staff.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Efficiency</span>
                    <div className="flex items-center gap-2">
                      <Progress value={staff.efficiency} className="w-20 h-2" />
                      <span className="text-sm font-medium">{staff.efficiency}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Orders</span>
                    <span className="text-sm font-medium">{staff.orders}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue</span>
                    <span className="text-sm font-medium">${staff.revenue.toLocaleString()}</span>
                  </div>
                </div>

                {staff.badges.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    {staff.badges.map((badge, i) => (
                      <Badge key={i} className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-600" />
              <Badge variant="outline">Active</Badge>
            </div>
            <p className="text-2xl font-bold">{data.staff.performance.length}</p>
            <p className="text-sm text-gray-600 mt-1">Staff Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="h-8 w-8 text-yellow-600" />
              <Badge className="bg-yellow-100 text-yellow-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3.2%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{data.staff.efficiency}%</p>
            <p className="text-sm text-gray-600 mt-1">Avg Efficiency</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-100 text-green-700">Good</Badge>
            </div>
            <p className="text-2xl font-bold">{data.staff.avgOrderTime}min</p>
            <p className="text-sm text-gray-600 mt-1">Avg Order Time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="h-8 w-8 text-purple-600" />
              <Badge className="bg-purple-100 text-purple-700">94%</Badge>
            </div>
            <p className="text-2xl font-bold">8/10</p>
            <p className="text-sm text-gray-600 mt-1">Targets Met</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>Staff efficiency and productivity metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enhancedStaffData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#3b82f6" name="Efficiency %" />
                <Bar dataKey="speed" fill="#10b981" name="Speed %" />
                <Bar dataKey="accuracy" fill="#f59e0b" name="Accuracy %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Shift Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Shift Performance</CardTitle>
            <CardDescription>Performance metrics by shift</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={shiftData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shift" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Orders"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Efficiency %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Staff Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Details</CardTitle>
              <CardDescription>Comprehensive performance metrics for all staff</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="w-full">
            <TabsList>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="mt-4">
              <div className="space-y-2">
                {enhancedStaffData.map((staff, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedStaff(staff.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback>{staff.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-600">
                              {staff.orders} orders
                            </span>
                            <span className="text-sm text-gray-600">
                              ${staff.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{staff.efficiency}%</p>
                          <p className="text-xs text-gray-500">Efficiency</p>
                        </div>

                        <div className="flex items-center gap-1">
                          {staff.trend === 'up' ? (
                            <ChevronUp className="h-4 w-4 text-green-600" />
                          ) : staff.trend === 'down' ? (
                            <ChevronDown className="h-4 w-4 text-red-600" />
                          ) : (
                            <Activity className="h-4 w-4 text-gray-400" />
                          )}
                        </div>

                        <Badge variant="outline" className={getRankColor(staff.rank)}>
                          #{staff.rank}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <div className="space-y-4">
                {tasksData.map((task, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{task.name}</span>
                      <span className="text-sm text-gray-600">
                        {task.completed}/{task.target}
                      </span>
                    </div>
                    <Progress
                      value={(task.completed / task.target) * 100}
                      className={cn(
                        'h-2',
                        task.completed >= task.target && 'bg-green-100'
                      )}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-4">
              {selectedStaff ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name={selectedStaff}
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Select a staff member to view their skill radar
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}