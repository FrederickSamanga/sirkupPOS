'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  ShoppingCart,
  Users,
  ChefHat,
  BarChart3,
  Settings,
  Coffee,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'POS', href: '/pos', icon: ShoppingCart },
  { name: 'Tables', href: '/tables', icon: Users },
  { name: 'Kitchen', href: '/kitchen', icon: ChefHat },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout', { method: 'POST' })

      // Clear access token from localStorage
      localStorage.removeItem('accessToken')

      // Redirect to login
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if API call fails
      localStorage.removeItem('accessToken')
      router.push('/login')
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-8 z-50 h-6 w-6 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-all",
          "shadow-md hover:shadow-lg"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Logo */}
      <div className={cn(
        "flex items-center border-b border-gray-200 transition-all",
        isCollapsed ? "px-4 py-4 justify-center" : "px-6 py-4"
      )}>
        <Coffee className={cn(
          "text-gray-900 transition-all",
          isCollapsed ? "h-6 w-6" : "h-8 w-8"
        )} />
        {!isCollapsed && (
          <div className="ml-3 transition-all">
            <h1 className="text-xl font-semibold text-gray-900 font-display">SirkupAI</h1>
            <p className="text-xs text-gray-500 font-inter">Cafe POS</p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className={cn(
        "flex-1 py-6 space-y-1 overflow-y-auto",
        isCollapsed ? "px-2" : "px-4"
      )}>
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center text-sm font-medium rounded-lg transition-all group relative',
                isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={cn(
                "transition-all",
                isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3"
              )} />
              {!isCollapsed && (
                <span className="transition-all">{item.name}</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className={cn(
        "border-t border-gray-200 transition-all",
        isCollapsed ? "px-2 py-4" : "px-4 py-4"
      )}>
        <div className={cn(
          "flex items-center mb-3",
          isCollapsed && "justify-center"
        )}>
          <div className={cn(
            "rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700",
            isCollapsed ? "h-8 w-8 text-xs" : "h-8 w-8 text-sm"
          )}>
            A
          </div>
          {!isCollapsed && (
            <div className="ml-3 transition-all">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center text-sm font-medium rounded-lg transition-all group relative w-full',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
            'text-red-600 hover:bg-red-50 hover:text-red-700'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className={cn(
            "transition-all",
            isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3"
          )} />
          {!isCollapsed && (
            <span className="transition-all">Logout</span>
          )}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  )
}