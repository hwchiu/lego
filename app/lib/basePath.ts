/**
 * Base path for static assets (basePath: '/lego').
 * Must match the `basePath` value in next.config.js.
 * Use this prefix for <img src> paths that reference public/ files,
 * since plain <img> tags do not auto-apply Next.js basePath.
 * next/image's <Image> component handles basePath automatically and does NOT need this prefix.
 *
 * Note: Next.js serves public/ files under the basePath prefix in both development and production,
 * so this constant is always '/lego' regardless of NODE_ENV.
 */
export const BASE_PATH = '/lego';
