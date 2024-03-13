import { Context } from 'hono';
import { Entry, Environment, Feed } from './types';
import { MemorizedFetchOptions, memorizedFetch } from './utils';

export type Options = Omit<MemorizedFetchOptions, 'c'> & {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: Record<string, unknown>;
};

/**
 * A simple API client for Miniflux.
 */
export function api(c: Context<Environment>) {
  const request = async <T>(options: Options) => {
    const { method = 'GET', url, headers = {}, query, body, ...fetchOptions } = options;

    // Set the required headers for the API.
    headers['X-Auth-Token'] = c.env.API_TOKEN;
    if (method === 'POST' || method === 'PUT') {
      headers['Content-Type'] = 'application/json';
    }

    // Construct the full API request URL.
    let fullUrl = `${c.env.API_ENDPOINT}${url}`;
    if (query) {
      const params = new URLSearchParams(query);
      fullUrl += `?${params.toString()}`;
    }

    // Make the API request and cache the response.
    const response = await memorizedFetch(fullUrl, {
      c,
      method,
      headers,
      body,
      ...fetchOptions,
    });

    const data = await response.json<T>();
    return data;
  };

  return {
    /**
     * @see https://miniflux.app/docs/api.html#endpoint-get-category-feeds
     */
    getCategoryFeeds(categoryId: number) {
      return request<Feed[]>({ url: `/v1/categories/${categoryId}/feeds` });
    },
    /**
     * @see https://miniflux.app/docs/api.html#endpoint-get-category-entries
     */
    getCategoryEntries(categoryId: number) {
      return request<{ total: number; entries: Entry[] }>({
        url: `/v1/categories/${categoryId}/entries`,
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
      // Fallback to a default icon if the feed doesn't have one.
      if (!iconId) {
        return Promise.resolve({
          id: 0,
          data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABJUlEQVR42mKgOogpKJBMTM08kJCS+RXAJ1UbVBRDUWQIRmACWmwEpHxuN8GpkRIdAOuRfehwnQDXe7696C+eJkdvoox+ceEd/7DWFZyUcinO6JNBf3FOP/z+HGXirkX0hzXs8YJbG78ZvHp2dtaP/3E+Owqwcv1aJLDGSl8Ap6kY7JDmcjfK6UklaDvR4iBfy/Zq+19cyCETqF7AdAiilF6RGbYV0hFWOm9dbyYBiu0QIBcK85XLm090guoDGI3AUPiOM3HJrtbhKs8XBvh7k4mO+DkNMWC0CL6saS5D1Q0IERcRrBKdVy729Ti0apaojlEFHvI1k+Q03t6HESOeMUbjILUJCpo0bK8C7DxI9ezFMtibDuiLQY8oDJn/h5yUKctM1AYAkF4mBkXjJukAAAAASUVORK5CYII=',
          mime_type: 'image/png',
        });
      }

      return request<{ id: number; data: string; mime_type: string }>({
        url: `/v1/icons/${iconId}`,
        cacheTtl: 604800, // 1 week
      });
    },
  };
}
