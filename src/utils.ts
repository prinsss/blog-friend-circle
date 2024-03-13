import { Context } from 'hono';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Environment } from './types';

dayjs.extend(relativeTime);

export type MemorizedFetchOptions = Parameters<typeof fetch>[1] & {
  c: Context<Environment>;
  cacheKey?: string;
  cacheTtl?: number;
  revalidate?: boolean;
};

export type MemorizedFetchMetadata = Pick<ResponseInit, 'headers' | 'status' | 'statusText'> & {
  cachedAt: number;
};

/**
 * A wrapper around fetch that caches the response in the KV store.
 */
export async function memorizedFetch(url: string, options: MemorizedFetchOptions) {
  const {
    c,
    cacheKey = url,
    cacheTtl = c.env.API_CACHE_TTL,
    revalidate,
    ...fetchOptions
  } = options;
  const kv = c.env.API_CACHE_KV;

  const { value, metadata } = await kv.getWithMetadata<MemorizedFetchMetadata>(cacheKey);

  // Use stale-while-revalidate strategy to ensure fast responses.
  if (!revalidate && value && metadata) {
    console.log('Cache HIT:', cacheKey);
    c.header('X-Cache-Status', 'HIT');

    const elapsed = Math.floor(Date.now() / 1000) - (metadata.cachedAt ?? 0);
    const isCacheStale = elapsed > cacheTtl;

    if (isCacheStale) {
      console.log('Cache STALE:', cacheKey);
      c.header('X-Cache-Status', 'STALE');

      // Return the stale response while revalidating in the background.
      c.executionCtx.waitUntil(
        memorizedFetch(url, { ...options, revalidate: true }).then((res) => res.arrayBuffer())
      );
    }

    return new Response(value, metadata);
  }

  console.log('Cache MISS:', cacheKey);
  c.header('X-Cache-Status', 'MISS');

  const response = await fetch(url, fetchOptions);
  const body = await response.clone().text();

  c.executionCtx.waitUntil(
    kv.put(cacheKey, body, {
      metadata: {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText,
        cachedAt: Math.floor(Date.now() / 1000),
      },
    })
  );

  return response;
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
