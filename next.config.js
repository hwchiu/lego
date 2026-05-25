/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/lego',
  assetPrefix: '/lego/',
  images: { unoptimized: true },
  trailingSlash: true,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    config.module.rules.push({
      test: /\.html$/,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;
