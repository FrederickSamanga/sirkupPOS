'use client'

import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  Users,
  Clock,
  TrendingUp,
  Home,
  Calendar,
  Sparkles,
  Activity,
  BarChart3,
} from 'lucide-react'

interface TableStatsCardsProps {
  stats: {
    totalTables: number
    availableTables: number
    occupiedTables: number
    reservedTables: number
    cleaningTables: number
    totalGuests: number
    occupancyRate: number
    averageTurnover: string
  }
}

export function TableStatsCards({ stats }: TableStatsCardsProps) {
  const cards = [
    {
      title: 'Total Tables',
      value: stats.totalTables,
      icon: Home,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      delay: 0,
    },
    {
      title: 'Available',
      value: stats.availableTables,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      delay: 0.1,
    },
    {
      title: 'Occupied',
      value: stats.occupiedTables,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      delay: 0.2,
    },
    {
      title: 'Reserved',
      value: stats.reservedTables,
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      delay: 0.3,
    },
    {
      title: 'Cleaning',
      value: stats.cleaningTables,
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      delay: 0.4,
    },
    {
      title: 'Total Guests',
      value: stats.totalGuests,
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      delay: 0.5,
    },
    {
      title: 'Occupancy',
      value: `${stats.occupancyRate}%`,
      icon: BarChart3,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      delay: 0.6,
    },
    {
      title: 'Avg. Turnover',
      value: stats.averageTurnover,
      icon: Clock,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      delay: 0.7,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: card.delay,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-lg ${card.bgColor}`}
                  >
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-gray-600 mt-1">{card.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}