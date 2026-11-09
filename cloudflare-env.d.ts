// Import Worker types as a module so their HTMLRewriter Element cannot merge with the student DOM.
declare namespace Cloudflare {
  interface Env {
    DB?: import('@cloudflare/workers-types/index').D1Database;
    BUCKET?: import('@cloudflare/workers-types/index').R2Bucket;
    ADMIN_USER_IDS?: string;
    ANALYTICS_COOKIE_SECRET?: string;
  }
}
declare module 'cloudflare:workers' { export const env: Cloudflare.Env; }
