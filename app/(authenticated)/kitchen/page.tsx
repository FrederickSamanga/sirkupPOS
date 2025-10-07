'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Navigation } from '@/components/ui/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KitchenBoard } from '@/components/kitchen/kitchen-board'
import { OrderDetailsDrawer } from '@/components/kitchen/order-details-drawer'
import { KitchenMetrics } from '@/components/kitchen/kitchen-metrics'
import { KitchenHeader } from '@/components/kitchen/kitchen-header'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Howl } from 'howler'
import { useHotkeys } from 'react-hotkeys-hook'
import {
  ChefHat,
  Clock,
  Flame,
  AlertCircle,
  Volume2,
  VolumeX,
  Filter,
  RefreshCw,
  Eye,
  Grid3x3,
  List,
  Settings,
  Zap,
  TrendingUp,
  Timer,
  CheckCircle,
  Package,
} from 'lucide-react'

export interface KitchenOrder {
  id: string
  orderNumber: number
  type: 'WALK_IN' | 'TAKEAWAY' | 'DELIVERY' | 'DINE_IN'
  status: 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED'
  priority: 'NORMAL' | 'RUSH' | 'VIP'
  tableNumber?: string
  customerName?: string
  items: KitchenOrderItem[]
  notes?: string
  createdAt: string
  startedAt?: string
  targetTime?: string
  preparationTime: number // in minutes
  station?: 'GRILL' | 'FRY' | 'SALAD' | 'DESSERT' | 'BEVERAGE'
  assignedTo?: string
}

export interface KitchenOrderItem {
  id: string
  name: string
  quantity: number
  modifiers?: string[]
  notes?: string
  status: 'PENDING' | 'PREPARING' | 'READY'
  station?: string
}

interface KitchenStats {
  newOrders: number
  inProgress: number
  ready: number
  avgPrepTime: number
  ordersLastHour: number
  efficiency: number
  rushOrders: number
  delayedOrders: number
}

