/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Podcast artwork is served from many third-party CDNs; allow remote https images.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
