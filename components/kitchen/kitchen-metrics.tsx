'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import {
  Clock,
  TrendingUp,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle,
  ChefHat,
  Timer,
  Target,
  BarChart3,
  Users,
  Package,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface KitchenMetricsProps {
  stats: {
    newOrders: number
    inProgress: number
    ready: number
    avgPrepTime: number
    ordersLastHour: number
    efficiency: number
    rushOrders: number
    delayedOrders: number
  }
}

export function KitchenMetrics({ stats }: KitchenMetricsProps) {
  const metrics = [
    {
      label: 'New Orders',
      value: stats.newOrders,
      icon: Package,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      trend: null,
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      icon: ChefHat,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: null,
    },
    {
      label: 'Ready',
      value: stats.ready,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: null,
    },
    {
      label: 'Avg Prep Time',
      value: `${stats.avgPrepTime}m`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '-2m',
      trendUp: true,
    },
    {
      label: 'Orders/Hour',
      value: stats.ordersLastHour,
      icon: Activity,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      trend: '+15%',
      trendUp: true,
    },
    {
      label: 'Efficiency',
      value: `${stats.efficiency}%`,
      icon: Target,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      progress: stats.efficiency,
      trend: '+3%',
      trendUp: true,
    },
    {
      label: 'Rush Orders',
      value: stats.rushOrders,
      icon: Zap,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      pulse: stats.rushOrders > 0,
    },
    {
      label: 'Delayed',
      value: stats.delayedOrders,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      pulse: stats.delayedOrders > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
          >
            <Card className={cn(
              'relative overflow-hidden transition-shadow hover:shadow-md',
              metric.pulse && 'animate-pulse'
            )}>
              <CardContent className="p-3">
                {/* Background Pattern */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, currentColor 0%, transparent 50%)`,
                  }}
                />

                <div className="relative">
                  {/* Icon */}
                  <div className={cn('inline-flex p-2 rounded-lg mb-2', metric.bgColor)}>
                    <Icon className={cn('h-4 w-4', metric.color)} />
                  </div>

                  {/* Value & Trend */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-xs text-gray-600 mt-1">{metric.label}</p>
                    </div>

                    {metric.trend && (
                      <div className={cn(
                        'flex items-center text-xs font-medium',
                        metric.trendUp ? 'text-green-600' : 'text-red-600'
                      )}>
                        <TrendingUp className={cn(
                          'h-3 w-3',
                          !metric.trendUp && 'rotate-180'
                        )} />
                        <span className="ml-1">{metric.trend}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {metric.progress !== undefined && (
                    <div className="mt-2">
                      <Progress
                        value={metric.progress}
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}