// Mock data generator
const generateMockOrders = (): KitchenOrder[] => {
  const now = new Date()
  return [
    {
      id: '1',
      orderNumber: 1001,
      type: 'DINE_IN',
      status: 'NEW',
      priority: 'NORMAL',
      tableNumber: 'T5',
      items: [
        { id: '1-1', name: 'Grilled Salmon', quantity: 2, status: 'PENDING', station: 'GRILL' },
        { id: '1-2', name: 'Caesar Salad', quantity: 2, status: 'PENDING', station: 'SALAD' },
        { id: '1-3', name: 'French Fries', quantity: 1, status: 'PENDING', station: 'FRY' },
      ],
      createdAt: new Date(now.getTime() - 2 * 60000).toISOString(),
      preparationTime: 20,
      station: 'GRILL',
    },
    {
      id: '2',
      orderNumber: 1002,
      type: 'TAKEAWAY',
      status: 'IN_PROGRESS',
      priority: 'RUSH',
      customerName: 'John Smith',
      items: [
        { id: '2-1', name: 'Chicken Wings', quantity: 3, status: 'PREPARING', station: 'FRY', modifiers: ['Extra Spicy'] },
        { id: '2-2', name: 'Onion Rings', quantity: 2, status: 'PREPARING', station: 'FRY' },
      ],
      createdAt: new Date(now.getTime() - 8 * 60000).toISOString(),
      startedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
      targetTime: new Date(now.getTime() + 7 * 60000).toISOString(),
      preparationTime: 15,
      station: 'FRY',
      assignedTo: 'Chef Mike',
    },
    {
      id: '3',
      orderNumber: 1003,
      type: 'DELIVERY',
      status: 'NEW',
      priority: 'VIP',
      customerName: 'VIP Customer',
      items: [
        { id: '3-1', name: 'Ribeye Steak', quantity: 1, status: 'PENDING', station: 'GRILL', modifiers: ['Medium Rare'] },
        { id: '3-2', name: 'Lobster Tail', quantity: 1, status: 'PENDING', station: 'GRILL' },
        { id: '3-3', name: 'Chocolate Soufflé', quantity: 1, status: 'PENDING', station: 'DESSERT' },
      ],
      createdAt: new Date(now.getTime() - 1 * 60000).toISOString(),
      preparationTime: 30,
      station: 'GRILL',
      notes: 'VIP Customer - Priority Service',
    },
    {
      id: '4',
      orderNumber: 1004,
      type: 'WALK_IN',
      status: 'IN_PROGRESS',
      priority: 'NORMAL',
      items: [
        { id: '4-1', name: 'Garden Salad', quantity: 1, status: 'READY', station: 'SALAD' },
        { id: '4-2', name: 'Soup of the Day', quantity: 1, status: 'PREPARING', station: 'GRILL' },
      ],
      createdAt: new Date(now.getTime() - 10 * 60000).toISOString(),
      startedAt: new Date(now.getTime() - 7 * 60000).toISOString(),
      preparationTime: 10,
      station: 'SALAD',
    },
    {
      id: '5',
      orderNumber: 1005,
      type: 'DINE_IN',
      status: 'READY',
      priority: 'NORMAL',
      tableNumber: 'T12',
      items: [
        { id: '5-1', name: 'Margherita Pizza', quantity: 1, status: 'READY', station: 'GRILL' },
        { id: '5-2', name: 'Tiramisu', quantity: 2, status: 'READY', station: 'DESSERT' },
      ],
      createdAt: new Date(now.getTime() - 15 * 60000).toISOString(),
      startedAt: new Date(now.getTime() - 12 * 60000).toISOString(),
      preparationTime: 12,
      station: 'GRILL',
    },
  ]
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>(generateMockOrders())
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null)
  const [selectedStation, setSelectedStation] = useState<string>('ALL')
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'expeditor'>('board')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showMetrics, setShowMetrics] = useState(true)
  const [stats, setStats] = useState<KitchenStats>({
    newOrders: 2,
    inProgress: 2,
    ready: 1,
    avgPrepTime: 15,
    ordersLastHour: 12,
    efficiency: 92,
    rushOrders: 1,
    delayedOrders: 0,
  })

  // Sound effects
  const sounds = useRef({
    newOrder: new Howl({ src: ['/sounds/new-order.mp3'], volume: 0.5 }),
    orderReady: new Howl({ src: ['/sounds/order-ready.mp3'], volume: 0.5 }),
    rushOrder: new Howl({ src: ['/sounds/rush-order.mp3'], volume: 0.7 }),
  })

  // Calculate statistics
  useEffect(() => {
    const calculateStats = () => {
      const newOrders = orders.filter(o => o.status === 'NEW').length
      const inProgress = orders.filter(o => o.status === 'IN_PROGRESS').length
      const ready = orders.filter(o => o.status === 'READY').length
      const rushOrders = orders.filter(o => o.priority === 'RUSH').length

      // Calculate delayed orders (orders that exceed their target time)
      const now = new Date()
      const delayedOrders = orders.filter(o => {
        if (o.targetTime && o.status !== 'COMPLETED') {
          return new Date(o.targetTime) < now
        }
        return false
      }).length

      setStats({
        newOrders,
        inProgress,
        ready,
        avgPrepTime: 15,
        ordersLastHour: 12,
        efficiency: 92,
        rushOrders,
        delayedOrders,
      })
    }

    calculateStats()
  }, [orders])

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Simulate new order occasionally
      if (Math.random() > 0.8) {
        const newOrder: KitchenOrder = {
          id: `order-${Date.now()}`,
          orderNumber: 1000 + orders.length + 1,
          type: ['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'WALK_IN'][Math.floor(Math.random() * 4)] as any,
          status: 'NEW',
          priority: Math.random() > 0.8 ? 'RUSH' : 'NORMAL',
          tableNumber: Math.random() > 0.5 ? `T${Math.floor(Math.random() * 20) + 1}` : undefined,
          items: [
            {
              id: `item-${Date.now()}-1`,
              name: 'New Dish',
              quantity: Math.floor(Math.random() * 3) + 1,
              status: 'PENDING',
              station: 'GRILL',
            },
          ],
          createdAt: new Date().toISOString(),
          preparationTime: Math.floor(Math.random() * 20) + 10,
          station: 'GRILL',
        }

        setOrders(prev => [newOrder, ...prev])

        if (soundEnabled) {
          if (newOrder.priority === 'RUSH') {
            sounds.current.rushOrder.play()
          } else {
            sounds.current.newOrder.play()
          }
        }

        toast.success(`New order #${newOrder.orderNumber} received!`)
      }
    }, 15000) // Check for new orders every 15 seconds

    return () => clearInterval(interval)
  }, [orders.length, autoRefresh, soundEnabled])

  // Update order status
  const updateOrderStatus = useCallback((orderId: string, newStatus: KitchenOrder['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated = { ...order, status: newStatus }

        if (newStatus === 'IN_PROGRESS' && !order.startedAt) {
          updated.startedAt = new Date().toISOString()
        }

        if (newStatus === 'READY' && soundEnabled) {
          sounds.current.orderReady.play()
          toast.success(`Order #${order.orderNumber} is ready!`)
        }

        return updated
      }
      return order
    }))
  }, [soundEnabled])

  // Bump order (complete and remove)
  const bumpOrder = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    if (order) {
      updateOrderStatus(orderId, 'COMPLETED')
      setTimeout(() => {
        setOrders(prev => prev.filter(o => o.id !== orderId))
      }, 500)
      toast.success(`Order #${order.orderNumber} completed!`)
    }
  }, [orders, updateOrderStatus])

  // Update item status
  const updateItemStatus = useCallback((orderId: string, itemId: string, status: KitchenOrderItem['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item =>
          item.id === itemId ? { ...item, status } : item
        )

        // Check if all items are ready
        const allReady = updatedItems.every(item => item.status === 'READY')

        return {
          ...order,
          items: updatedItems,
          status: allReady ? 'READY' : order.status === 'NEW' ? 'IN_PROGRESS' : order.status,
        }
      }
      return order
    }))
  }, [])

  // Keyboard shortcuts
  useHotkeys('ctrl+r', () => window.location.reload())
  useHotkeys('ctrl+m', () => setShowMetrics(!showMetrics))
  useHotkeys('ctrl+s', () => setSoundEnabled(!soundEnabled))
  useHotkeys('1', () => setViewMode('board'))
  useHotkeys('2', () => setViewMode('list'))
  useHotkeys('3', () => setViewMode('expeditor'))

  // Filter orders by station
  const filteredOrders = selectedStation === 'ALL'
    ? orders
    : orders.filter(o => o.station === selectedStation)

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        {/* Header */}
        <KitchenHeader
        stats={stats}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        showMetrics={showMetrics}
        setShowMetrics={setShowMetrics}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Metrics Dashboard */}
      <AnimatePresence>
        {showMetrics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <KitchenMetrics stats={stats} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Station Filter */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Station:</span>
        </div>
        <Tabs value={selectedStation} onValueChange={setSelectedStation}>
          <TabsList>
            <TabsTrigger value="ALL">All Stations</TabsTrigger>
            <TabsTrigger value="GRILL">Grill</TabsTrigger>
            <TabsTrigger value="FRY">Fry</TabsTrigger>
            <TabsTrigger value="SALAD">Salad</TabsTrigger>
            <TabsTrigger value="DESSERT">Dessert</TabsTrigger>
            <TabsTrigger value="BEVERAGE">Beverage</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1" />

        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span>Rush</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>VIP</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span>Delayed</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'board' && (
          <KitchenBoard
            orders={filteredOrders}
            onUpdateStatus={updateOrderStatus}
            onBumpOrder={bumpOrder}
            onUpdateItemStatus={updateItemStatus}
            onSelectOrder={setSelectedOrder}
          />
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-500">List view coming soon...</p>
          </div>
        )}

        {viewMode === 'expeditor' && (
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-500">Expeditor view coming soon...</p>
          </div>
        )}
      </div>

      {/* Order Details Drawer */}
      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
          onUpdateItemStatus={updateItemStatus}
          onBump={() => {
            bumpOrder(selectedOrder.id)
            setSelectedOrder(null)
          }}
        />
      )}

        {/* Keyboard Shortcuts Help */}
        <div className="text-xs text-gray-500 mt-2">
          <span className="font-medium">Shortcuts:</span>
          {' '}1/2/3: View modes | Ctrl+M: Metrics | Ctrl+S: Sound | ESC: Close
        </div>
      </div>
    </div>
  )
}