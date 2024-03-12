import { Context } from 'hono';
import { Environment } from './types';

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
  const { c, cacheKey = url, expirationTtl, ...fetchOptions } = options;
  const kv = c.env.API_CACHE_KV;

  const { value, metadata } = await kv.getWithMetadata<MemorizedFetchMetadata>(cacheKey);

  if (value && metadata) {
    console.log('Cache HIT:', cacheKey);
    return new Response(value, metadata);
  }

  console.log('Cache MISS:', cacheKey);
  const response = await fetch(url, fetchOptions);
  const body = await response.text();
  c.executionCtx.waitUntil(kv.put(cacheKey, body, { expirationTtl }));

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
export async function apiFetch(options: ApiOptions) {
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

  const data = await response.json();
  return data;
}

/**
 * A simple API client.
 */
export function api(c: Context<Environment>) {
  return {
    get: (url: string, query?: ApiOptions['query']) => apiFetch({ c, url, query }),
    post: (url: string, body?: ApiOptions['body']) => apiFetch({ c, url, method: 'POST', body }),
  };
}
