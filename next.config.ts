import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Vehicle photos can come from any https host an admin pastes in.
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};

export default nextConfig;
