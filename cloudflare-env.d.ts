declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    ADMIN_EMAIL?: string;
    RATE_LIMIT_SALT?: string;
    PUBLIC_SITE_ORIGIN?: string;
  }
}
