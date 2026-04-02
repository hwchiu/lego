/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '/lego',
  assetPrefix: '/lego/',
  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;
