import { SignJWT, jwtVerify } from 'jose'
import { sessionCache } from '../cache/cache-manager'
import { v4 as uuidv4 } from 'uuid'

export interface TokenPayload {
  userId: string
  email: string
  role: string
  sessionId: string
  type: 'access' | 'refresh'
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export class JWTManager {
  private readonly accessTokenSecret: Uint8Array
  private readonly refreshTokenSecret: Uint8Array
  private readonly accessTokenTTL = '15m' // 15 minutes
  private readonly refreshTokenTTL = '7d' // 7 days

  constructor() {
    if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
      // Fallback to NEXTAUTH_SECRET if JWT secrets not set
      const fallbackSecret = process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production'

      this.accessTokenSecret = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || fallbackSecret
      )
      this.refreshTokenSecret = new TextEncoder().encode(
        process.env.JWT_REFRESH_SECRET || `${fallbackSecret}-refresh`
      )
    } else {
      this.accessTokenSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET)
      this.refreshTokenSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET)
    }
  }

  /**
   * Generate access and refresh token pair
   */
  async generateTokenPair(user: {
    id: string
    email: string
    role: string
  }): Promise<TokenPair> {
    const sessionId = uuidv4()

    // Generate access token
    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
      type: 'access',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.accessTokenTTL)
      .setJti(uuidv4())
      .sign(this.accessTokenSecret)

    // Generate refresh token
    const refreshToken = await new SignJWT({
      userId: user.id,
      sessionId,
      type: 'refresh',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.refreshTokenTTL)
      .setJti(uuidv4())
      .sign(this.refreshTokenSecret)

    // Store session in cache
    await sessionCache.set(
      `session:${sessionId}`,
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        createdAt: new Date().toISOString(),
      },
      { ttl: 7 * 24 * 60 * 60 } // 7 days
    )

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    }
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.accessTokenSecret)

      if (payload.type !== 'access') {
        throw new Error('Invalid token type')
      }

      // Check if session exists in cache
      const session = await sessionCache.get(`session:${payload.sessionId}`)
      if (!session) {
        throw new Error('Session expired or invalid')
      }

      return payload as TokenPayload
    } catch (error) {
      throw new Error('Invalid or expired access token')
    }
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<{ userId: string; sessionId: string }> {
    try {
      const { payload } = await jwtVerify(token, this.refreshTokenSecret)

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type')
      }

      // Check if session exists in cache
      const session = await sessionCache.get(`session:${payload.sessionId}`)
      if (!session) {
        throw new Error('Session expired or invalid')
      }

      return {
        userId: payload.userId as string,
        sessionId: payload.sessionId as string,
      }
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    const { userId, sessionId } = await this.verifyRefreshToken(refreshToken)

    // Get user data from cache or database
    const session = await sessionCache.get<any>(`session:${sessionId}`)
    if (!session) {
      throw new Error('Session not found')
    }

    // Generate new token pair
    return this.generateTokenPair({
      id: userId,
      email: session.email,
      role: session.role,
    })
  }

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await sessionCache.delete(`session:${sessionId}`)
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    // This would require maintaining a list of active sessions per user
    // For now, we'll implement this in a future iteration
    await sessionCache.deleteByPattern(`session:*`)
  }

  /**
   * Extract token from authorization header
   */
  extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) return null

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null
    }

    return parts[1]
  }
}