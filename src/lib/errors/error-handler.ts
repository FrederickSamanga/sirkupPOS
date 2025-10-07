import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import {
  AppError,
  ValidationError,
  DatabaseError,
  NotFoundError,
  ConflictError,
  ErrorCode,
} from './app-error';

export class ErrorHandler {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Central error handler for API routes
   */
  static handle(error: unknown, request?: NextRequest): NextResponse {
    // Generate correlation ID for tracking
    const correlationId = this.generateCorrelationId();

    // Log error
    this.logError(error, correlationId, request);

    // Convert to AppError if needed
    const appError = this.normalizeError(error);
    appError.correlationId = correlationId;

    // Send to monitoring service
    if (!appError.isOperational) {
      this.reportToMonitoring(appError, request);
    }

    // Return error response
    return NextResponse.json(
      {
        error: {
          message: appError.message,
          code: appError.code,
          correlationId,
          details: this.isDevelopment ? appError.details : undefined,
          timestamp: appError.timestamp,
        },
      },
      { status: appError.statusCode }
    );
  }

  /**
   * Normalize various error types to AppError
   */
  static normalizeError(error: unknown): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Zod validation error
    if (error instanceof ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      }));
      return new ValidationError('Validation failed', { errors: details });
    }

    // Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(error);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return new ValidationError('Database validation failed');
    }

    // Generic Error
    if (error instanceof Error) {
      return new AppError(
        error.message,
        ErrorCode.INTERNAL_ERROR,
        500,
        false
      );
    }

    // Unknown error
    return new AppError(
      'An unexpected error occurred',
      ErrorCode.INTERNAL_ERROR,
      500,
      false
    );
  }

  /**
   * Handle Prisma-specific errors
   */
  private static handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError
  ): AppError {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        const field = (error.meta?.target as string[])?.[0];
        return new ConflictError(`Duplicate value for field: ${field}`, {
          field,
        });

      case 'P2025': // Record not found
        return new NotFoundError('Record');

      case 'P2003': // Foreign key constraint
        return new ValidationError('Referenced record does not exist');

      case 'P2024': // Connection timeout
        return new DatabaseError('Database connection timeout', error);

      default:
        return new DatabaseError('Database operation failed', error);
    }
  }

  /**
   * Log error details
   */
  private static logError(
    error: unknown,
    correlationId: string,
    request?: NextRequest
  ) {
    const errorInfo = {
      correlationId,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      request: request
        ? {
            method: request.method,
            url: request.url,
            headers: Object.fromEntries(request.headers.entries()),
          }
        : undefined,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    };

    if (error instanceof AppError && error.isOperational) {
      console.warn('[ERROR]', JSON.stringify(errorInfo, null, 2));
    } else {
      console.error('[CRITICAL ERROR]', JSON.stringify(errorInfo, null, 2));
    }
  }

  /**
   * Report critical errors to monitoring service
   */
  private static reportToMonitoring(error: AppError, request?: NextRequest) {
    // Report to Sentry if available
    if (typeof window === 'undefined') {
      // Server-side
      try {
        const Sentry = require('@sentry/nextjs');
        Sentry.captureException(error, {
          tags: {
            type: 'api_error',
            operational: error.isOperational,
            code: error.code,
          },
          extra: {
            details: error.details,
            correlationId: error.correlationId,
            request: request
              ? {
                  method: request.method,
                  url: request.url,
                  headers: Object.fromEntries(request.headers.entries()),
                }
              : undefined,
          },
        });
      } catch (e) {
        // Sentry not available
      }
    }

    // Also log critical errors
    console.error('[MONITORING] Critical error:', {
      error: error.toJSON(),
      request: request
        ? {
            method: request.method,
            url: request.url,
          }
        : undefined,
    });
  }

  /**
   * Generate unique correlation ID
   */
  private static generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Wrap async route handlers with error handling
   */
  static wrap(
    handler: (
      request: NextRequest,
      context?: any
    ) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, context?: any) => {
      try {
        return await handler(request, context);
      } catch (error) {
        return this.handle(error, request);
      }
    };
  }

  /**
   * Create a safe async function that catches errors
   */
  static async safe<T>(
    fn: () => Promise<T>,
    fallback?: T
  ): Promise<[T | undefined, AppError | undefined]> {
    try {
      const result = await fn();
      return [result, undefined];
    } catch (error) {
      const appError = this.normalizeError(error);
      return [fallback, appError];
    }
  }
}