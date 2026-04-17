import { withSerwist } from "@serwist/turbopack";
import type { NextConfig } from "next";
import { securityHeaders } from "./src/infrastructure/security/securityHeaders";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSerwist(nextConfig);
