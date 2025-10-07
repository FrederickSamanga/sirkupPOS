import { router } from './trpc/init'
import { authRouter } from './routers/auth'
import { productsRouter } from './routers/products'
import { ordersRouter } from './routers/orders'

/**
 * This is the primary router for your server.
 *
 * All routers added in /server/api/routers should be manually added here.
 */
export const appRouter = router({
  auth: authRouter,
  products: productsRouter,
  orders: ordersRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter