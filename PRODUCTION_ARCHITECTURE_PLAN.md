# 🏗️ Production Architecture Plan - SirkupAI Cafe POS

## Executive Summary
Current state: **Prototype with critical architectural flaws**
Target state: **Scalable, maintainable, production-grade POS system**
Estimated effort: **3-4 weeks with 2 engineers**

---

## 🚨 Critical Issues to Fix

### 1. ~~State Management Disaster~~
**Current:** ~~Direct useState() everywhere, prop drilling, no centralized state~~
**Fix:** ~~Implement RTK Query + Redux Toolkit~~ ✅ **COMPLETED: Implemented TanStack Query with tRPC**

### 2. ~~API Architecture is Non-Existent~~
**Current:** ~~Random endpoints, no validation, no versioning~~
**Fix:** ~~Proper REST/GraphQL API with DTOs, validation, versioning~~ ✅ **COMPLETED: Implemented tRPC with Zod validation**

### 3. Authentication is Broken
**Current:** Hacked together simple auth bypassing NextAuth
**Fix:** Implement proper JWT with refresh tokens, role-based access

### 4. ~~No Data Layer Abstraction~~
**Current:** ~~Direct Prisma calls in API routes~~
**Fix:** ~~Repository pattern, service layer, proper separation of concerns~~ ✅ **COMPLETED: Implemented service & repository layers**

---

## 📋 Implementation Plan

## Phase 1: Core Architecture (Week 1)

### 1.1 Project Structure Refactor
```
src/
├── app/                    # Next.js app router
├── core/                   # Core business logic
│   ├── domain/            # Domain entities & interfaces
│   ├── application/       # Use cases & services
│   └── infrastructure/    # External services
├── api/
│   ├── v1/
│   │   ├── orders/
│   │   │   ├── dto/       # Request/Response DTOs
│   │   │   ├── validators/
│   │   │   └── handlers/
│   │   └── [other modules]/
│   └── middleware/
├── store/                  # Redux store
│   ├── api/               # RTK Query APIs
│   ├── slices/            # Redux slices
│   └── hooks/             # Typed hooks
├── lib/
│   ├── cache/             # Redis abstraction
│   ├── queue/             # Bull queue setup
│   └── monitoring/        # Sentry, logging
└── tests/                 # Testing structure
```

### 1.2 ~~Install Production Dependencies~~ ✅ **COMPLETED**
```bash
# ✅ State Management & API - DONE (Using TanStack Query instead of RTK)
# ✅ npm install @tanstack/react-query @trpc/server @trpc/client - DONE

# ✅ Validation & Type Safety - DONE
# ✅ npm install zod - DONE

# ✅ Caching - PARTIALLY DONE
# ✅ npm install ioredis - DONE
# ✅ npm install @upstash/redis - DONE

# ✅ Monitoring & Logging - PARTIALLY DONE
# ✅ npm install winston pino pino-pretty - DONE

# ✅ Testing - DONE
# ✅ npm install -D @testing-library/react vitest @playwright/test - DONE
```

### 1.3 Environment Configuration
```env
# Production Environment Variables
NODE_ENV=production
APP_ENV=production

# Database
DATABASE_URL=postgresql://...
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_QUERY_TIMEOUT=10000

# Redis
REDIS_URL=redis://...
REDIS_CACHE_TTL=3600
REDIS_SESSION_TTL=28800

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL=7d

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=
SENTRY_ENVIRONMENT=production
LOG_LEVEL=info
```

---

## Phase 2: API Layer (Week 1-2)

