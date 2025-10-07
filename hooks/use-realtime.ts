import { useEffect, useState, useCallback, useRef } from 'react'
import { useSocket } from '@/contexts/socket-context-simple'
import { toast } from 'sonner'

// Generic real-time hook
export function useRealtimeData<T>(
  event: string,
  initialData: T,
  options?: {
    onUpdate?: (data: T) => void
    transform?: (data: any) => T
  }
) {
  const [data, setData] = useState<T>(initialData)
  const { on, off } = useSocket()

  useEffect(() => {
    const handleUpdate = (newData: any) => {
      const transformedData = options?.transform ? options.transform(newData) : newData
      setData(transformedData)
      options?.onUpdate?.(transformedData)
    }

    on(event, handleUpdate)

    return () => {
      off(event, handleUpdate)
    }
  }, [event, on, off, options])

  return data
}

// Real-time orders hook
export function useRealtimeOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const { on, off, emit } = useSocket()

  useEffect(() => {
    // Listen for order events
    const handleOrderCreated = (order: any) => {
      setOrders(prev => [order, ...prev])
      toast.success(`New order #${order.orderNumber}`)
    }

    const handleOrderUpdated = (order: any) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o))
    }

    const handleOrderStatusChanged = ({ orderId, status }: any) => {
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status } : o
      ))
    }

    const handleOrderCancelled = (orderId: string) => {
      setOrders(prev => prev.filter(o => o.id !== orderId))
      toast.info('Order cancelled')
    }

    on('order:created', handleOrderCreated)
    on('order:updated', handleOrderUpdated)
    on('order:statusChanged', handleOrderStatusChanged)
    on('order:cancelled', handleOrderCancelled)

    return () => {
      off('order:created', handleOrderCreated)
      off('order:updated', handleOrderUpdated)
      off('order:statusChanged', handleOrderStatusChanged)
      off('order:cancelled', handleOrderCancelled)
    }
  }, [on, off])

  const updateOrderStatus = useCallback((orderId: string, status: string) => {
    emit('order:updateStatus', { orderId, status })
  }, [emit])

  const createOrder = useCallback((order: any) => {
    return new Promise((resolve, reject) => {
      (emit as any)('order:create', order, (response: any) => {
        if (response.success) {
          resolve(response.order)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }, [emit])

  return {
    orders,
    updateOrderStatus,
    createOrder,
  }
}

// Real-time tables hook
export function useRealtimeTables() {
  const [tables, setTables] = useState<any[]>([])
  const { on, off, emit } = useSocket()

  useEffect(() => {
    const handleTableOccupied = (data: any) => {
      setTables(prev => prev.map(t =>
        t.id === data.tableId
          ? { ...t, status: 'OCCUPIED', guestCount: data.guestCount }
          : t
      ))
    }

    const handleTableCleared = (tableId: string) => {
      setTables(prev => prev.map(t =>
        t.id === tableId
          ? { ...t, status: 'AVAILABLE', guestCount: 0 }
          : t
      ))
    }

    const handleTableReserved = (data: any) => {
      setTables(prev => prev.map(t =>
        t.id === data.tableId
          ? { ...t, status: 'RESERVED', reservation: data.reservation }
          : t
      ))
    }

    const handleTableUpdated = (data: any) => {
      setTables(prev => prev.map(t =>
        t.id === data.tableId ? { ...t, ...data } : t
      ))
    }

    on('table:occupied', handleTableOccupied)
    on('table:cleared', handleTableCleared)
    on('table:reserved', handleTableReserved)
    on('table:updated', handleTableUpdated)

    return () => {
      off('table:occupied', handleTableOccupied)
      off('table:cleared', handleTableCleared)
      off('table:reserved', handleTableReserved)
      off('table:updated', handleTableUpdated)
    }
  }, [on, off])

  const occupyTable = useCallback((tableId: string, guestCount: number) => {
    emit('table:occupy', { tableId, guestCount })
  }, [emit])

  const clearTable = useCallback((tableId: string) => {
    emit('table:clear', tableId)
  }, [emit])

  const reserveTable = useCallback((tableId: string, reservation: any) => {
    emit('table:reserve', { tableId, reservation })
  }, [emit])

  const updateTablePosition = useCallback((tableId: string, position: { x: number; y: number }) => {
    emit('table:updatePosition', { tableId, position })
  }, [emit])

  return {
    tables,
    occupyTable,
    clearTable,
    reserveTable,
    updateTablePosition,
  }
}

// Real-time kitchen hook
export function useRealtimeKitchen() {
  const [kitchenOrders, setKitchenOrders] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const { on, off, emit } = useSocket()
  const soundsRef = useRef<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    // Initialize sounds
    soundsRef.current = {
      newOrder: new Audio('/sounds/new-order.mp3'),
      orderReady: new Audio('/sounds/order-ready.mp3'),
      rush: new Audio('/sounds/rush-order.mp3'),
    }

    const handleNewOrder = (order: any) => {
      setKitchenOrders(prev => [...prev, order])

      // Play sound
      if (order.priority === 'RUSH') {
        soundsRef.current.rush?.play()
        toast.error(`RUSH ORDER #${order.orderNumber}!`, {
          duration: 10000,
        })
      } else {
        soundsRef.current.newOrder?.play()
        toast.info(`New order #${order.orderNumber}`)
      }

      // Add to notifications
      setNotifications(prev => [{
        id: Date.now(),
        type: 'NEW_ORDER',
        order,
        timestamp: new Date(),
      }, ...prev].slice(0, 10)) // Keep last 10 notifications
    }

    const handleOrderReady = (orderId: string) => {
      soundsRef.current.orderReady?.play()
      toast.success(`Order #${orderId} is ready!`)
    }

    const handleItemPreparing = ({ orderId, itemId }: any) => {
      setKitchenOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            items: order.items.map((item: any) =>
              item.id === itemId ? { ...item, status: 'PREPARING' } : item
            )
          }
        }
        return order
      }))
    }

    on('kitchen:newOrder', handleNewOrder)
    on('kitchen:orderReady', handleOrderReady)
    on('kitchen:itemPreparing', handleItemPreparing)

    return () => {
      off('kitchen:newOrder', handleNewOrder)
      off('kitchen:orderReady', handleOrderReady)
      off('kitchen:itemPreparing', handleItemPreparing)
    }
  }, [on, off])

  const startPreparing = useCallback((orderId: string) => {
    emit('kitchen:startPreparing', orderId)
  }, [emit])

  const markReady = useCallback((orderId: string) => {
    emit('kitchen:markReady', orderId)
  }, [emit])

  const bumpOrder = useCallback((orderId: string) => {
    emit('kitchen:bumpOrder', orderId)
  }, [emit])

  return {
    kitchenOrders,
    notifications,
    startPreparing,
    markReady,
    bumpOrder,
  }
}

