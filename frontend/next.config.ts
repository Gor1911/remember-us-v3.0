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

// Routes that are NOT memorial slugs (single-segment top-level paths).
const NON_MEMORIAL =
  'example|terms|privacy|dashboard|memorial|forgot-password|reset-password|q|success|_next|images|api|media|favicon.ico|robots.txt|sitemap.xml';

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: { remotePatterns },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Everything except the two public marketing pages is noindex (robots.txt is not access control).
      {
        source: "/:path((?!example$|_next/|images/).+)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // The memorial URL (and reset-password token URL) is a secret: never leak it via Referer.
      {
        source: `/:slug((?!(?:${NON_MEMORIAL})$)[^/]+)`,
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
      // QR tokens and payment session ids are secrets.
      {
        source: "/q/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/success",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/:page(forgot-password|reset-password)",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/api/:path*",   destination: `${backendUrl}/api/:path*` },
      { source: "/media/:path*", destination: `${backendUrl}/media/:path*` },
    ];
  },
};

export default nextConfig;