### 2.1 API Architecture with tRPC
```typescript
// src/server/api/root.ts
import { createTRPCRouter } from "./trpc";
import { ordersRouter } from "./routers/orders";
import { authRouter } from "./routers/auth";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  orders: ordersRouter,
  menu: menuRouter,
  tables: tablesRouter,
  reports: reportsRouter,
});

// src/server/api/routers/orders.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const CreateOrderSchema = z.object({
  tableId: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    modifiers: z.array(z.string()).optional(),
  })),
  type: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY']),
});

export const ordersRouter = createTRPCRouter({
  create: protectedProcedure
    .input(CreateOrderSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.orderService.createOrder(input);
    }),

  list: protectedProcedure
    .input(z.object({
      status: z.enum(['PENDING', 'PREPARING', 'READY']).optional(),
      limit: z.number().default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.services.orderService.listOrders(input);
    }),
});
```

### 2.2 Service Layer Pattern
```typescript
// src/core/application/services/OrderService.ts
export class OrderService {
  constructor(
    private orderRepo: IOrderRepository,
    private paymentService: IPaymentService,
    private notificationService: INotificationService,
    private cache: ICacheService,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    // Business logic validation
    const validatedOrder = await this.validateOrder(dto);

    // Start transaction
    return this.prisma.$transaction(async (tx) => {
      // Create order
      const order = await this.orderRepo.create(validatedOrder, tx);

      // Process payment if needed
      if (dto.paymentMethod) {
        await this.paymentService.processPayment(order, dto.paymentMethod);
      }

      // Queue notifications
      await this.notificationService.queueOrderNotification(order);

      // Invalidate cache
      await this.cache.invalidate(`orders:*`);

      // Emit real-time event
      this.eventBus.emit('order.created', order);

      return order;
    });
  }
}
```

### 2.3 Repository Pattern
```typescript
// src/core/infrastructure/repositories/OrderRepository.ts
export class OrderRepository implements IOrderRepository {
  async findById(id: string): Promise<Order | null> {
    const cached = await this.cache.get(`order:${id}`);
    if (cached) return cached;

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: this.defaultIncludes,
    });

    if (order) {
      await this.cache.set(`order:${id}`, order, 300);
    }

    return order;
  }

  async create(data: CreateOrderData, tx?: PrismaTransaction): Promise<Order> {
    const db = tx || this.prisma;
    return db.order.create({
      data,
      include: this.defaultIncludes,
    });
  }
}
```

---

## Phase 3: State Management with RTK Query (Week 2)

### 3.1 Redux Store Setup
```typescript
// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/apiSlice';
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

setupListeners(store.dispatch);
```

### 3.2 RTK Query API Slices
```typescript
// src/store/api/ordersApi.ts
import { api } from './apiSlice';
import type { Order, CreateOrderDto, OrderFilters } from '@/types';

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], OrderFilters>({
      query: (filters) => ({
        url: '/orders',
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
      keepUnusedDataFor: 30,
    }),

    createOrder: builder.mutation<Order, CreateOrderDto>({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],

      // Optimistic update
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          ordersApi.util.updateQueryData('getOrders', undefined, (draft) => {
            draft.unshift(createOptimisticOrder(data));
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Subscription for real-time updates
    subscribeToOrders: builder.query<Order, void>({
      queryFn: () => ({ data: null }),
      async onCacheEntryAdded(_, { updateCachedData, cacheEntryRemoved }) {
        const ws = new WebSocket('ws://localhost:3001/orders');

        ws.onmessage = (event) => {
          const order = JSON.parse(event.data);
          updateCachedData((draft) => order);
        };

        await cacheEntryRemoved;
        ws.close();
      },
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useSubscribeToOrdersQuery,
} = ordersApi;
```

---

## Phase 4: Real-time & Caching (Week 2-3)

### 4.1 Redis Caching Strategy
```typescript
// src/lib/cache/CacheService.ts
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }

  // Cache-aside pattern
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}
```

