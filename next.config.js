/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow builds to continue even with ESLint warnings/errors
    ignoreDuringBuilds: false,
  },
  // Disable the strict HTML link check for API routes
  typescript: {
    // Type errors won't prevent builds in development mode
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig