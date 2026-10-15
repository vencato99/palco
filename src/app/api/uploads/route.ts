import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requireUser } from '@/lib/auth';
import { HttpError, ok, route } from '@/lib/http';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };

/**
 * Upload de fotos para o disco local (public/uploads).
 * Em produção, troque por S3/R2 mantendo a mesma resposta { url }.
 */
export const POST = route(async (req) => {
  await requireUser();
  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) throw new HttpError(400, 'Envie um arquivo no campo "file".');
  const ext = TYPES[file.type];
  if (!ext) throw new HttpError(415, 'Use JPG, PNG, WEBP ou AVIF.');
  if (file.size > MAX_BYTES) throw new HttpError(413, 'A foto deve ter no máximo 8 MB.');

  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return ok({ url: `/uploads/${name}` }, { status: 201 });
});
