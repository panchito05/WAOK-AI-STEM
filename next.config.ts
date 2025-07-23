import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { 
      canvas: 'canvas',
      handlebars: 'handlebars',
      dotprompt: 'dotprompt'
    }];
    return config;
  },
};

export default nextConfig;
