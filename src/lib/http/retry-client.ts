interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  retryIf?: (error: any, attempt: number) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

export class RetryClient {
  private static defaultOptions: RetryOptions = {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
    retryIf: (error) => {
      // Retry on network errors or 5xx status codes
      if (!error.response) return true;
      const status = error.response?.status;
      return status >= 500 && status < 600;
    },
  };

  static async execute<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: any;

    for (let attempt = 1; attempt <= opts.maxAttempts!; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Check if we should retry
        if (attempt === opts.maxAttempts || !opts.retryIf!(error, attempt)) {
          throw error;
        }

        // Call retry handler if provided
        opts.onRetry?.(error, attempt);

        // Calculate delay
        const delay = this.calculateDelay(attempt, opts);

        // Wait before retrying
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private static calculateDelay(attempt: number, options: RetryOptions): number {
    const baseDelay = options.delay || 1000;

    if (options.backoff === 'exponential') {
      return baseDelay * Math.pow(2, attempt - 1);
    }

    return baseDelay * attempt;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Fetch wrapper with retry logic
export class RetryFetch {
  static async fetch(
    url: string,
    init?: RequestInit,
    retryOptions?: RetryOptions
  ): Promise<Response> {
    return RetryClient.execute(
      async () => {
        const response = await fetch(url, init);

        // Throw error for non-2xx responses to trigger retry
        if (!response.ok) {
          const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.response = response;
          throw error;
        }

        return response;
      },
      {
        ...retryOptions,
        onRetry: (error, attempt) => {
          console.warn(`Request failed, retrying (${attempt}/${retryOptions?.maxAttempts || 3}):`, {
            url,
            error: error.message,
          });
          retryOptions?.onRetry?.(error, attempt);
        },
      }
    );
  }

  static async json<T>(
    url: string,
    init?: RequestInit,
    retryOptions?: RetryOptions
  ): Promise<T> {
    const response = await this.fetch(url, init, retryOptions);
    return response.json();
  }
}

// React Query retry configuration
export function getQueryRetryConfig(options?: RetryOptions) {
  return {
    retry: options?.maxAttempts || 3,
    retryDelay: (attemptIndex: number) => {
      const baseDelay = options?.delay || 1000;
      if (options?.backoff === 'linear') {
        return baseDelay * (attemptIndex + 1);
      }
      return Math.min(baseDelay * Math.pow(2, attemptIndex), 30000);
    },
  };
}