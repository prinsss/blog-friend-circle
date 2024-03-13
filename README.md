# blog-friend-circle

Show latest posts from your subscribed blogs as a more attractive friends page.

Expand the circle of bloggers and readers! 💫

## Features

- 📖 Fetch latest blog posts with RSS feeds
- 📚 Show a list of your subscribed blogs
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
# Fill in your Miniflux API Endpoint, API token and category ID
cp wrangler.example.toml wrangler.toml

# Install dependencies (Node.js 20+ recommended)
npm install

# Create a KV namespace and fill the ID in wrangler.toml
npx wrangler kv:namespace create API_CACHE_KV

# Deploy to Cloudflare Workers
npm run deploy
```

## Development

```bash
npx wrangler kv:namespace create API_CACHE_KV --preview
npm run dev
npm run dev:client
```

## Acknowledgements

This project is greatly inspired by [hexo-circle-of-friends](https://github.com/Rock-Candy-Tea/hexo-circle-of-friends) and [planet.js](https://github.com/phoenixlzx/planet.js).

## License

[MIT](LICENSE)
