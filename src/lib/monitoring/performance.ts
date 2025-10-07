import { logger, PerformanceLogger } from '../logger/logger';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  track<T>(name: string, fn: () => T | Promise<T>, metadata?: Record<string, any>): T | Promise<T> {
    PerformanceLogger.start(name, metadata);

    const result = fn();

    if (result instanceof Promise) {
      return result.finally(() => {
        const duration = PerformanceLogger.end(name, metadata);
        this.recordMetric(name, duration, metadata);
      }) as T;
    } else {
      const duration = PerformanceLogger.end(name, metadata);
      this.recordMetric(name, duration, metadata);
      return result;
    }
  }

  private recordMetric(name: string, duration: number, metadata?: Record<string, any>) {
    this.metrics.push({
      name,
      duration,
      timestamp: new Date(),
      metadata,
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return this.metrics;
  }

  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  getStats(name: string) {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const min = durations[0];
    const max = durations[durations.length - 1];
    const p50 = durations[Math.floor(durations.length * 0.5)];
    const p95 = durations[Math.floor(durations.length * 0.95)];
    const p99 = durations[Math.floor(durations.length * 0.99)];

    return {
      count: metrics.length,
      avg: Math.round(avg),
      min: Math.round(min),
      max: Math.round(max),
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
    };
  }

  clear(name?: string) {
    if (name) {
      this.metrics = this.metrics.filter(m => m.name !== name);
    } else {
      this.metrics = [];
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Decorator for monitoring function performance
export function Monitor(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.track(
        metricName,
        () => originalMethod.apply(this, args),
        { class: target.constructor.name, method: propertyKey }
      );
    };

    return descriptor;
  };
}

// Request timing middleware
export function timeRequest(label: string) {
  return (req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;

      logger.info({
        msg: `Request timing: ${label}`,
        duration,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
      });

      // Alert on slow requests
      if (duration > 1000) {
        logger.warn({
          msg: `Slow request detected: ${label}`,
          duration,
          method: req.method,
          url: req.url,
        });
      }
    });

    next();
  };
}