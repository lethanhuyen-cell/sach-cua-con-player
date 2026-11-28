/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/audio/:file(\\d{2}_Tap_[^/]+)',
        destination: '/audio/lim-va-me-vacci/:file'
      },
      {
        source: '/images/episodes/:ep(\\d{2})/:path*',
        destination: '/images/episodes/lim-va-me-vacci/:ep/:path*'
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }
        ]
      }
    ];
  }
};

export default nextConfig;
