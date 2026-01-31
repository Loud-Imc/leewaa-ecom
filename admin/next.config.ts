const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'api.leewaa.in',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'api.leewaa.com',
                pathname: '/uploads/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '4000',
                pathname: '/uploads/**',
            },
        ],
        unoptimized: true, // Bypass potential 400 errors if sharp is missing
    },
};

export default nextConfig;
