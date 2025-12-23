/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ufs.sh (your video poster/background)
      { protocol: 'https', hostname: 'me7aitdbxq.ufs.sh' },
      { protocol: 'https', hostname: '**.ufs.sh' },

      // Unsplash & Pexels (from the sample)
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },

      // what you already had
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'https', hostname: 'localhost' },
    ],
  },
};

module.exports = nextConfig;
