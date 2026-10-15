import 'server-only';
import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Armazenamento de fotos.
 * Produção: bucket S3-compatível (Railway Buckets, R2, S3…), configurado pelas variáveis S3_*.
 * Desenvolvimento sem essas variáveis: grava em ./.uploads (fora de /public, servido pela mesma rota).
 * Em ambos os casos a URL pública é /api/files/<chave> — trocar de provedor não muda nada no banco.
 */
const cfg = {
  endpoint: process.env.S3_ENDPOINT,
  bucket: process.env.S3_BUCKET,
  region: process.env.S3_REGION || 'auto',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
};
const useS3 = !!(cfg.endpoint && cfg.bucket && cfg.accessKeyId && cfg.secretAccessKey);

const g = globalThis as unknown as { s3?: S3Client };
const s3 = () =>
  (g.s3 ??= new S3Client({
    endpoint: cfg.endpoint,
    region: cfg.region,
    credentials: { accessKeyId: cfg.accessKeyId!, secretAccessKey: cfg.secretAccessKey! },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  }));

const LOCAL_DIR = path.join(process.cwd(), '.uploads');
/** Chaves aceitas: pastas conhecidas + nome gerado por nós. Bloqueia "../" e afins. */
export const KEY_RE = /^(venues|suggestions)\/\d{4}\/\d{2}\/[a-f0-9-]{36}\.(jpg|png|webp|avif)$/;
export const PUBLIC_PREFIX = '/api/files/';

export const publicUrl = (key: string) => `${PUBLIC_PREFIX}${key}`;
export const keyFromUrl = (url: string) => (url.startsWith(PUBLIC_PREFIX) ? url.slice(PUBLIC_PREFIX.length) : null);

export async function putFile(key: string, body: Buffer, contentType: string) {
  if (useS3) {
    await s3().send(new PutObjectCommand({ Bucket: cfg.bucket, Key: key, Body: body, ContentType: contentType, CacheControl: 'public, max-age=31536000, immutable' }));
    return;
  }
  const file = path.join(LOCAL_DIR, key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
}

export async function getFile(key: string): Promise<{ body: ReadableStream | Buffer; contentType?: string; length?: number } | null> {
  try {
    if (useS3) {
      const r = await s3().send(new GetObjectCommand({ Bucket: cfg.bucket, Key: key }));
      if (!r.Body) return null;
      return { body: r.Body.transformToWebStream(), contentType: r.ContentType, length: r.ContentLength };
    }
    return { body: await readFile(path.join(LOCAL_DIR, key)) };
  } catch (e) {
    const err = e as { name?: string; code?: string; $metadata?: { httpStatusCode?: number } };
    if (err.name === 'NoSuchKey' || err.code === 'ENOENT' || err.$metadata?.httpStatusCode === 404) return null;
    throw e;
  }
}

/** Remove fotos que saíram de um local. Melhor esforço: falha aqui não deve quebrar o salvamento. */
export async function deleteFiles(urls: string[]) {
  const keys = urls.map(keyFromUrl).filter((k): k is string => !!k && KEY_RE.test(k));
  if (!keys.length) return;
  try {
    if (useS3) await s3().send(new DeleteObjectsCommand({ Bucket: cfg.bucket, Delete: { Objects: keys.map((Key) => ({ Key })) } }));
    else await Promise.all(keys.map((k) => unlink(path.join(LOCAL_DIR, k)).catch(() => {})));
  } catch (e) {
    console.error('[storage] falha ao remover fotos', e);
  }
}