### 4.2 WebSocket at Scale
```typescript
// src/lib/realtime/SocketManager.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

export class SocketManager {
  private io: Server;

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(','),
        credentials: true,
      },
      transports: ['websocket'],
    });

    // Redis adapter for multi-instance
    const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = pubClient.duplicate();
    this.io.adapter(createAdapter(pubClient, subClient));

    // Authentication middleware
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      const user = await this.verifyToken(token);
      if (user) {
        socket.data.user = user;
        next();
      } else {
        next(new Error('Authentication failed'));
      }
    });

    // Connection handling
    this.io.on('connection', (socket) => {
      // Join restaurant room
      socket.join(`restaurant:${socket.data.user.restaurantId}`);

      // Join role-based rooms
      socket.join(`role:${socket.data.user.role}`);

      // Handle events
      socket.on('order:update', async (data) => {
        // Validate permissions
        if (!this.canUpdateOrder(socket.data.user, data)) {
          return socket.emit('error', 'Unauthorized');
        }

        // Emit to restaurant
        this.io.to(`restaurant:${socket.data.user.restaurantId}`)
          .emit('order:updated', data);
      });
    });
  }
}
```

---

## Phase 5: Authentication & Security (Week 3)

### 5.1 JWT Authentication Service
```typescript
// src/core/application/services/AuthService.ts
export class AuthService {
  async login(credentials: LoginDto): Promise<AuthTokens> {
    const user = await this.userRepo.findByEmail(credentials.email);

    if (!user || !await this.verifyPin(credentials.pin, user.pin)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    // Store refresh token
    await this.cache.set(
      `refresh:${user.id}`,
      tokens.refreshToken,
      7 * 24 * 60 * 60 // 7 days
    );

    // Track session
    await this.sessionService.createSession(user, tokens);

    return tokens;
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
```

### 5.2 Rate Limiting & Security
```typescript
// src/api/middleware/rateLimiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
});

export async function rateLimitMiddleware(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      },
    });
  }
}
```

---

## Phase 6: Testing & Quality (Week 3-4)

### 6.1 Testing Strategy
```typescript
// src/tests/integration/orders.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockServer } from '../utils/mockServer';
import { OrderService } from '@/core/application/services/OrderService';

describe('OrderService Integration Tests', () => {
  let service: OrderService;
  let server: MockServer;

  beforeEach(() => {
    server = createMockServer();
    service = new OrderService(/* mocked deps */);
  });

  it('should create order with payment processing', async () => {
    const orderData = createMockOrderData();

    // Mock external services
    server.use(
      rest.post('/api/payment', (req, res, ctx) => {
        return res(ctx.json({ success: true, transactionId: '123' }));
      })
    );

    const order = await service.createOrder(orderData);

    expect(order).toMatchObject({
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
    });
  });
});
```

### 6.2 E2E Testing
```typescript
// src/tests/e2e/order-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Order Flow', () => {
  test('complete order from POS to kitchen', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name=email]', 'admin@test.com');
    await page.fill('[name=pin]', '123456');
    await page.click('button[type=submit]');

    // Navigate to POS
    await page.waitForURL('/dashboard');
    await page.click('a[href="/pos"]');

    // Add items
    await page.click('[data-testid="menu-item-1"]');
    await page.click('[data-testid="menu-item-2"]');

    // Submit order
    await page.click('[data-testid="submit-order"]');

    // Verify order appears in kitchen
    await page.goto('/kitchen');
    await expect(page.locator('[data-testid="order-list"]')).toContainText('Order #');
  });
});
```

---

## Phase 7: Monitoring & Observability (Week 4)

### 7.1 Structured Logging
```typescript
// src/lib/monitoring/logger.ts
import winston from 'winston';
import { LogtailTransport } from '@logtail/winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new LogtailTransport({
      sourceToken: process.env.LOGTAIL_TOKEN,
    }),
  ],
});

// Usage
logger.info('Order created', {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
  metadata: { source: 'POS', table: order.tableId },
});
```

