import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: "export",
  distDir: "out",
  basePath: "/md-to-pdf",
  trailingSlash: true,
};

export default nextConfig;
