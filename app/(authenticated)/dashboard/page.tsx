'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/ui/navigation'
import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentOrders } from '@/components/dashboard/recent-orders'
import { SalesChart } from '@/components/dashboard/sales-chart'
import { DollarSign, Users, ShoppingCart, Clock } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalOrders: 0,
    activeOrders: 0,
    avgOrderTime: 0
  })

  useEffect(() => {
    // In a real app, this would fetch data from an API
    setStats({
      todaySales: 2345.67,
      totalOrders: 45,
      activeOrders: 8,
      avgOrderTime: 15
    })
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back to Amaya Cafe POS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Today's Sales"
              value={`$${stats.todaySales.toFixed(2)}`}
              icon={DollarSign}
              trend={+12.5}
            />
            <StatsCard
              title="Total Orders"
              value={stats.totalOrders.toString()}
              icon={ShoppingCart}
              trend={+8.2}
            />
            <StatsCard
              title="Active Orders"
              value={stats.activeOrders.toString()}
              icon={Users}
              trend={0}
            />
            <StatsCard
              title="Avg Order Time"
              value={`${stats.avgOrderTime} min`}
              icon={Clock}
              trend={-2.3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart />
            <RecentOrders />
          </div>
        </div>
      </div>
    </div>
  )
}