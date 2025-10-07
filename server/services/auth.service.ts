import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { BaseService } from './base.service'
import { User } from '@prisma/client'
import { TRPCError } from '@trpc/server'

export interface LoginCredentials {
  email: string
  pin: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  exp?: number
}

export class AuthService extends BaseService {
  private readonly jwtSecret: Uint8Array

  constructor(prisma: any, logger?: any) {
    super(prisma, logger)

    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error('NEXTAUTH_SECRET is not set')
    }

    this.jwtSecret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
  }

  /**
   * Authenticate user with email and PIN
   */
  async authenticate(credentials: LoginCredentials) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: credentials.email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          pin: true,
          active: true,
        },
      })

      if (!user || !user.active) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        })
      }

      const isValidPin = await bcrypt.compare(credentials.pin, user.pin)

      if (!isValidPin) {
        this.logger.warn({ email: credentials.email }, 'Failed login attempt')
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        })
      }

      const token = await this.generateToken(user)

      this.logger.info({ userId: user.id }, 'User authenticated successfully')

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      }
    } catch (error) {
      this.handleError(error, 'authenticate')
    }
  }

  /**
   * Generate JWT token for user
   */
  async generateToken(user: Pick<User, 'id' | 'email' | 'role'>) {
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(this.jwtSecret)

    return token
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret)
      return payload as JWTPayload
    } catch (error) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
      })
    }
  }

  /**
   * Change user PIN
   */
  async changePin(userId: string, currentPin: string, newPin: string) {
    try {
      const user = await this.validateExists<User>(
        this.prisma.user,
        userId,
        'User'
      )

      const isValidPin = await bcrypt.compare(currentPin, user.pin)

      if (!isValidPin) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current PIN is incorrect',
        })
      }

      const hashedPin = await bcrypt.hash(newPin, 10)

      await this.prisma.user.update({
        where: { id: userId },
        data: { pin: hashedPin },
      })

      this.logger.info({ userId }, 'PIN changed successfully')

      return { success: true }
    } catch (error) {
      this.handleError(error, 'changePin')
    }
  }

  /**
   * Create new user
   */
  async createUser(data: {
    email: string
    name: string
    pin: string
    role: string
  }) {
    try {
      // Check if user already exists
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User with this email already exists',
        })
      }

      const hashedPin = await bcrypt.hash(data.pin, 10)

      const user = await this.prisma.user.create({
        data: {
          ...data,
          pin: hashedPin,
          active: true,
        },
      })

      this.logger.info({ userId: user.id }, 'User created successfully')

      return user
    } catch (error) {
      this.handleError(error, 'createUser')
    }
  }
}