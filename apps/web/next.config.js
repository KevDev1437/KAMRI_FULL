/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@kamri/ui', '@kamri/lib'],
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig

