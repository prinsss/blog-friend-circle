import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { Environment } from './types';
import { api } from './utils';

const app = new Hono<Environment>();

app.use(logger());

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/feeds', async (c) => {
  const data = await api(c).get(`/v1/categories/${c.env.CATEGORY_ID}/feeds`);
  return c.json(data);
});

app.get('/entries', async (c) => {
  const data = await api(c).get(`/v1/categories/${c.env.CATEGORY_ID}/entries`, {
    limit: '100',
    order: 'published_at',
    direction: 'desc',
  });
  return c.json(data);
});

export default app;
