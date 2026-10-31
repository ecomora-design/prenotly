import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "qrcode",
      "qr-code-styling",
      "@supabase/supabase-js",
    ],
  },
};

export default nextConfig;
