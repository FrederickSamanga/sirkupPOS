import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Logger configuration
const pinoConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),

  // Pretty print in development
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        levelFirst: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    },
  }),

  // Production configuration
  ...(!isDevelopment && {
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }),

  // Disable in test environment
  enabled: !isTest,

  // Redact sensitive information
  redact: {
    paths: [
      'password',
      'pin',
      'token',
      'authorization',
      'cookie',
      'api_key',
      'apiKey',
      'secret',
      'accessToken',
      'refreshToken',
      '*.password',
      '*.pin',
      '*.token',
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    censor: '[REDACTED]',
  },

  // Serializers
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
        'x-request-id': req.headers['x-request-id'],
      },
      remoteAddress: req.socket?.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: {
        'content-type': res.getHeaders()['content-type'],
      },
    }),
    err: pino.stdSerializers.err,
  },
};

// Create logger instance
export const logger = pino(pinoConfig);

// Child loggers for different modules
export const authLogger = logger.child({ module: 'auth' });
export const apiLogger = logger.child({ module: 'api' });
export const dbLogger = logger.child({ module: 'database' });
export const cacheLogger = logger.child({ module: 'cache' });
export const wsLogger = logger.child({ module: 'websocket' });
export const paymentLogger = logger.child({ module: 'payment' });

// Request logger middleware
export function requestLogger(req: any, res: any, next: any) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  // Attach request ID
  req.id = requestId;
  req.log = logger.child({ requestId });

  // Log request
  req.log.info({
    msg: 'Request received',
    req,
  });

  // Log response
  const originalSend = res.send;
  res.send = function (data: any) {
    res.send = originalSend;
    const duration = Date.now() - startTime;

    req.log.info({
      msg: 'Request completed',
      res,
      duration,
      responseSize: data?.length || 0,
    });

    return res.send(data);
  };

  next();
}

// Performance logger
export class PerformanceLogger {
  private static timers = new Map<string, number>();

  static start(label: string, metadata?: Record<string, any>) {
    const startTime = performance.now();
    this.timers.set(label, startTime);

    logger.debug({
      msg: `Performance timer started: ${label}`,
      label,
      ...metadata,
    });
  }

  static end(label: string, metadata?: Record<string, any>) {
    const startTime = this.timers.get(label);
    if (!startTime) {
      logger.warn(`Performance timer not found: ${label}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    logger.info({
      msg: `Performance timer ended: ${label}`,
      label,
      duration: `${duration.toFixed(2)}ms`,
      ...metadata,
    });

    // Alert on slow operations
    if (duration > 1000) {
      logger.warn({
        msg: `Slow operation detected: ${label}`,
        label,
        duration: `${duration.toFixed(2)}ms`,
        ...metadata,
      });
    }

    return duration;
  }
}

// Audit logger for important events
export class AuditLogger {
  static log(action: string, details: Record<string, any>) {
    logger.info({
      type: 'AUDIT',
      action,
      timestamp: new Date().toISOString(),
      ...details,
    });
  }

  static logAuth(event: 'login' | 'logout' | 'failed_login', user: any, metadata?: any) {
    this.log(`auth.${event}`, {
      userId: user?.id,
      email: user?.email,
      role: user?.role,
      ...metadata,
    });
  }

  static logDataAccess(action: string, resource: string, user: any, metadata?: any) {
    this.log('data_access', {
      action,
      resource,
      userId: user?.id,
      ...metadata,
    });
  }

  static logPayment(action: string, amount: number, user: any, metadata?: any) {
    this.log(`payment.${action}`, {
      amount,
      userId: user?.id,
      ...metadata,
    });
  }
}

// Error logger
export function logError(error: Error | unknown, context?: Record<string, any>) {
  if (error instanceof Error) {
    logger.error({
      msg: error.message,
      err: error,
      stack: error.stack,
      ...context,
    });
  } else {
    logger.error({
      msg: 'Unknown error',
      error,
      ...context,
    });
  }
}

// Utility functions
export function createLogger(module: string) {
  return logger.child({ module });
}

export default logger;