import { getFile, KEY_RE } from '@/lib/storage';

export const runtime = 'nodejs';

const TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', avif: 'image/avif' };

/**
 * GET /api/files/venues/2026/10/<uuid>.jpg
 * Entrega a foto do bucket. Cada arquivo tem nome único e nunca muda,
 * então o cache é de 1 ano (navegador, CDN e otimizador do next/image).
 */
export async function GET(_req: Request, { params }: { params: { key: string[] } }) {
  const key = params.key.join('/');
  if (!KEY_RE.test(key)) return new Response('Not found', { status: 404 });
  const file = await getFile(key);
  if (!file) return new Response('Not found', { status: 404 });
  const ext = key.split('.').pop()!;
  return new Response(file.body as BodyInit, {
    headers: {
      'Content-Type': file.contentType ?? TYPES[ext]!,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      ...(file.length ? { 'Content-Length': String(file.length) } : {}),
    },
  });
}
