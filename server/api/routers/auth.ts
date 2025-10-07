import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc/init'
import { TRPCError } from '@trpc/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const loginSchema = z.object({
  email: z.string().email(),
  pin: z.string().length(6).regex(/^\d+$/),
})

const changePasswordSchema = z.object({
  currentPin: z.string().length(6),
  newPin: z.string().length(6).regex(/^\d+$/),
})

export const authRouter = router({
  // Login procedure
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
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

      const isValidPin = await bcrypt.compare(input.pin, user.pin)

      if (!isValidPin) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials',
        })
      }

      // Create JWT token
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
      const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret)

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      }
    }),

  // Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      })
    }

    return user
  }),

  // Change PIN
  changePin: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { pin: true },
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      const isValidPin = await bcrypt.compare(input.currentPin, user.pin)

      if (!isValidPin) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Current PIN is incorrect',
        })
      }

      const hashedPin = await bcrypt.hash(input.newPin, 10)

      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { pin: hashedPin },
      })

      return { success: true }
    }),

  // Logout (mainly for clearing client-side state)
  logout: protectedProcedure.mutation(async () => {
    // In a real app, you might want to invalidate the token here
    // For now, just return success
    return { success: true }
  }),
})