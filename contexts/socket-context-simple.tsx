'use client'

import React, { createContext, useContext } from 'react'

interface SocketContextType {
  socket: null
  connected: boolean
  on: (event: string, handler: Function) => void
  off: (event: string, handler: Function) => void
  emit: (event: string, data?: any) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  // Simple provider without actual socket connection for now
  const value: SocketContextType = {
    socket: null,
    connected: false,
    on: (event: string, handler: Function) => {
      // No-op for now
    },
    off: (event: string, handler: Function) => {
      // No-op for now
    },
    emit: (event: string, data?: any) => {
      // No-op for now
    }
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}