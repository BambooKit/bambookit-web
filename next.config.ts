import type { NextConfig } from "next";
import pkg from "./package.json";

// Static export: `npm run build` writes the whole site to ./out (served by a Render Static Site).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  // Shown in the ⓘ error details and sent as X-BK-Client: web/<version>.
  env: { NEXT_PUBLIC_WEB_VERSION: pkg.version },
};

export default nextConfig;
