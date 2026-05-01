import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nuro/contracts"],
  output: 'standalone',
};

export default nextConfig;
