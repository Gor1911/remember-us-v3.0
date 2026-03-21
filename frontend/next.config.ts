import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
const backendHost = process.env.BACKEND_MEDIA_HOST || "127.0.0.1";
const backendPort = process.env.BACKEND_MEDIA_PORT || "8000";

// Public hostname where media URLs point (e.g. VPS IP or domain)
const publicHost = process.env.NEXT_PUBLIC_MEDIA_HOST || "";

const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
  { protocol: "http", hostname: backendHost, port: backendPort, pathname: "/media/**" },
  { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/media/**" },
  { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
];

// Add public VPS IP/domain if provided (no port — goes through nginx on port 80)
if (publicHost) {
  remotePatterns.push({ protocol: "http", hostname: publicHost, pathname: "/media/**" });
  remotePatterns.push({ protocol: "https", hostname: publicHost, pathname: "/media/**" });
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: { remotePatterns },
  async rewrites() {
    return [
      { source: "/api/:path*",   destination: `${backendUrl}/api/:path*` },
      { source: "/media/:path*", destination: `${backendUrl}/media/:path*` },
    ];
  },
};

export default nextConfig;
