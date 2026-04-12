/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/lego',
  assetPrefix: '/lego/',
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: { turbo: false },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;
