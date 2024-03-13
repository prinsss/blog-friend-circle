export type Environment = {
  Bindings: {
    API_ENDPOINT: string;
    API_TOKEN: string;
    API_CACHE_KV: KVNamespace;
    API_CACHE_TTL: number;
  };
};

export * from './api';
