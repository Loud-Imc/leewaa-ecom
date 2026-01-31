import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.leewaa.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
    },
    // Disable static optimization to avoid Suspense boundary issues
    output: 'standalone',
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

export default nextConfig;
