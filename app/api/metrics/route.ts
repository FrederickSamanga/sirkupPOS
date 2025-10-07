import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../src/lib/logger/logger';

interface SystemMetrics {
  system: {
    uptime: number;
    platform: string;
    nodeVersion: string;
    environment: string;
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
    arrayBuffers: number;
  };
  process: {
    pid: number;
    cpuUsage: NodeJS.CpuUsage;
  };
  database?: {
    connections: number;
    responseTime: number;
  };
  timestamp: string;
}

export async function GET() {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Check database
    const dbStart = Date.now();
    let dbMetrics;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbMetrics = {
        connections: 1,
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      logger.error({ msg: 'Database metrics failed', err: error });
    }

    const metrics: SystemMetrics = {
      system: {
        uptime: process.uptime(),
        platform: process.platform,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development',
      },
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024),
      },
      process: {
        pid: process.pid,
        cpuUsage,
      },
      database: dbMetrics,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(metrics);

  } catch (error) {
    logger.error({ msg: 'Metrics collection failed', err: error });
    return NextResponse.json({
      error: 'Failed to collect metrics',
    }, { status: 500 });
  }
}