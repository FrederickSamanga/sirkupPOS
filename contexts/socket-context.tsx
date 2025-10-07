'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import io, { Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw, Users, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
  activeUsers: User[]
  emit: (event: string, data?: any) => void
  on: (event: string, handler: (...args: any[]) => void) => void
  off: (event: string, handler?: (...args: any[]) => void) => void
  reconnect: () => void
  latency: number
}

interface User {
  id: string
  name: string
  role: string
  socketId: string
  joinedAt: Date
}

interface NotificationData {
  type: 'success' | 'info' | 'warning' | 'error'
  message: string
  data?: any
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

// Connection status indicator component
function ConnectionIndicator({ status, latency, activeUsers }: {
  status: string
  latency: number
  activeUsers: User[]
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500'
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500'
      case 'disconnected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-3 w-3" />
      case 'connecting':
      case 'reconnecting':
        return <RefreshCw className="h-3 w-3 animate-spin" />
      case 'disconnected':
        return <WifiOff className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {status !== 'connected' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <Badge className={`${getStatusColor()} text-white flex items-center gap-2`}>
            {getStatusIcon()}
            {status === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
          </Badge>
        </motion.div>
      )}

      {status === 'connected' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2"
        >
          <Badge variant="outline" className="bg-white/90 backdrop-blur">
            <div className={`w-2 h-2 ${getStatusColor()} rounded-full mr-2 animate-pulse`} />
            Live
            {latency > 0 && (
              <span className="ml-1 text-xs opacity-70">{latency}ms</span>
            )}
          </Badge>

          {activeUsers.length > 0 && (
            <Badge variant="outline" className="bg-white/90 backdrop-blur">
              <Users className="h-3 w-3 mr-1" />
              {activeUsers.length} online
            </Badge>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<SocketContextType['connectionStatus']>('disconnected')
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [latency, setLatency] = useState(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const latencyIntervalRef = useRef<NodeJS.Timeout>()
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

    const newSocket = io(socketUrl, {
      auth: {
        token: session.user.email, // In production, use JWT token
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role || 'CASHIER',
        restaurantId: 'default',
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
    })

    // Connection events
    newSocket.on('connect', () => {
      console.log('🔌 Connected to server')
      setIsConnected(true)
      setConnectionStatus('connected')
      reconnectAttemptsRef.current = 0

      // Join presence
      newSocket.emit('presence:join', {
        id: session.user.id,
        name: session.user.name,
        role: session.user.role || 'CASHIER',
      })

      // Request sync if reconnecting
      if (reconnectAttemptsRef.current > 0) {
        newSocket.emit('sync:request', (data: any) => {
          console.log('📦 Sync data received:', data)
          toast.success('Connection restored and synced')
        })
      }

      // Show connection notification
      if (reconnectAttemptsRef.current > 0) {
        toast.success('Connected to server', {
          description: 'Real-time updates restored',
        })
      }
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from server')
      setIsConnected(false)
      setConnectionStatus('disconnected')

      toast.error('Connection lost', {
        description: 'Attempting to reconnect...',
      })
    })

    newSocket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}`)
      setConnectionStatus('reconnecting')
      reconnectAttemptsRef.current = attempt
    })

    newSocket.on('reconnect_failed', () => {
      console.log('❌ Reconnection failed')
      setConnectionStatus('disconnected')

      toast.error('Unable to connect to server', {
        description: 'Please check your connection and refresh',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload(),
        },
      })
    })

    // Real-time events
    newSocket.on('notification', (data: NotificationData) => {
      const toastFn = data.type === 'error' ? toast.error :
                      data.type === 'warning' ? toast.warning :
                      data.type === 'success' ? toast.success :
                      toast.info

      toastFn(data.message)
    })

    newSocket.on('presence:update', (users: User[]) => {
      setActiveUsers(users.filter(u => u.id !== session.user.id))
    })

    // Order events
    newSocket.on('order:created', (order) => {
      console.log('📝 New order received:', order)
      // Update local state or trigger refresh
    })

    newSocket.on('order:statusChanged', ({ orderId, status }) => {
      console.log(`📊 Order ${orderId} status changed to ${status}`)
      // Update local state
    })

    newSocket.on('kitchen:orderReady', (orderId) => {
      toast.success(`Order #${orderId} is ready!`, {
        icon: '🔔',
        duration: 10000,
      })
    })

    // Table events
    newSocket.on('table:occupied', (data) => {
      console.log('🪑 Table occupied:', data)
      // Update local state
    })

    newSocket.on('table:cleared', (tableId) => {
      console.log('🪑 Table cleared:', tableId)
      // Update local state
    })

    // Measure latency
    latencyIntervalRef.current = setInterval(() => {
      if (newSocket.connected) {
        const start = Date.now()
        newSocket.emit('ping', () => {
          const duration = Date.now() - start
          setLatency(duration)
        })
      }
    }, 5000)

    setSocket(newSocket)

    // Cleanup
    return () => {
      if (latencyIntervalRef.current) {
        clearInterval(latencyIntervalRef.current)
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      newSocket.emit('presence:leave')
      newSocket.close()
    }
  }, [session])

  // Event emitter wrapper
  const emit = useCallback((event: string, data?: any) => {
    if (!socket) {
      console.warn(`Socket not connected. Cannot emit ${event}`)
      return
    }

    // Store in offline queue if disconnected
    if (!socket.connected) {
      console.warn(`Socket disconnected. Queuing ${event}`)
      // In production, implement offline queue
      return
    }

    socket.emit(event as any, data)
  }, [socket])

  // Event listener wrapper
  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (!socket) {
      console.warn(`Socket not connected. Cannot listen to ${event}`)
      return
    }
    socket.on(event as any, handler)
  }, [socket])

  // Remove event listener
  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (!socket) return

    if (handler) {
      socket.off(event as any, handler)
    } else {
      socket.off(event as any)
    }
  }, [socket])

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (!socket) return

    setConnectionStatus('reconnecting')
    socket.connect()
  }, [socket])

  const value: SocketContextType = {
    socket,
    isConnected,
    connectionStatus,
    activeUsers,
    emit,
    on,
    off,
    reconnect,
    latency,
  }

  return (
    <SocketContext.Provider value={value}>
      <ConnectionIndicator
        status={connectionStatus}
        latency={latency}
        activeUsers={activeUsers}
      />
      {children}
    </SocketContext.Provider>
  )
}