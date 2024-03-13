import { Hono } from 'hono';
import { etag } from 'hono/etag';
import { logger } from 'hono/logger';
import { serveStatic } from 'hono/cloudflare-workers';
import manifest from '__STATIC_CONTENT_MANIFEST';

import { Environment } from './types';
import { BlogItem, Layout, PostItem } from './layout';
import { api, base64ToBlob } from './utils';

const app = new Hono<Environment>();

app.use(logger());

app.get('/client.js', etag(), serveStatic({ path: './client.js', manifest }));

app.get('/', (c) => {
  return c.html(<Layout page="home">Welcome</Layout>);
});

app.get('/blogs', async (c) => {
  const data = await api(c).getCategoryFeeds();

  return c.html(
    <Layout page="blogs">
      <div class="blog-list">
        {data
          .sort((a, b) => a.id - b.id)
          .map((feed) => (
            <BlogItem data={feed} />
          ))}
      </div>
    </Layout>
  );
});

app.get('/posts', async (c) => {
  const data = await api(c).getCategoryEntries();
  return c.html(
    <Layout page="posts">
      <div class="blog-list">
        {data.entries.map((feed) => (
          <PostItem data={feed} />
        ))}
      </div>
    </Layout>
  );
});

app.get('/icon/:id', etag(), async (c) => {
  const id = Number(c.req.param().id);
  const { data, mime_type } = await api(c).getIcon(id);
  const imageBlob = base64ToBlob(data, mime_type);

  return new Response(imageBlob, {
    status: 200,
    headers: {
      'Content-Type': mime_type,
      'Content-Length': `${imageBlob.size}`,
      'Cache-Control': 'public, max-age=2592000',
    },
  });
});

export default app;
