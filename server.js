const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'  // Bind to all interfaces
const port = process.env.PORT || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Import socket handler
const setupSocketServer = require('./server/socket-handler')

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Setup Socket.io
  const io = new Server(server, {
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // Socket.io event handlers
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id)

    // Join restaurant room (multi-tenant ready)
    const restaurantId = socket.handshake.auth.restaurantId || 'default'
    socket.join(`restaurant:${restaurantId}`)

    // User presence
    socket.on('presence:join', (user) => {
      socket.data.user = user
      const users = Array.from(io.sockets.sockets.values())
        .filter(s => s.data.user)
        .map(s => ({ ...s.data.user, socketId: s.id }))
      io.to(`restaurant:${restaurantId}`).emit('presence:update', users)
    })

    // Order events
    socket.on('order:create', (order, callback) => {
      socket.to(`restaurant:${restaurantId}`).emit('order:created', order)
      socket.to(`restaurant:${restaurantId}`).emit('kitchen:newOrder', order)

      // Send notification
      io.to(`restaurant:${restaurantId}`).emit('notification', {
        type: 'success',
        message: `New order #${order.orderNumber} received`,
        data: order,
      })

      callback({ success: true, order })
    })

    socket.on('order:updateStatus', ({ orderId, status }) => {
      socket.to(`restaurant:${restaurantId}`).emit('order:statusChanged', { orderId, status })

      if (status === 'READY') {
        io.to(`restaurant:${restaurantId}`).emit('kitchen:orderReady', orderId)
        io.to(`restaurant:${restaurantId}`).emit('notification', {
          type: 'info',
          message: `Order #${orderId} is ready!`,
        })
      }
    })

    // Table events
    socket.on('table:occupy', (data) => {
      socket.to(`restaurant:${restaurantId}`).emit('table:occupied', data)
    })

    socket.on('table:clear', (tableId) => {
      socket.to(`restaurant:${restaurantId}`).emit('table:cleared', tableId)
    })

    socket.on('table:updatePosition', (data) => {
      socket.to(`restaurant:${restaurantId}`).emit('table:updated', data)
    })

    // Kitchen events
    socket.on('kitchen:startPreparing', (orderId) => {
      socket.to(`restaurant:${restaurantId}`).emit('order:statusChanged', {
        orderId,
        status: 'IN_PROGRESS'
      })
    })

    socket.on('kitchen:markReady', (orderId) => {
      io.to(`restaurant:${restaurantId}`).emit('kitchen:orderReady', orderId)
    })

    socket.on('kitchen:bumpOrder', (orderId) => {
      socket.to(`restaurant:${restaurantId}`).emit('order:statusChanged', {
        orderId,
        status: 'COMPLETED'
      })
    })

    // Sync request
    socket.on('sync:request', (callback) => {
      // In production, fetch from database
      callback({
        timestamp: new Date(),
        orders: [],
        tables: [],
        activeUsers: Array.from(io.sockets.sockets.values())
          .filter(s => s.data.user)
          .map(s => ({ ...s.data.user, socketId: s.id }))
      })
    })

    // Ping for latency measurement
    socket.on('ping', (callback) => {
      callback()
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)

      // Update presence
      const users = Array.from(io.sockets.sockets.values())
        .filter(s => s.data.user && s.id !== socket.id)
        .map(s => ({ ...s.data.user, socketId: s.id }))
      io.to(`restaurant:${restaurantId}`).emit('presence:update', users)
    })
  })

  server.once('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://localhost:${port}`)
    console.log('> Socket.io server running')
  })
})