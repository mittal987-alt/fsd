import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Using turbopack for dev with CSS support; build uses --webpack flag
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
