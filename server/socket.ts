import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { parse } from 'url'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Define event types
export interface ServerToClientEvents {
  // Order events
  'order:created': (order: any) => void
  'order:updated': (order: any) => void
  'order:statusChanged': (data: { orderId: string; status: string }) => void
  'order:cancelled': (orderId: string) => void

  // Table events
  'table:occupied': (table: any) => void
  'table:cleared': (tableId: string) => void
  'table:reserved': (table: any) => void
  'table:updated': (table: any) => void

  // Kitchen events
  'kitchen:orderReady': (orderId: string) => void
  'kitchen:newOrder': (order: any) => void
  'kitchen:itemPreparing': (data: { orderId: string; itemId: string }) => void

  // System events
  'notification': (data: { type: string; message: string; data?: any }) => void
  'presence:update': (users: any[]) => void
  'sync:required': () => void

  // Connection events
  'connect': () => void
  'disconnect': () => void
}

export interface ClientToServerEvents {
  // Order events
  'order:create': (order: any, callback: (response: any) => void) => void
  'order:updateStatus': (data: { orderId: string; status: string }) => void
  'order:cancel': (orderId: string) => void

  // Table events
  'table:occupy': (data: { tableId: string; guestCount: number }) => void
  'table:clear': (tableId: string) => void
  'table:reserve': (data: { tableId: string; reservation: any }) => void
  'table:updatePosition': (data: { tableId: string; position: { x: number; y: number } }) => void

  // Kitchen events
  'kitchen:startPreparing': (orderId: string) => void
  'kitchen:markReady': (orderId: string) => void
  'kitchen:bumpOrder': (orderId: string) => void

  // Presence events
  'presence:join': (user: { id: string; name: string; role: string }) => void
  'presence:leave': () => void

  // Sync events
  'sync:request': (callback: (data: any) => void) => void
}

interface SocketData {
  userId: string
  userName: string
  userRole: string
  restaurantId: string
}

class SocketServer {
  private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
  private activeUsers: Map<string, any> = new Map()
  private offlineQueue: Map<string, any[]> = new Map()

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.NEXT_PUBLIC_APP_URL
          : ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })

    this.setupEventHandlers()
    this.setupMiddleware()
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        // In production, verify JWT token here
        const token = socket.handshake.auth.token

        // For now, just set socket data
        socket.data.userId = socket.handshake.auth.userId || 'anonymous'
        socket.data.userName = socket.handshake.auth.userName || 'Anonymous'
        socket.data.userRole = socket.handshake.auth.userRole || 'CASHIER'
        socket.data.restaurantId = socket.handshake.auth.restaurantId || 'default'

        next()
      } catch (err) {
        next(new Error('Authentication failed'))
      }
    })
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id} (${socket.data.userName})`)

      // Join restaurant room
      const restaurantRoom = `restaurant:${socket.data.restaurantId}`
      socket.join(restaurantRoom)

      // Join role-specific room
      const roleRoom = `role:${socket.data.userRole}`
      socket.join(roleRoom)

      // Handle presence
      socket.on('presence:join', (user) => {
        this.activeUsers.set(socket.id, { ...user, socketId: socket.id, joinedAt: new Date() })
        this.broadcastPresence(restaurantRoom)
      })

      socket.on('presence:leave', () => {
        this.activeUsers.delete(socket.id)
        this.broadcastPresence(restaurantRoom)
      })

      // Order events
      socket.on('order:create', async (order, callback) => {
        try {
          // Broadcast to all terminals
          socket.to(restaurantRoom).emit('order:created', order)

          // Special notification to kitchen
          socket.to('role:KITCHEN').emit('kitchen:newOrder', order)

          // Send notification
          this.broadcastNotification(restaurantRoom, {
            type: 'success',
            message: `New order #${order.orderNumber} received`,
            data: order,
          })

          callback({ success: true, order })
        } catch (error) {
          callback({ success: false, error: error.message })
        }
      })

      socket.on('order:updateStatus', ({ orderId, status }) => {
        socket.to(restaurantRoom).emit('order:statusChanged', { orderId, status })

        if (status === 'READY') {
          socket.to(restaurantRoom).emit('kitchen:orderReady', orderId)
          this.broadcastNotification(restaurantRoom, {
            type: 'info',
            message: `Order #${orderId} is ready!`,
            data: { orderId, status },
          })
        }
      })

      socket.on('order:cancel', (orderId) => {
        socket.to(restaurantRoom).emit('order:cancelled', orderId)
      })

      // Table events
      socket.on('table:occupy', (data) => {
        socket.to(restaurantRoom).emit('table:occupied', data)
        this.broadcastNotification(restaurantRoom, {
          type: 'info',
          message: `Table ${data.tableId} occupied (${data.guestCount} guests)`,
        })
      })

      socket.on('table:clear', (tableId) => {
        socket.to(restaurantRoom).emit('table:cleared', tableId)
      })

      socket.on('table:reserve', (data) => {
        socket.to(restaurantRoom).emit('table:reserved', data)
      })

      socket.on('table:updatePosition', (data) => {
        socket.to(restaurantRoom).emit('table:updated', data)
      })

      // Kitchen events
      socket.on('kitchen:startPreparing', (orderId) => {
        socket.to(restaurantRoom).emit('order:statusChanged', { orderId, status: 'PREPARING' })
      })

      socket.on('kitchen:markReady', (orderId) => {
        socket.to(restaurantRoom).emit('kitchen:orderReady', orderId)
        this.broadcastNotification(restaurantRoom, {
          type: 'success',
          message: `Order #${orderId} is ready for pickup!`,
        })
      })

      socket.on('kitchen:bumpOrder', (orderId) => {
        socket.to(restaurantRoom).emit('order:statusChanged', { orderId, status: 'COMPLETED' })
      })

      // Sync request
      socket.on('sync:request', async (callback) => {
        // In production, fetch current state from database
        const syncData = {
          timestamp: new Date(),
          orders: [],
          tables: [],
          activeUsers: Array.from(this.activeUsers.values()),
        }
        callback(syncData)
      })

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
        this.activeUsers.delete(socket.id)
        this.broadcastPresence(restaurantRoom)
      })

      // Send any queued messages
      if (this.offlineQueue.has(socket.data.userId)) {
        const messages = this.offlineQueue.get(socket.data.userId) || []
        messages.forEach(msg => socket.emit('notification', msg))
        this.offlineQueue.delete(socket.data.userId)
      }
    })
  }

  private broadcastPresence(room: string) {
    const users = Array.from(this.activeUsers.values())
    this.io.to(room).emit('presence:update', users)
  }

  private broadcastNotification(room: string, notification: any) {
    this.io.to(room).emit('notification', notification)
  }

  public getIO() {
    return this.io
  }

  public getActiveUsers() {
    return Array.from(this.activeUsers.values())
  }

  public emitToRestaurant(restaurantId: string, event: string, data: any) {
    this.io.to(`restaurant:${restaurantId}`).emit(event as any, data)
  }

  public emitToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role}`).emit(event as any, data)
  }
}

export default SocketServer