/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local XAMPP WordPress
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/Pak_Travel/wp-content/uploads/**",
      },

      // Live WordPress
      {
        protocol: "https",
        hostname: "hammada154.sg-host.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;