import { randomUUID } from 'node:crypto';
import { requireUser } from '@/lib/auth';
import { HttpError, ok, route } from '@/lib/http';
import { publicUrl, putFile } from '@/lib/storage';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024;

/** Confere a assinatura real do arquivo (não confia só no tipo informado pelo navegador). */
function sniff(b: Buffer): { ext: string; type: string } | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: 'jpg', type: 'image/jpeg' };
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { ext: 'png', type: 'image/png' };
  if (b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP') return { ext: 'webp', type: 'image/webp' };
  if (b.subarray(4, 12).toString() === 'ftypavif') return { ext: 'avif', type: 'image/avif' };
  return null;
}

/**
 * POST /api/uploads  (multipart: file, folder=venues|suggestions)
 * Grava a foto no bucket e devolve { url } para salvar no local ou na sugestão.
 */
export const POST = route(async (req) => {
  await requireUser();
  const form = await req.formData();
  const file = form.get('file');
  const folder = form.get('folder') === 'suggestions' ? 'suggestions' : 'venues';
  if (!(file instanceof File)) throw new HttpError(400, 'Envie um arquivo no campo "file".');
  if (file.size > MAX_BYTES) throw new HttpError(413, 'A foto deve ter no máximo 8 MB.');

  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniff(buf);
  if (!kind) throw new HttpError(415, 'Use uma imagem JPG, PNG, WEBP ou AVIF.');

  const now = new Date();
  const key = `${folder}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${randomUUID()}.${kind.ext}`;
  await putFile(key, buf, kind.type);
  return ok({ url: publicUrl(key) }, { status: 201 });
});
