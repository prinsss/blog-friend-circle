import { MiddlewareHandler } from 'hono';
import { Environment } from './types';
import { HTTPException } from 'hono/http-exception';

/**
 * This middleware restricts access to categories to avoid exposing private data.
 */
export const categoryAllowlist = (): MiddlewareHandler<Environment> => {
  return async function categoryAllowlist(ctx, next) {
    // Allow requests to all categories if the allowlist is not set.
    if (!ctx.env.CATEGORY_ALLOWLIST) {
      await next();
      return;
    }

    // CATEGORY_ALLOWLIST should be a comma-separated list of category IDs.
    const id = Number(ctx.req.param<':id'>().id);
    const allowlist = ctx.env.CATEGORY_ALLOWLIST.split(',').map(Number);
    console.log('Checking category ID', id, 'against allowlist:', allowlist);

    if (!allowlist.includes(Number(id))) {
      throw new HTTPException(404, { message: 'Category not found.' });
    }

    await next();
  };
};
