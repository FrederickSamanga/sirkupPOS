'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { KitchenOrder, KitchenOrderItem } from '@/app/(authenticated)/kitchen/page'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, differenceInMinutes } from 'date-fns'
import {
  Clock,
  ChefHat,
  Flame,
  AlertCircle,
  CheckCircle,
  Package,
  Timer,
  Users,
  Star,
  Zap,
  Eye,
  ChevronRight,
  Truck,
  Home,
  ShoppingBag,
  XCircle,
} from 'lucide-react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface KitchenBoardProps {
  orders: KitchenOrder[]
  onUpdateStatus: (orderId: string, status: KitchenOrder['status']) => void
  onBumpOrder: (orderId: string) => void
  onUpdateItemStatus: (orderId: string, itemId: string, status: KitchenOrderItem['status']) => void
  onSelectOrder: (order: KitchenOrder) => void
}

const COLUMNS: {
  id: KitchenOrder['status']
  title: string
  color: string
  icon: any
}[] = [
  { id: 'NEW', title: 'New Orders', color: 'bg-gray-100', icon: Package },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100', icon: ChefHat },
  { id: 'READY', title: 'Ready', color: 'bg-green-100', icon: CheckCircle },
]

const TYPE_ICONS = {
  WALK_IN: { icon: Users, label: 'Walk-in' },
  TAKEAWAY: { icon: ShoppingBag, label: 'Takeaway' },
  DELIVERY: { icon: Truck, label: 'Delivery' },
  DINE_IN: { icon: Home, label: 'Dine-in' },
}

