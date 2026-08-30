import type { NextConfig } from "next";

const requestedBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const basePath = requestedBasePath && requestedBasePath !== "/"
  ? `/${requestedBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";
const allowedDevOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const localDevOrigins = ["127.0.0.1", "localhost"];

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  allowedDevOrigins: [...new Set([...localDevOrigins, ...allowedDevOrigins])],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
