import { type inferAsyncReturnType } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { prisma } from '../../../lib/prisma'

/**
 * Creates context for tRPC procedures
 * This runs for every request
 */
export async function createTRPCContext(opts: CreateNextContextOptions) {
  const { req, res } = opts

  return {
    prisma,
    req,
    res,
  }
}

export type Context = inferAsyncReturnType<typeof createTRPCContext>