// Order Card Component
function OrderCard({
  order,
  onBump,
  onUpdateItemStatus,
  onSelectOrder,
  isDragging,
}: {
  order: KitchenOrder
  onBump: () => void
  onUpdateItemStatus: (itemId: string, status: KitchenOrderItem['status']) => void
  onSelectOrder: () => void
  isDragging?: boolean
}) {
  const now = new Date()
  const createdAt = new Date(order.createdAt)
  const waitTime = differenceInMinutes(now, createdAt)

  // Determine urgency color based on wait time
  const getUrgencyColor = () => {
    if (order.priority === 'RUSH') return 'border-red-500 bg-red-50'
    if (order.priority === 'VIP') return 'border-yellow-500 bg-yellow-50'
    if (waitTime > 20) return 'border-orange-500 bg-orange-50'
    if (waitTime > 15) return 'border-yellow-400 bg-yellow-50'
    return 'border-gray-200 bg-white'
  }

  const typeInfo = TYPE_ICONS[order.type]
  const TypeIcon = typeInfo.icon

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: order.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            'cursor-move border-2 transition-all hover:shadow-lg',
            getUrgencyColor(),
            isDragging && 'opacity-50'
          )}
        >
          <CardContent className="p-3 space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">#{order.orderNumber}</span>
                {order.priority === 'RUSH' && (
                  <Badge className="bg-red-500 text-white animate-pulse">
                    <Zap className="h-3 w-3 mr-1" />
                    RUSH
                  </Badge>
                )}
                {order.priority === 'VIP' && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    VIP
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectOrder()
                }}
                className="h-6 w-6"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>

            {/* Order Type & Table/Customer */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <TypeIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">{typeInfo.label}</span>
              </div>
              {order.tableNumber && (
                <Badge variant="outline" className="text-xs">
                  Table {order.tableNumber}
                </Badge>
              )}
              {order.customerName && (
                <span className="text-xs text-gray-600">{order.customerName}</span>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className={cn(
                'h-4 w-4',
                waitTime > 20 ? 'text-red-500' : waitTime > 15 ? 'text-orange-500' : 'text-gray-500'
              )} />
              <span className={cn(
                'text-sm font-medium',
                waitTime > 20 ? 'text-red-600' : waitTime > 15 ? 'text-orange-600' : 'text-gray-600'
              )}>
                {formatDistanceToNow(createdAt, { addSuffix: false })}
              </span>
              {order.targetTime && (
                <span className="text-xs text-gray-500">
                  / {order.preparationTime}m target
                </span>
              )}
            </div>

            <Separator className="my-2" />

            {/* Items */}
            <div className="space-y-1">
              {order.items.map(item => (
                <motion.div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const nextStatus = item.status === 'PENDING' ? 'PREPARING' :
                                         item.status === 'PREPARING' ? 'READY' : 'PENDING'
                        onUpdateItemStatus(item.id, nextStatus)
                      }}
                      className={cn(
                        'w-4 h-4 rounded-full border-2 transition-all',
                        item.status === 'READY'
                          ? 'bg-green-500 border-green-500'
                          : item.status === 'PREPARING'
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'bg-white border-gray-300 hover:border-gray-500'
                      )}
                    />
                    <span className={cn(
                      'font-medium',
                      item.status === 'READY' && 'line-through text-gray-400'
                    )}>
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                  {item.modifiers && item.modifiers.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {item.modifiers.length} mod
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>

            {order.notes && (
              <>
                <Separator className="my-2" />
                <div className="flex items-start gap-1">
                  <AlertCircle className="h-3 w-3 text-orange-500 mt-0.5" />
                  <p className="text-xs text-gray-600">{order.notes}</p>
                </div>
              </>
            )}

            {/* Actions */}
            {order.status === 'READY' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2"
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    onBump()
                  }}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Bump Order
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export function KitchenBoard({
  orders,
  onUpdateStatus,
  onBumpOrder,
  onUpdateItemStatus,
  onSelectOrder,
}: KitchenBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const ordersByStatus = useMemo(() => {
    const grouped: Record<KitchenOrder['status'], KitchenOrder[]> = {
      NEW: [],
      IN_PROGRESS: [],
      READY: [],
      COMPLETED: [],
    }

    orders.forEach(order => {
      if (grouped[order.status]) {
        grouped[order.status].push(order)
      }
    })

    // Sort by priority and time
    Object.keys(grouped).forEach(status => {
      grouped[status as KitchenOrder['status']].sort((a, b) => {
        // Rush orders first
        if (a.priority === 'RUSH' && b.priority !== 'RUSH') return -1
        if (a.priority !== 'RUSH' && b.priority === 'RUSH') return 1
        // VIP orders second
        if (a.priority === 'VIP' && b.priority !== 'VIP') return -1
        if (a.priority !== 'VIP' && b.priority === 'VIP') return 1
        // Then by creation time
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
    })

    return grouped
  }, [orders])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeOrder = orders.find(o => o.id === active.id)

      if (activeOrder) {
        // Find which column it was dropped into
        const newStatus = COLUMNS.find(col =>
          ordersByStatus[col.id].some(o => o.id === over.id)
        )?.id || (over.id as KitchenOrder['status'])

        if (newStatus && newStatus !== activeOrder.status) {
          onUpdateStatus(activeOrder.id, newStatus)
        }
      }
    }

    setActiveId(null)
  }

  const activeOrder = activeId ? orders.find(o => o.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-3 gap-4 h-full">
        {COLUMNS.map(column => {
          const Icon = column.icon
          const columnOrders = ordersByStatus[column.id] || []

          return (
            <div
              key={column.id}
              className={cn(
                'flex flex-col rounded-lg p-4',
                column.color
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-gray-700" />
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <Badge variant="secondary" className="ml-2">
                    {columnOrders.length}
                  </Badge>
                </div>
              </div>

              {/* Orders */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                <SortableContext
                  items={columnOrders.map(o => o.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence>
                    {columnOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onBump={() => onBumpOrder(order.id)}
                        onUpdateItemStatus={(itemId, status) =>
                          onUpdateItemStatus(order.id, itemId, status)
                        }
                        onSelectOrder={() => onSelectOrder(order)}
                        isDragging={activeId === order.id}
                      />
                    ))}
                  </AnimatePresence>
                </SortableContext>

                {columnOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                    <Icon className="h-8 w-8 mb-2" />
                    <p className="text-sm">No orders</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeOrder && (
          <OrderCard
            order={activeOrder}
            onBump={() => {}}
            onUpdateItemStatus={() => {}}
            onSelectOrder={() => {}}
            isDragging
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}