// Presence hook for active users
export function usePresence() {
  const socket = useSocket()
  const activeUsers = (socket as any).activeUsers || []
  const connectionStatus = (socket as any).connectionStatus || 'disconnected'
  const [userActivity, setUserActivity] = useState<Map<string, Date>>(new Map())

  useEffect(() => {
    const activityMap = new Map<string, Date>()
    activeUsers.forEach(user => {
      activityMap.set(user.id, user.joinedAt)
    })
    setUserActivity(activityMap)
  }, [activeUsers])

  return {
    activeUsers,
    userActivity,
    connectionStatus,
    isOnline: connectionStatus === 'connected',
  }
}

// Offline queue hook
export function useOfflineQueue() {
  const [queue, setQueue] = useState<any[]>([])
  const socket = useSocket()
  const emit = socket.emit
  const connectionStatus = (socket as any).connectionStatus || 'disconnected'
  const isOnline = connectionStatus === 'connected'

  const addToQueue = useCallback((action: any) => {
    if (isOnline) {
      // If online, execute immediately
      emit(action.event, action.data)
    } else {
      // If offline, add to queue
      setQueue(prev => [...prev, { ...action, timestamp: new Date() }])
      toast.warning('Action queued - will sync when connection restored')
    }
  }, [isOnline, emit])

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      console.log('Processing offline queue:', queue)

      queue.forEach(action => {
        emit(action.event, action.data)
      })

      setQueue([])
      toast.success(`${queue.length} queued actions synced`)
    }
  }, [isOnline, queue, emit])

  return {
    queue,
    addToQueue,
    queueSize: queue.length,
    hasQueuedActions: queue.length > 0,
  }
}

// Sync hook for data synchronization
export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const { emit, on, off } = useSocket()

  const requestSync = useCallback(() => {
    setIsSyncing(true)

    emit('sync:request', (data: any) => {
      console.log('Sync data received:', data)
      setLastSyncTime(new Date())
      setIsSyncing(false)
      toast.success('Data synchronized')
    })
  }, [emit])

  useEffect(() => {
    const handleSyncRequired = () => {
      console.log('Sync required by server')
      requestSync()
    }

    on('sync:required', handleSyncRequired)

    return () => {
      off('sync:required', handleSyncRequired)
    }
  }, [on, off, requestSync])

  return {
    isSyncing,
    lastSyncTime,
    requestSync,
  }
}