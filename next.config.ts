import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default (phase: string): NextConfig => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    serverExternalPackages: ["@electric-sql/pglite", "postgres"],
    distDir: process.env.NEXT_DIST_DIR || (isDev ? ".next-dev" : ".next"),
    experimental: {
      optimizePackageImports: ["lucide-react"],
    },
  };
};
