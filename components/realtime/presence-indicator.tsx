'use client'

import { useState, useEffect } from 'react'
import { usePresence } from '@/hooks/use-realtime'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Users,
  User,
  ChefHat,
  ShoppingCart,
  Settings,
  Wifi,
  WifiOff,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string
  role: string
  socketId: string
  joinedAt: Date
}

const ROLE_ICONS = {
  ADMIN: Settings,
  CASHIER: ShoppingCart,
  KITCHEN: ChefHat,
  WAITER: User,
} as const

const ROLE_COLORS = {
  ADMIN: 'text-purple-600 bg-purple-100',
  CASHIER: 'text-blue-600 bg-blue-100',
  KITCHEN: 'text-green-600 bg-green-100',
  WAITER: 'text-orange-600 bg-orange-100',
} as const

export function PresenceIndicator() {
  const { activeUsers, connectionStatus, isOnline } = usePresence()
  const [isOpen, setIsOpen] = useState(false)
  const [showNotification, setShowNotification] = useState(false)

  // Show notification when users join/leave
  useEffect(() => {
    if (activeUsers.length > 0) {
      setShowNotification(true)
      const timer = setTimeout(() => setShowNotification(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [activeUsers.length])

  const groupedUsers = activeUsers.reduce((acc: Record<string, User[]>, user: User) => {
    const role = user.role || 'CASHIER'
    if (!acc[role]) acc[role] = []
    acc[role].push(user)
    return acc
  }, {} as Record<string, User[]>)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      {/* Floating Presence Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-20 right-4 z-40"
      >
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-white rounded-full shadow-lg p-3 hover:shadow-xl transition-shadow"
            >
              {/* Connection Status Dot */}
              <div className={cn(
                'absolute -top-1 -right-1 w-3 h-3 rounded-full',
                isOnline ? 'bg-green-500' : 'bg-red-500',
                isOnline && 'animate-pulse'
              )} />

              {/* Users Icon with Count */}
              <div className="relative">
                <Users className="h-6 w-6 text-gray-700" />
                {activeUsers.length > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 h-5 min-w-[20px] p-0 flex items-center justify-center bg-gray-900 text-white"
                  >
                    {activeUsers.length}
                  </Badge>
                )}
              </div>

              {/* Notification Badge */}
              <AnimatePresence>
                {showNotification && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                  >
                    <Badge className="bg-green-500 text-white whitespace-nowrap">
                      User joined
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-80 p-0">
            <Card className="border-0">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Active Users</h3>
                    <Badge variant="secondary">{activeUsers.length}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {isOnline ? (
                      <>
                        <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                        <span className="text-xs text-green-600">Online</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-2 w-2 fill-red-500 text-red-500" />
                        <span className="text-xs text-red-600">Offline</span>
                      </>
                    )}
                  </div>
                </div>

                {/* User Groups */}
                {activeUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No other users online</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(Object.entries(groupedUsers) as [string, User[]][]).map(([role, users]) => {
                      const RoleIcon = ROLE_ICONS[role as keyof typeof ROLE_ICONS] || User
                      const roleColor = ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'text-gray-600 bg-gray-100'

                      return (
                        <div key={role} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={cn('p-1 rounded', roleColor)}>
                              <RoleIcon className="h-3 w-3" />
                            </div>
                            <span className="text-xs font-medium text-gray-600">
                              {role} ({users.length})
                            </span>
                          </div>

                          <div className="space-y-1">
                            {users.map((user, index) => (
                              <motion.div
                                key={user.socketId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={`/avatars/${user.id}.png`} />
                                  <AvatarFallback className="text-xs bg-gray-200">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Online {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: false })}
                                  </p>
                                </div>

                                <div className="flex items-center">
                                  <Circle className="h-2 w-2 fill-green-500 text-green-500 animate-pulse" />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </motion.div>

      {/* Avatar Stack (Alternative View) */}
      <motion.div
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {activeUsers.length > 0 && (
          <>
            <TooltipProvider>
              <div className="flex -space-x-2">
                {activeUsers.slice(0, 3).map((user: User) => (
                  <Tooltip key={user.socketId}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-white hover:z-10 transition-all cursor-pointer">
                        <AvatarImage src={`/avatars/${user.id}.png`} />
                        <AvatarFallback className="text-xs bg-gray-200">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-gray-500">{user.role}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {activeUsers.length > 3 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar className="h-8 w-8 border-2 border-white bg-gray-900 text-white hover:z-10 transition-all cursor-pointer">
                        <AvatarFallback>+{activeUsers.length - 3}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{activeUsers.length - 3} more users online</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>

            <Badge variant="outline" className="text-xs">
              {activeUsers.length} online
            </Badge>
          </>
        )}
      </motion.div>
    </>
  )
}