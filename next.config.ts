import type { NextConfig } from "next";

// The admin is a separate Next.js app (Fexo-admin) on its own domain, so
// /admin on the storefront just redirects there. Set ADMIN_URL per
// deployment; it defaults to the admin's local dev server.
const ADMIN_URL = `${(process.env.ADMIN_URL ?? "http://localhost:3001").replace(/\/$/, "")}/`;

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  turbopack: {
    resolveAlias: {
      // See src/lib/shims/mediapipe-pose.js
      '@mediapipe/pose': './src/lib/shims/mediapipe-pose.js',
    },
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: ADMIN_URL,
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: `${ADMIN_URL}:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
