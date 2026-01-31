import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.leewaa.in',
            },
            {
                protocol: 'https',
                hostname: 'api.leewaa.com',
            },
            {
                protocol: 'http',
                hostname: '64.227.161.199',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
        // Allow unoptimized images if sharp is not available on server
        unoptimized: true,
    },
    // Standard build for next start
};

export default nextConfig;
