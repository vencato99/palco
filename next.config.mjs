/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Só imagens do próprio site (uploads). Liberar hosts externos um a um, nunca '**'.
    remotePatterns: [],
  },
  experimental: { serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'] },
};
export default nextConfig;
