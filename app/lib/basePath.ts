/**
 * Base path for static assets in production (basePath: '/lego').
 * Use this prefix for <img src> paths that reference public/ files,
 * since plain <img> tags do not auto-apply Next.js basePath.
 * next/image's <Image> component handles basePath automatically and does NOT need this prefix.
 */
export const BASE_PATH = process.env.NODE_ENV === 'production' ? '/lego' : '';
