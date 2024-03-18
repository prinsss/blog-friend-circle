# blog-friend-circle

[English Documentation](README.md)

在你的博客友链页面上展示友链站点的最新文章列表！博主可以快速浏览新文章，访客也可以方便地找到可能感兴趣的内容。

友链朋友圈，扩大博主和读者的圈子！💫

## 特点

- 📖 通过 RSS 抓取友链博客的最新文章
- 📚 展示你已订阅的博客列表（你可以把它当作一个共享的 RSS 阅读器！）
- 🗺️ 帮助你的读者发现更多优秀的博客
- 🕸️ 让独立博客获得更多订阅者
- ✨ 极简设计，可嵌入并适应几乎任何页面
- 📟 使用原生态 HTML & CSS 构建，仅包含微量客户端 JavaScript
- 🤖️ 使用 [Miniflux](https://miniflux.app) API 作为后端（支持自建）
- 👷 部署到 [Cloudflare Workers](https://workers.cloudflare.com) 和其他运行时（在写了）

## 动机

独立博客大多都会有一个「友情链接」页面，在这里我们与其他博主交换网站链接，互相将对方的网址贴在自己的网站上。

和 Medium、Twitter 之类的大平台不同，每一个独立博客都是一个信息孤岛。我们没有类似「你可能喜欢其他人写的这些文章」的推荐机制，所以除了搜索引擎、社交网络引荐之外，交换友链也是一个十分重要的，连接这些信息孤岛的架桥方式。

然而传统的友链页面通常只包含了每个博客的标题、描述、头像、链接等信息，当列表很长时，读者可能就没兴趣去一个个点了。而且博主自己想要浏览友链博客的新文章时，可能也要一个个点过去才能看到更新的内容（除非本来就有在用 RSS 阅读器）。

那么我们是不是可以直接把一个精简的 RSS 阅读器嵌入到友链页面上，向访客直接展示每个博客的最新文章列表呢？就像微信的朋友圈一样，它是一个聚合的订阅流，但是每个人都可以看到。如果用户在浏览时看到感兴趣的内容，就可以直接点击链接跳转到对应的博客，比起传统友链点击率会更高。

## 设置

由于本项目使用 Miniflux 作为后端进行 RSS 订阅获取和缓存（不要重复造轮子😉），你需要一个可用的 Miniflux 实例。你可以[自行搭建](https://miniflux.app/docs/installation.html)或使用[官方托管服务](https://miniflux.app/hosting.html)。

你可能需要在 Miniflux 的 [配置文件](https://miniflux.app/docs/configuration.html) 中将 `CLEANUP_ARCHIVE_UNREAD_DAYS` 和 `CLEANUP_ARCHIVE_READ_DAYS` 设置得更长，以确保获取到的文章不会被太快删除。

```bash
# 填入你的 Miniflux API Endpoint、API Token
cp wrangler.example.toml wrangler.toml

# 安装依赖（推荐使用 Node.js 20+）
npm install

# 创建一个 KV namespace 并填入 ID 至 wrangler.toml
npx wrangler kv:namespace create API_CACHE_KV

# 部署到 Cloudflare Workers
npm run deploy
```

## 使用

只需简单添加一个 `script` 标签，就可以将友链朋友圈嵌入到你的博客页面中：

```html
<!-- Category ID 填写你在 Miniflux 中创建的分类 ID（点进分类页面后，地址栏中的数字即为 ID） -->
<script data-category-id="1" async src="https://circle.example.workers.dev/app.js"></script>
```

实际效果如下：

[友情链接 - PRIN BLOG](https://prinsss.github.io/friends/)

它会自动初始化一个 `iframe` 并加载内容。你也可以传递一些选项来自定义相关行为：

```jsx
<script
  // 加载时显示的默认页面。可用选项: "blogs", "posts".
  data-page="blogs"
  // 设置 Miniflux 的分类 ID 以筛选博客。
  data-category-id="1"
  // 设置 iframe 元素的 class。
  data-class="bfc-frame"
  // 设置 iframe 元素的 loading 属性。可用选项: "lazy", "eager".
  data-loading="lazy"
  // 设置 iframe 元素的 scrolling 属性。可用选项: "yes", "no", "auto".
  data-scrolling="no"
  // 设置 iframe 元素的内联样式。
  data-style="width:100%;border:none;color-scheme:normal;min-height:150px"
  // 设置加载文本元素的内联样式。
  data-loading-style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)"
  // 禁止 iframe 高度自适应。
  // 如果希望 iframe 内容可滚动，请将此选项设置为 "true"。
  data-no-resize="false"
  src="https://circle.example.workers.dev/app.js"
  async
></script>
```

## 开发

```bash
npx wrangler kv:namespace create API_CACHE_KV --preview
npm run dev
npm run dev:client
```

## 致谢

本项目的灵感来自于先驱者 [hexo-circle-of-friends](https://github.com/Rock-Candy-Tea/hexo-circle-of-friends) 和 [planet.js](https://github.com/phoenixlzx/planet.js)。

本项目的默认主题参考了 [Miniflux](https://github.com/miniflux/v2) 的网页阅读器，加载脚本的设计参考了 [giscus](https://github.com/giscus/giscus)。

## 开源许可

[MIT](LICENSE)
