'use client'

import { useState } from 'react'
import { KitchenOrder, KitchenOrderItem } from '@/app/(authenticated)/kitchen/page'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Clock,
  ChefHat,
  User,
  Package,
  AlertCircle,
  CheckCircle,
  Star,
  Zap,
  Timer,
  Truck,
  Home,
  ShoppingBag,
  Users,
  MessageSquare,
  ChevronRight,
  RotateCcw,
  Phone,
  MapPin,
  DollarSign,
  History,
  Flame,
  Utensils,
  Coffee,
  Salad,
  IceCream,
} from 'lucide-react'

interface OrderDetailsDrawerProps {
  order: KitchenOrder
  isOpen: boolean
  onClose: () => void
  onUpdateStatus: (orderId: string, status: KitchenOrder['status']) => void
  onUpdateItemStatus: (orderId: string, itemId: string, status: KitchenOrderItem['status']) => void
  onBump: () => void
}

const TYPE_ICONS = {
  WALK_IN: { icon: Users, label: 'Walk-in', color: 'text-gray-600' },
  TAKEAWAY: { icon: ShoppingBag, label: 'Takeaway', color: 'text-blue-600' },
  DELIVERY: { icon: Truck, label: 'Delivery', color: 'text-green-600' },
  DINE_IN: { icon: Home, label: 'Dine-in', color: 'text-purple-600' },
}

const STATION_ICONS = {
  GRILL: { icon: Flame, label: 'Grill Station', color: 'text-red-500' },
  FRY: { icon: Utensils, label: 'Fry Station', color: 'text-orange-500' },
  SALAD: { icon: Salad, label: 'Salad Station', color: 'text-green-500' },
  DESSERT: { icon: IceCream, label: 'Dessert Station', color: 'text-pink-500' },
  BEVERAGE: { icon: Coffee, label: 'Beverage Station', color: 'text-blue-500' },
}

