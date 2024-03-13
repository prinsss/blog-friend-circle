import { Style, css, cx } from 'hono/css';

// Here we use server-side CSS-in-JS and inline all styles into the HTML.
const globalStyle = css`
  body {
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif,
      Apple Color Emoji, Segoe UI Emoji;
  }

  * {
    margin: 0;
    padding: 0;
  }

  nav {
    display: flex;
    justify-content: center;
    margin-bottom: 1em;

    a {
      color: #333;
    }

    a.active {
      font-weight: bold;
    }

    a:not(:last-child) {
      margin-right: 1.5em;
    }
  }
`;

const blogStyle = css`
  .blog-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1em;
  }

  @media (min-width: 768px) {
    .blog-list {
      grid-template-columns: 1fr 1fr;
    }
  }

  .blog-item {
    border: 1px dotted #ddd;
    padding: 0.8em;
    overflow: hidden;
  }
`;

const itemStyle = css`
  .item-title {
    font-size: 1em;
    margin-bottom: 0.5em;
    line-height: 1;

    a {
      color: #3366cc;
    }

    img {
      width: 1em;
      vertical-align: top;
      margin-right: 0.5em;
    }
  }

  .item-meta {
    color: #777;
    font-size: 0.8em;

    li {
      display: inline-block;
    }

    a {
      color: #777;
      text-decoration: none;
    }

    li:not(:last-child):after {
      content: '|';
      color: #aaa;
      display: inline-block;
      width: 1em;
      text-align: center;
    }
  }
`;

export const AppStyle = () => (
  <Style>
    {css`
      ${globalStyle}

      .bfc-container {
        ${itemStyle}
        ${blogStyle}
      }
    `}
  </Style>
);
