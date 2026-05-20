// ─── Unified API Client ────────────────────────────────────────────────────
// Shared fetch wrapper with timeout, retry, and AbortController support.
// All runtime fetch() calls in this project should go through this client.

export interface ApiClientOptions {
  /** Request timeout in milliseconds (default: 10000) */
  timeoutMs?: number;
  /** Number of retry attempts on network / 5xx errors (default: 2) */
  retries?: number;
  /** Delay between retries in milliseconds (default: 500) */
  retryDelayMs?: number;
  /** External AbortSignal to cancel the request early */
  signal?: AbortSignal;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly url?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch a URL with timeout, retry, and optional external abort signal.
 * Throws `ApiError` on non-2xx responses or network failures.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: ApiClientOptions & RequestInit = {},
): Promise<T> {
  const {
    timeoutMs = 10_000,
    retries = 2,
    retryDelayMs = 500,
    signal: externalSignal,
    ...fetchInit
  } = options;

  let lastError: Error = new ApiError(`Failed to fetch ${url}`);

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (externalSignal?.aborted) {
      throw new ApiError('Request aborted', undefined, url);
    }

    // Each attempt gets its own timeout controller so it can be cleared reliably.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    if (externalSignal) {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
      const res = await fetch(url, { ...fetchInit, signal: controller.signal });

      if (!res.ok) {
        throw new ApiError(`HTTP ${res.status} ${res.statusText}`, res.status, url);
      }

      return (await res.json()) as T;
    } catch (err) {
      // Do not retry if aborted externally
      if (externalSignal?.aborted) throw new ApiError('Request aborted', undefined, url);

      lastError = err instanceof Error ? err : new ApiError(String(err), undefined, url);

      // Do not retry on non-retryable HTTP errors (4xx)
      if (err instanceof ApiError && err.status && err.status >= 400 && err.status < 500) {
        throw err;
      }

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * (attempt + 1)));
      }
    } finally {
      // Always clear the timeout to prevent memory leaks, regardless of outcome
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
}
