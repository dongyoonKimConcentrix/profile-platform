import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // n8n Upload Image → /api/n8n/upload-avatar 호출 시 base64 본문이 1MB 초과할 수 있음
    proxyClientMaxBodySize: "10mb",
  },
};

export default nextConfig;
