import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site, served from Cloudflare Workers static assets (see wrangler.jsonc).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
