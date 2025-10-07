'use client';

import React, { useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error) => void;
}

export function AsyncErrorBoundary({
  children,
  fallback,
  onError,
}: AsyncErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback(
    (error: Error) => {
      setError(error);
      onError?.(error);
      console.error('AsyncErrorBoundary caught:', error);
    },
    [onError]
  );

  // Provide error capturing context to children
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureError(new Error(event.reason));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [captureError]);

  if (error) {
    if (fallback) {
      return <>{fallback(error, resetError)}</>;
    }

    return <DefaultAsyncErrorFallback error={error} reset={resetError} />;
  }

  return <>{children}</>;
}

interface DefaultAsyncErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function DefaultAsyncErrorFallback({ error, reset }: DefaultAsyncErrorFallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            An error occurred
          </h3>
          <p className="mt-1 text-sm text-red-700">{error.message}</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-600">
                Stack trace
              </summary>
              <pre className="mt-1 text-xs text-red-600 overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={reset}
            className="mt-3 inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}