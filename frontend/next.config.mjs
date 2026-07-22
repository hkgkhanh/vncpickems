/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://103.82.25.74:26090/api/:path*',
      },
    ]
  },
};

export default nextConfig;
