import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const venues = await prisma.venue.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { slug: true, updatedAt: true } });
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/locais`, changeFrequency: 'daily' },
    { url: `${base}/buscar` },
    ...venues.map((v) => ({ url: `${base}/${v.slug}`, lastModified: v.updatedAt, changeFrequency: 'weekly' as const })),
  ];
}
