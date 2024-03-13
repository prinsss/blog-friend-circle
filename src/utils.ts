import { Context } from 'hono';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Entry, Environment, Feed } from './types';

dayjs.extend(relativeTime);

export type MemorizedFetchOptions = Parameters<typeof fetch>[1] & {
  c: Context<Environment>;
  cacheKey?: string;
  expirationTtl?: number;
};

export type MemorizedFetchMetadata = ResponseInit;

/**
 * A wrapper around fetch that caches the response in the KV store.
 */
export async function memorizedFetch(url: string, options: MemorizedFetchOptions) {
  const { c, cacheKey = url, expirationTtl = c.env.API_CACHE_TTL, ...fetchOptions } = options;
  const kv = c.env.API_CACHE_KV;

  const { value, metadata } = await kv.getWithMetadata<MemorizedFetchMetadata>(cacheKey);

  if (value && metadata) {
    console.log('Cache HIT:', cacheKey);
    return new Response(value, metadata);
  }

  console.log('Cache MISS:', cacheKey);
  const response = await fetch(url, fetchOptions);
  const body = await response.clone().text();

  c.executionCtx.waitUntil(
    kv.put(cacheKey, body, {
      expirationTtl,
      metadata: {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
      },
    })
  );

  return response;
}

export type ApiOptions = MemorizedFetchOptions & {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: Record<string, unknown>;
};

/**
 * A fetch wrapper for interacting with the Miniflux API.
 */
export async function apiFetch<T>(options: ApiOptions) {
  const { c, method = 'GET', url, headers = {}, query, body, ...fetchOptions } = options;

  // Set the required headers for the API
  headers['X-Auth-Token'] = c.env.API_TOKEN;
  if (method === 'POST' || method === 'PUT') {
    headers['Content-Type'] = 'application/json';
  }

  // Construct the full API request URL
  let fullUrl = `${c.env.API_ENDPOINT}${url}`;
  if (query) {
    const params = new URLSearchParams(query);
    fullUrl += `?${params.toString()}`;
  }

  // Make the API request and cache the response
  const response = await memorizedFetch(fullUrl, {
    c,
    method,
    headers,
    body,
    ...fetchOptions,
  });

  const data = await response.json<T>();
  return data;
}

/**
 * A simple API client for Miniflux.
 */
export function api(c: Context<Environment>) {
  return {
    /**
     * @see https://miniflux.app/docs/api.html#endpoint-get-category-feeds
     */
    getCategoryFeeds() {
      return apiFetch<Feed[]>({ c, url: `/v1/categories/${c.env.CATEGORY_ID}/feeds` });
    },
    /**
     * @see https://miniflux.app/docs/api.html#endpoint-get-category-entries
     */
    getCategoryEntries() {
      return apiFetch<{ total: number; entries: Entry[] }>({
        c,
        url: `/v1/categories/${c.env.CATEGORY_ID}/entries`,
        query: {
          limit: '100',
          order: 'published_at',
          direction: 'desc',
        },
      });
    },
    /**
     * @see https://miniflux.app/docs/api.html#endpoint-get-feed-icon-by-icon-id
     */
    getIcon(iconId: number) {
      // Fallback to a default icon if the feed doesn't have one
      if (!iconId) {
        return Promise.resolve({
          id: 0,
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABJUlEQVR42mKgOogpKJBMTM08kJCS+RXAJ1UbVBRDUWQIRmACWmwEpHxuN8GpkRIdAOuRfehwnQDXe7696C+eJkdvoox+ceEd/7DWFZyUcinO6JNBf3FOP/z+HGXirkX0hzXs8YJbG78ZvHp2dtaP/3E+Owqwcv1aJLDGSl8Ap6kY7JDmcjfK6UklaDvR4iBfy/Zq+19cyCETqF7AdAiilF6RGbYV0hFWOm9dbyYBiu0QIBcK85XLm090guoDGI3AUPiOM3HJrtbhKs8XBvh7k4mO+DkNMWC0CL6saS5D1Q0IERcRrBKdVy729Ti0apaojlEFHvI1k+Q03t6HESOeMUbjILUJCpo0bK8C7DxI9ezFMtibDuiLQY8oDJn/h5yUKctM1AYAkF4mBkXjJukAAAAASUVORK5CYII=',
          mime_type: 'image/png',
        });
      }

      return apiFetch<{ id: number; data: string; mime_type: string }>({
        c,
        url: `/v1/icons/${iconId}`,
        expirationTtl: 2592000, // 30 days
      });
    },
  };
}

export function base64ToBlob(data: string, mimeType: string) {
  const base64 = data.split(',')[1];
  const byteString = atob(base64);
  const byteArray = new Uint8Array(new ArrayBuffer(byteString.length));

  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }

  return new Blob([byteArray], { type: mimeType });
}

export function toRelativeTime(date: string) {
  return dayjs().to(dayjs(date));
}

export function formatDate(date: string) {
  return dayjs(date).toString();
}