### 7.2 Application Monitoring
```typescript
// src/lib/monitoring/metrics.ts
import * as Sentry from '@sentry/nextjs';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.APP_ENV,
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Prisma({ client: prisma }),
    new Sentry.Integrations.Http({ tracing: true }),
  ],
});

// Metrics
const meterProvider = new MeterProvider({
  exporter: new PrometheusExporter({ port: 9090 }),
});

const meter = meterProvider.getMeter('cafe-pos');

export const metrics = {
  orderCounter: meter.createCounter('orders_total', {
    description: 'Total number of orders',
  }),

  orderValue: meter.createHistogram('order_value', {
    description: 'Order value distribution',
    unit: 'USD',
  }),

  apiLatency: meter.createHistogram('api_latency', {
    description: 'API response time',
    unit: 'ms',
  }),
};
```

---

## Phase 8: DevOps & Deployment (Week 4)

### 8.1 Docker Configuration
```dockerfile
# Dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
RUN pnpm build

# Runner
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

### 8.2 Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cafe-pos-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cafe-pos-api
  template:
    metadata:
      labels:
        app: cafe-pos-api
    spec:
      containers:
      - name: api
        image: cafe-pos:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cafe-pos-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cafe-pos-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Performance Targets

### API Performance
- **P50 Latency:** < 50ms
- **P95 Latency:** < 200ms
- **P99 Latency:** < 500ms
- **Throughput:** 10,000 req/s
- **Error Rate:** < 0.1%

### Database Performance
- **Query Time:** < 10ms (P95)
- **Connection Pool:** 10-50 connections
- **Read Replicas:** 2 minimum

### Real-time Performance
- **WebSocket Latency:** < 100ms
- **Concurrent Connections:** 10,000 per instance
- **Message Throughput:** 50,000 msg/s

### Frontend Performance
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Bundle Size:** < 200KB (gzipped)

---

## Migration Strategy

### Week 1
- [ ] Set up new project structure
- [ ] Implement tRPC API layer
- [ ] Create service layer architecture
- [ ] Set up Redis and caching

### Week 2
- [ ] Implement RTK Query
- [ ] Migrate all API calls to RTK Query
- [ ] Set up WebSocket scaling
- [ ] Implement proper authentication

### Week 3
- [ ] Add comprehensive testing
- [ ] Implement monitoring
- [ ] Set up CI/CD pipeline
- [ ] Performance optimization

### Week 4
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Load testing
- [ ] Documentation

---

## Team Requirements

### Frontend Engineer
- RTK Query expertise
- React performance optimization
- TypeScript proficiency

### Backend Engineer
- Node.js/NestJS experience
- Database optimization skills
- Microservices architecture

### DevOps Engineer
- Kubernetes experience
- CI/CD pipeline setup
- Monitoring & observability

---

## Cost Estimation

### Infrastructure (Monthly)
- **AWS/GCP:** $500-1000
- **Database (RDS):** $200-400
- **Redis (ElastiCache):** $100-200
- **CDN (CloudFront):** $50-100
- **Monitoring (Datadog):** $200-400
- **Total:** ~$1,500/month

### Development (One-time)
- **2 Engineers x 4 weeks:** $32,000
- **DevOps Setup:** $8,000
- **Testing & QA:** $5,000
- **Total:** ~$45,000

---

## Success Metrics

### Technical
- [ ] 99.9% uptime
- [ ] < 200ms API response time (P95)
- [ ] Zero data loss
- [ ] Automated deployment

### Business
- [ ] Handle 1000+ concurrent users
- [ ] Process 10,000+ orders/day
- [ ] Real-time sync across 50+ terminals
- [ ] Support multi-location deployment

---

## Conclusion

The current codebase is a **prototype** that needs complete architectural overhaul. This plan transforms it into a **production-grade system** with:

- ✅ Proper state management (RTK Query)
- ✅ Scalable API architecture (tRPC)
- ✅ Service-oriented architecture
- ✅ Robust caching strategy
- ✅ Real-time at scale
- ✅ Comprehensive testing
- ✅ Production monitoring
- ✅ Container orchestration

**Timeline:** 4 weeks
**Budget:** ~$50,000
**Result:** Enterprise-grade POS system ready for 10,000+ daily transactions

---

*This is what REAL production architecture looks like. Not the garbage prototype we have now.*