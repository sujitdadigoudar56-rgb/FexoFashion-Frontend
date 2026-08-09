import type { NextConfig } from "next";

// The backend (Django) is a separate deploy at a different domain and owns
// /admin/ entirely — its own session cookies, CSRF, and static assets are
// all scoped to that domain. Reverse-proxying it through this app would
// break those; a redirect just sends the browser there directly instead.
const ADMIN_URL = "https://fexofashion.onrender.com/admin/";

const nextConfig: NextConfig = {
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
