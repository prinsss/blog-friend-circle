# blog-friend-circle

[中文文档](README.zh.md)

Show latest posts from your subscribed blogs as a more attractive friends page.

Expand the circle of bloggers and readers! 💫

## Features

- 📖 Fetch latest blog posts with RSS feeds
- 📚 Show a list of your subscribed blogs (imagine it as a shared RSS aggregator!)
- 🗺️ Help your readers discover excellent blogs
- 🕸️ Let indie bloggers get more subscribers
- ✨ Designed to be embedded and fit into almost any page
- 📟 Build with old good HTML, CSS, and minimal client-side JavaScript
- 🤖️ Leverage [Miniflux](https://miniflux.app) API as backend (self-hosting supported)
- 👷 Deploy to [Cloudflare Workers](https://workers.cloudflare.com) and many runtimes (coming soon)

## Motivation

We indie bloggers usually have a "friends" page, where we exchange website links with other bloggers. By doing so, we drive traffic to each other's blogs and all of us benefit from it by being discovered by more readers. It's also a great way to promote ourselves as we don't have a big platform like Medium or algorithmic feed like Twitter.

However, the traditional "friends" page is just a curated list of links, along with a brief description of each blog. It could be sometimes boring and not very attractive to visitors when there is a long list. You have to click each link to see what's new on each blog.

So, couldn't we make it more interesting? Instead of just showing a list of links, we can show latest posts from these blogs directly on the "friends" page, with titles and excerpts. For both blog owners and visitors, they can see what's new on each blog at a glance.

## Setup

As this project uses Miniflux as backend for RSS feed fetching and caching (don't reinvent the wheel! 😉), you need to have a Miniflux instance running. You can either [self-host](https://miniflux.app/docs/installation.html) it or use the [official hosted service](https://miniflux.app/hosting.html).

You may need to set `CLEANUP_ARCHIVE_UNREAD_DAYS` and `CLEANUP_ARCHIVE_READ_DAYS` longer in Miniflux's [configuration file](https://miniflux.app/docs/configuration.html) to make sure that posts fetched won't be deleted too soon.

```bash
# Fill in your Miniflux API Endpoint, API Token
cp wrangler.example.toml wrangler.toml

# Install dependencies (Node.js 20+ recommended)
npm install

# Create a KV namespace and fill the ID in wrangler.toml
npx wrangler kv:namespace create API_CACHE_KV

# Deploy to Cloudflare Workers
npm run deploy
```

## Usage

Embedding the friend circle into your page is as easy as adding a `script` tag:

```html
<!-- Create a category in Miniflux and fill the ID here. (displayed in the address bar)  -->
<script data-category-id="1" async src="https://circle.example.workers.dev/app.js"></script>
```

Here is a live demo:

[Friends - PRIN BLOG](https://prinsss.github.io/friends/)

It will automatically initialize a `iframe` and render the friend circle on your page. You can also pass some options to customize the appearance:

```jsx
<script
  // Default page to show when loaded. Available options: "blogs", "posts".
  data-page="blogs"
  // Set the Miniflux category ID to filter blogs.
  data-category-id="1"
  // Set class name of iframe element.
  data-class="bfc-frame"
  // Set loading attribute of iframe element. Available options: "lazy", "eager".
  data-loading="lazy"
  // Set scrolling attribute of iframe element. Available options: "yes", "no", "auto".
  data-scrolling="no"
  // Set inline style of iframe element.
  data-style="width: 100%; border: none; min-height: 150px"
  // Set inline style of loading text element.
  data-loading-style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)"
  // Disable the behavior of resizing iframe to fit its content.
  data-no-resize="false"
  src="https://circle.example.workers.dev/app.js"
  async
></script>
```

## Development

```bash
npx wrangler kv:namespace create API_CACHE_KV --preview
npm run dev
npm run dev:client
```

## Acknowledgements

This project is greatly inspired by [hexo-circle-of-friends](https://github.com/Rock-Candy-Tea/hexo-circle-of-friends) and [planet.js](https://github.com/phoenixlzx/planet.js).

The default theme is inspired by [Miniflux](https://github.com/miniflux/v2)'s web reader. The design of loading script is inspired by [giscus](https://github.com/giscus/giscus).

## License

[MIT](LICENSE)
