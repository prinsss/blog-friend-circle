import { Hono } from 'hono';
import { cache } from 'hono/cache';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/cloudflare-workers';
import manifest from '__STATIC_CONTENT_MANIFEST';

import { Environment } from './types';
import { BlogItem, Layout, PostItem } from './layout';
import { categoryAllowlist } from './middlewares';
import { base64ToBlob } from './utils';
import { api } from './api';

const app = new Hono<Environment>();

app.use(logger());

app.get(
  '/app.js',
  cache({
    cacheName: 'static',
    cacheControl: 'max-age=3600',
  }),
  serveStatic({ path: './app.js', manifest })
);

app.get(
  '/style.css',
  cache({
    cacheName: 'static',
    cacheControl: 'max-age=3600',
  }),
  serveStatic({ path: './style.css', manifest })
);

// Home page.
app.get('/', (c) => {
  return c.html('Hello, blog-friend-circle!');
});

// Blog list page.
app.get('/category/:id/feeds', categoryAllowlist(), async (c) => {
  const id = Number(c.req.param().id);
  const data = await api(c).getCategoryFeeds(id);

  return c.html(
    <Layout page="blogs" categoryId={id}>
      <div class="list">
        {data
          .sort((a, b) => a.id - b.id)
          .map((feed) => (
            <BlogItem data={feed} />
          ))}
      </div>
    </Layout>
  );
});

// Post list page.
app.get('/category/:id/entries', categoryAllowlist(), async (c) => {
  const id = Number(c.req.param().id);
  const data = await api(c).getCategoryEntries(id);

  return c.html(
    <Layout page="posts" categoryId={id}>
      <div class="list">
        {data.entries.map((feed) => (
          <PostItem data={feed} />
        ))}
      </div>
    </Layout>
  );
});

app.get(
  '/icon/:id',
  cache({
    cacheName: 'static',
    cacheControl: 'max-age=2592000',
  }),
  async (c) => {
    const id = Number(c.req.param().id);
    const { data, mime_type } = await api(c).getIcon(id);
    const imageBlob = base64ToBlob(data, mime_type);

    return new Response(imageBlob, {
      status: 200,
      headers: {
        'Content-Type': mime_type,
        'Content-Length': `${imageBlob.size}`,
      },
    });
  }
);

export default app;
