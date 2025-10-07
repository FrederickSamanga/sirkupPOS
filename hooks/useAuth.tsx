'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { AuthUser } from '../src/lib/jwt/jwt.types'

interface AuthContextType {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, pin: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        setAccessToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored auth data:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      }
    }

    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, pin: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pin }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    // Store auth data
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('user', JSON.stringify(data.user))

    setAccessToken(data.accessToken)
    setUser(data.user)

    // Set up token refresh before expiry
    const expiresIn = data.expiresIn || 15 * 60 * 1000 // Default 15 minutes
    setTimeout(() => {
      refreshToken()
    }, expiresIn - 60000) // Refresh 1 minute before expiry
  }, [])

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('user', JSON.stringify(data.user))

        setAccessToken(data.accessToken)
        setUser(data.user)

        // Set up next refresh
        const expiresIn = data.expiresIn || 15 * 60 * 1000
        setTimeout(() => {
          refreshToken()
        }, expiresIn - 60000)
      } else {
        // Refresh failed, logout
        await logout()
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      await logout()
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Clear local storage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')

    // Clear state
    setAccessToken(null)
    setUser(null)

    // Redirect to login
    router.push('/login-simple')
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper function to make authenticated API calls
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    throw new Error('No access token available')
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  // If 401, try to refresh token
  if (response.status === 401) {
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })

    if (refreshResponse.ok) {
      const data = await refreshResponse.json()
      localStorage.setItem('accessToken', data.accessToken)

      // Retry original request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${data.accessToken}`,
        },
      })
    }
  }

  return response
}