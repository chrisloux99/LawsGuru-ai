const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface FetchOptions extends RequestInit {
  retries?: number;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retries = MAX_RETRIES, timeout = 30000, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        if (!response.ok) {
          const body = await response.text().catch(() => "");
          throw new ApiError(
            body || `Request failed: ${response.status}`,
            response.status
          );
        }
        return response;
      }

      // Retry on server errors (5xx)
      if (response.status >= 500 && attempt < retries) {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
        continue;
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) throw error;

      // Retry on network errors
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt));
        continue;
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Network error",
        0
      );
    }
  }

  throw new ApiError("Max retries exceeded", 0);
}
