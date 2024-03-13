import { Context } from 'hono';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Environment } from './types';

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