export function OrderDetailsDrawer({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdateItemStatus,
  onBump,
}: OrderDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState('items')

  const typeInfo = TYPE_ICONS[order.type]
  const TypeIcon = typeInfo.icon

  const stationInfo = order.station ? STATION_ICONS[order.station] : null
  const StationIcon = stationInfo?.icon

  const createdAt = new Date(order.createdAt)
  const waitTime = formatDistanceToNow(createdAt, { addSuffix: false })

  // Calculate progress
  const totalItems = order.items.length
  const readyItems = order.items.filter(item => item.status === 'READY').length
  const progress = totalItems > 0 ? (readyItems / totalItems) * 100 : 0

  // Group items by station
  const itemsByStation = order.items.reduce((acc, item) => {
    const station = item.station || 'OTHER'
    if (!acc[station]) acc[station] = []
    acc[station].push(item)
    return acc
  }, {} as Record<string, KitchenOrderItem[]>)

  const handleItemToggle = (item: KitchenOrderItem) => {
    const nextStatus = item.status === 'PENDING' ? 'PREPARING' :
                      item.status === 'PREPARING' ? 'READY' : 'PENDING'
    onUpdateItemStatus(order.id, item.id, nextStatus)
  }

  const handleStatusChange = (newStatus: KitchenOrder['status']) => {
    onUpdateStatus(order.id, newStatus)
    if (newStatus === 'COMPLETED') {
      onBump()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">#{order.orderNumber}</span>
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
            <Badge
              className={cn(
                order.status === 'NEW' && 'bg-gray-100 text-gray-800',
                order.status === 'IN_PROGRESS' && 'bg-blue-100 text-blue-800',
                order.status === 'READY' && 'bg-green-100 text-green-800'
              )}
            >
              {order.status.replace('_', ' ')}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <TypeIcon className={cn('h-4 w-4', typeInfo.color)} />
                <span>{typeInfo.label}</span>
              </div>
              {order.tableNumber && (
                <Badge variant="outline">Table {order.tableNumber}</Badge>
              )}
              {order.customerName && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {order.customerName}
                </span>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        <div className="my-4 space-y-4">
          {/* Time & Progress */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Wait Time</span>
                  </div>
                  <span className="font-medium">{waitTime}</span>
                </div>

                {order.targetTime && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Target Time</span>
                    </div>
                    <span className="font-medium">{order.preparationTime} min</span>
                  </div>
                )}

                {stationInfo && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {StationIcon && <StationIcon className={cn('h-4 w-4', stationInfo.color)} />}
                      <span className="text-sm text-gray-600">Primary Station</span>
                    </div>
                    <span className="font-medium">{stationInfo.label}</span>
                  </div>
                )}

                {order.assignedTo && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Assigned To</span>
                    </div>
                    <span className="font-medium">{order.assignedTo}</span>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{readyItems}/{totalItems} items</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="items">
                Items ({order.items.length})
              </TabsTrigger>
              <TabsTrigger value="stations">Stations</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            {/* Items Tab */}
            <TabsContent value="items" className="mt-4">
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={cn(
                        'transition-all',
                        item.status === 'READY' && 'bg-green-50 border-green-200'
                      )}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={item.status === 'READY'}
                                onCheckedChange={() => handleItemToggle(item)}
                                className="mt-1"
                              />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    'font-medium',
                                    item.status === 'READY' && 'line-through text-gray-400'
                                  )}>
                                    {item.quantity}x {item.name}
                                  </span>
                                  {item.status === 'PREPARING' && (
                                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                      <ChefHat className="h-3 w-3 mr-1" />
                                      Preparing
                                    </Badge>
                                  )}
                                </div>
                                {item.modifiers && item.modifiers.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {item.modifiers.map((mod, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {mod}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                                {item.notes && (
                                  <p className="text-xs text-gray-600 italic">
                                    Note: {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                            {item.station && STATION_ICONS[item.station as keyof typeof STATION_ICONS] && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                {(() => {
                                  const StationItemIcon = STATION_ICONS[item.station as keyof typeof STATION_ICONS].icon
                                  return <StationItemIcon className="h-3 w-3" />
                                })()}
                                {item.station}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Stations Tab */}
            <TabsContent value="stations" className="mt-4">
              <div className="space-y-3">
                {Object.entries(itemsByStation).map(([station, items]) => {
                  const stationData = STATION_ICONS[station as keyof typeof STATION_ICONS]
                  const Icon = stationData?.icon || Package

                  return (
                    <Card key={station}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={cn('h-5 w-5', stationData?.color)} />
                          <span className="font-medium">
                            {stationData?.label || station}
                          </span>
                          <Badge variant="secondary" className="ml-auto">
                            {items.length} items
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={item.status === 'READY'}
                                onCheckedChange={() => handleItemToggle(item)}
                              />
                              <span className={cn(
                                item.status === 'READY' && 'line-through text-gray-400'
                              )}>
                                {item.quantity}x {item.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Info Tab */}
            <TabsContent value="info" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Order Time</Label>
                  <p className="font-medium">
                    {format(createdAt, 'h:mm a · MMM d, yyyy')}
                  </p>
                </div>

                {order.startedAt && (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Started At</Label>
                    <p className="font-medium">
                      {format(new Date(order.startedAt), 'h:mm a')}
                    </p>
                  </div>
                )}

                {order.notes && (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Order Notes</Label>
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-3">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Status Timeline</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        order.status !== 'NEW' ? 'bg-green-500' : 'bg-gray-300'
                      )} />
                      <span className="text-sm">Order Received</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        ['IN_PROGRESS', 'READY', 'COMPLETED'].includes(order.status)
                          ? 'bg-green-500' : 'bg-gray-300'
                      )} />
                      <span className="text-sm">Preparation Started</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        ['READY', 'COMPLETED'].includes(order.status)
                          ? 'bg-green-500' : 'bg-gray-300'
                      )} />
                      <span className="text-sm">Order Ready</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        order.status === 'COMPLETED' ? 'bg-green-500' : 'bg-gray-300'
                      )} />
                      <span className="text-sm">Order Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="flex-col gap-2">
          {/* Status Actions */}
          <div className="grid grid-cols-2 gap-2 w-full">
            {order.status === 'NEW' && (
              <Button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Start Preparing
              </Button>
            )}

            {order.status === 'IN_PROGRESS' && (
              <Button
                onClick={() => handleStatusChange('READY')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Ready
              </Button>
            )}

            {order.status === 'READY' && (
              <Button
                onClick={onBump}
                className="bg-gray-900 hover:bg-gray-800 col-span-2"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Bump Order
              </Button>
            )}

            <Button variant="outline" className={order.status === 'READY' ? '' : 'col-span-2'}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Recall Order
            </Button>
          </div>

          <Button variant="ghost" onClick={onClose} className="w-full">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}