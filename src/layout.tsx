import { html } from 'hono/html';
import { FC, PropsWithChildren } from 'hono/jsx';
import { AppStyle } from './styles';
import { Entry, Feed } from './types';
import { formatDate, toRelativeTime } from './utils';

export const Layout = (props: PropsWithChildren<{ page: string }>) => html`
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>blog-friend-circle</title>
      ${(<AppStyle />)}
    </head>
    <body>
      <nav>
        <a class="${props.page === 'posts' ? 'active' : ''}" href="/posts">Posts</a>
        <a class="${props.page === 'blogs' ? 'active' : ''}" href="/blogs">Blogs</a>
        <a href="https://github.com/prinsss/blog-friend-circle" target="_blank" rel="noopener">
          About
        </a>
      </nav>
      <div class="bfc-container">${props.children}</div>
    </body>
    <script>
      window.addEventListener('load', (event) => {
        const el = document.querySelector('html');
        const height = Math.ceil(el.offsetHeight);
        window.parent.postMessage({ type: 'resize', value: height }, '*');
      });

      window.addEventListener('unload', (event) => {
        window.parent.postMessage({ type: 'resize', value: 150 }, '*');
      });
    </script>
  </html>
`;

export const ExternalLink = (props: Hono.AnchorHTMLAttributes) => (
  // We keep the referrer here so that the target site can see where the traffic is coming from.
  <a target="_blank" rel="noopener" {...props} />
);

export const BlogItem = ({ data }: PropsWithChildren<{ data: Feed }>) => (
  <article class="item blog-item">
    <h2 class="item-title">
      <img src={`/icon/${data.icon.icon_id}`} height="16" loading="lazy" alt={data.title} />
      <ExternalLink href={data.site_url}>{data.title}</ExternalLink>
    </h2>
    <ul class="item-meta">
      <li class="item-meta-item">
        <ExternalLink href={data.site_url} title={data.site_url}>
          {new URL(data.site_url).hostname}
        </ExternalLink>
      </li>
      <li class="item-meta-item">
        Last fetched:{' '}
        <time datetime={formatDate(data.checked_at)} title={formatDate(data.checked_at)}>
          {toRelativeTime(data.checked_at)}
        </time>
      </li>
    </ul>
  </article>
);

export const PostItem = ({ data }: PropsWithChildren<{ data: Entry }>) => (
  <article class="item blog-item">
    <h2 class="item-title">
      <img src={`/icon/${data.feed.icon.icon_id}`} height="16" loading="lazy" alt={data.title} />
      <ExternalLink href={data.url}>{data.title}</ExternalLink>
    </h2>
    <ul class="item-meta">
      <li class="item-meta-item">
        <ExternalLink href={data.feed.site_url}>{data.feed.title}</ExternalLink>
      </li>
      <li class="item-meta-item">
        <time datetime={formatDate(data.published_at)} title={formatDate(data.published_at)}>
          {toRelativeTime(data.published_at)}
        </time>
      </li>
      <li class="item-meta-item">{data.reading_time} min read</li>
    </ul>
  </article>
);
