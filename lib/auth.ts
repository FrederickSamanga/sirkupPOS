import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  pin: z.string().length(6).regex(/^\d+$/, "PIN must be 6 digits")
})

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        pin: { label: "PIN", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("Auth attempt with:", { email: credentials?.email, pinLength: (credentials?.pin as any)?.length })

          const validated = loginSchema.parse(credentials)
          console.log("Validation passed for:", validated.email)

          const user = await prisma.user.findUnique({
            where: { email: validated.email },
            include: { restaurant: true }
          })
          console.log("User found:", !!user, "Active:", user?.active)

          if (!user || !user.active) {
            console.log("User not found or inactive")
            throw new Error("Invalid credentials")
          }

          const isValid = await bcrypt.compare(validated.pin, user.pin)
          console.log("PIN validation result:", isValid)

          if (!isValid) {
            console.log("Invalid PIN")
            throw new Error("Invalid credentials")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            restaurantId: user.restaurantId,
            restaurantName: user.restaurant.name
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.restaurantId = user.restaurantId
        token.restaurantName = user.restaurantName
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.restaurantId = token.restaurantId as string
        session.user.restaurantName = token.restaurantName as string
      }
      return session
    }
  }
})

// Helper function to hash PIN
export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10)
}

// Helper function to verify PIN
export async function verifyPin(pin: string, hashedPin: string): Promise<boolean> {
  return bcrypt.compare(pin, hashedPin)
}