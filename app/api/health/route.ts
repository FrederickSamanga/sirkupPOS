import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../src/lib/logger/logger';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: HealthStatus;
    memory: HealthStatus;
    disk?: HealthStatus;
  };
}

interface HealthStatus {
  status: 'up' | 'down' | 'degraded';
  message?: string;
  responseTime?: number;
  details?: any;
}

export async function GET() {
  const startTime = Date.now();

  try {
    // Check database
    const dbCheck = await checkDatabase();

    // Check memory
    const memoryCheck = checkMemory();

    // Determine overall status
    const allChecks = [dbCheck, memoryCheck];
    const hasDown = allChecks.some(check => check.status === 'down');
    const hasDegraded = allChecks.some(check => check.status === 'degraded');

    const overallStatus = hasDown ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

    const health: HealthCheck = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      checks: {
        database: dbCheck,
        memory: memoryCheck,
      },
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 503;

    logger.debug({
      msg: 'Health check performed',
      status: overallStatus,
      duration: Date.now() - startTime,
    });

    return NextResponse.json(health, { status: statusCode });

  } catch (error) {
    logger.error({ msg: 'Health check failed', err: error });

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
    }, { status: 503 });
  }
}

async function checkDatabase(): Promise<HealthStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      status: responseTime < 100 ? 'up' : 'degraded',
      responseTime,
      message: responseTime < 100 ? 'Database connected' : 'Database slow',
    };
  } catch (error) {
    return {
      status: 'down',
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function checkMemory(): HealthStatus {
  const usage = process.memoryUsage();
  const heapUsedMB = usage.heapUsed / 1024 / 1024;
  const heapTotalMB = usage.heapTotal / 1024 / 1024;
  const heapPercent = (heapUsedMB / heapTotalMB) * 100;

  const status = heapPercent < 80 ? 'up' : heapPercent < 90 ? 'degraded' : 'down';

  return {
    status,
    message: `Heap usage: ${heapPercent.toFixed(1)}%`,
    details: {
      heapUsed: `${heapUsedMB.toFixed(2)} MB`,
      heapTotal: `${heapTotalMB.toFixed(2)} MB`,
      rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
    },
  };
}