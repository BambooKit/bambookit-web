import type { NextConfig } from "next";

// Static export: `npm run build` writes the whole site to ./out (served by a Render Static Site).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
