/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
    ],
  },

  // ✅ Ignore ESLint errors during Vercel builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;