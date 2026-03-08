import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Di-rio",
  assetPrefix: "/Di-rio/",
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
