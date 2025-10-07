// Socket.io handler for real-time features
module.exports = function setupSocketServer(io) {
  console.log('> Socket.io server running')

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Handle ping for latency measurement
    socket.on('ping', (callback) => {
      if (typeof callback === 'function') {
        callback()
      }
    })

    // Handle presence
    socket.on('presence:join', (userData) => {
      console.log('User joined:', userData)
      socket.data.user = userData
      io.emit('presence:update', getActiveUsers(io))
    })

    socket.on('presence:leave', () => {
      console.log('User leaving:', socket.id)
      socket.data.user = null
      io.emit('presence:update', getActiveUsers(io))
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
      if (socket.data.user) {
        io.emit('presence:update', getActiveUsers(io))
      }
    })
  })

  return io
}

function getActiveUsers(io) {
  const users = []
  for (const [id, socket] of io.of('/').sockets) {
    if (socket.data.user) {
      users.push({
        ...socket.data.user,
        socketId: id,
        joinedAt: new Date()
      })
    }
  }
  return users
}