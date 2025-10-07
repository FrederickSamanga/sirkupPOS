'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import {
  ChefHat,
  Volume2,
  VolumeX,
  RefreshCw,
  Eye,
  EyeOff,
  Grid3x3,
  List,
  Users,
  BarChart3,
  Settings,
  Clock,
  Zap,
} from 'lucide-react'

interface KitchenHeaderProps {
  stats: {
    newOrders: number
    inProgress: number
    ready: number
    rushOrders: number
    delayedOrders: number
  }
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  autoRefresh: boolean
  setAutoRefresh: (enabled: boolean) => void
  showMetrics: boolean
  setShowMetrics: (show: boolean) => void
  viewMode: 'board' | 'list' | 'expeditor'
  setViewMode: (mode: 'board' | 'list' | 'expeditor') => void
}

export function KitchenHeader({
  stats,
  soundEnabled,
  setSoundEnabled,
  autoRefresh,
  setAutoRefresh,
  showMetrics,
  setShowMetrics,
  viewMode,
  setViewMode,
}: KitchenHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <ChefHat className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Kitchen Display</h1>
            <p className="text-sm text-gray-600">Real-time order management</p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-3 pl-4 border-l">
          {stats.rushOrders > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-600">
                {stats.rushOrders} Rush
              </span>
            </motion.div>
          )}
          {stats.delayedOrders > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1"
            >
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-orange-600">
                {stats.delayedOrders} Delayed
              </span>
            </motion.div>
          )}
          {autoRefresh && (
            <div className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 text-green-500 animate-spin" />
              <span className="text-sm text-green-600">Live</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* View Mode Switcher */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'board' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('board')}
            className="h-7 px-2"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-7 px-2"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'expeditor' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('expeditor')}
            className="h-7 px-2"
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>

        <div className="border-l mx-2 h-6" />

        {/* Controls */}
        <Button
          variant={showMetrics ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowMetrics(!showMetrics)}
        >
          {showMetrics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Metrics</span>
        </Button>

        <Button
          variant={soundEnabled ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        <Button
          variant={autoRefresh ? 'default' : 'outline'}
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
        </Button>

        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}