/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [
      "api-images.getimg.ai",
    ],
    // Allow dynamic Cloudflare R2 signed URLs returned by the image-generation API
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflarestorage.com',
      },
    ],
  },
}

export default nextConfig