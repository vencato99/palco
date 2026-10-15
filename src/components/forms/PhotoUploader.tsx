'use client';
import { SafeImage as Image } from '@/components/ui/SafeImage';
import { useRef, useState } from 'react';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/utils';

export type Photo = { url: string; caption?: string | null };

const MAX_MB = 8;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

/**
 * Envio de fotos para o bucket: vários arquivos em paralelo, arrastar-e-soltar,
 * prévia na hora, definir capa e remover. Usado no cadastro de local e na sugestão.
 */
export function PhotoUploader({ photos, onChange, coverIndex, onCover, folder = 'venues', max = 40 }: {
  photos: Photo[]; onChange: (p: Photo[]) => void;
  coverIndex?: number; onCover?: (i: number) => void;
  folder?: 'venues' | 'suggestions'; max?: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ id: string; preview: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);

  async function upload(list: FileList | File[]) {
    const files = [...list].slice(0, Math.max(0, max - photos.length));
    if (!files.length) return;
    const errs: string[] = [];
    const valid = files.filter((f) => {
      if (!ACCEPT.split(',').includes(f.type)) { errs.push(`${f.name}: formato não aceito.`); return false; }
      if (f.size > MAX_MB * 1024 * 1024) { errs.push(`${f.name}: maior que ${MAX_MB} MB.`); return false; }
      return true;
    });
    // Prévia local imediata enquanto o envio acontece.
    const items = valid.map((f) => ({ id: crypto.randomUUID(), preview: URL.createObjectURL(f), file: f }));
    setPending((cur) => [...cur, ...items.map(({ id, preview }) => ({ id, preview }))]);
    setErrors(errs);

    const results = await Promise.all(items.map(async ({ id, preview, file }) => {
      const body = new FormData();
      body.append('file', file);
      body.append('folder', folder);
      try {
        const res = await fetch('/api/uploads', { method: 'POST', body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { errs.push(`${file.name}: ${data.error ?? 'falha no envio.'}`); return null; }
        return { url: data.url as string };
      } catch {
        errs.push(`${file.name}: sem conexão.`); return null;
      } finally {
        URL.revokeObjectURL(preview);
        setPending((cur) => cur.filter((p) => p.id !== id));
      }
    }));
    setErrors([...errs]);
    const ok = results.filter(Boolean) as Photo[];
    if (ok.length) onChange([...photos, ...ok]);
  }

  function remove(i: number) {
    onChange(photos.filter((_, j) => j !== i));
    if (onCover && coverIndex !== undefined) onCover(coverIndex === i ? 0 : coverIndex > i ? coverIndex - 1 : coverIndex);
  }

  const full = photos.length >= max;
  return (
    <div className="flex flex-col gap-3">
      {errors.length ? <ul role="alert" className="rounded-xl border border-stage/40 bg-stage-soft px-4 py-3 text-sm">{errors.map((e) => <li key={e}>{e}</li>)}</ul> : null}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <li key={p.url} className="overflow-hidden rounded-2xl border border-line">
            <div className="relative aspect-[4/3] bg-ink-3">
              <Image src={p.url} alt={`Foto ${i + 1}`} fill sizes="240px" className="object-cover" />
              {onCover && i === coverIndex ? <span className="absolute left-2 top-2 rounded-full bg-paper px-2 py-0.5 text-xs font-bold text-ink">Capa</span> : null}
            </div>
            <div className={cn('grid text-sm font-semibold', onCover ? 'grid-cols-2' : 'grid-cols-1')}>
              {onCover ? <button type="button" className="h-11 border-r border-line hover:bg-ink-3 disabled:opacity-40" disabled={i === coverIndex} onClick={() => onCover(i)}>Definir capa</button> : null}
              <button type="button" className="h-11 text-stage hover:bg-ink-3" onClick={() => remove(i)}>Remover</button>
            </div>
          </li>
        ))}
        {pending.map((p) => (
          <li key={p.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line" aria-label="Enviando foto">
            {/* eslint-disable-next-line @next/next/no-img-element -- prévia local (blob:) */}
            <img src={p.preview} alt="" className="h-full w-full object-cover opacity-50" />
            <span className="absolute inset-0 flex items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-[3px] border-paper border-r-transparent" /></span>
          </li>
        ))}
        {!full ? (
          <li>
            <button type="button" onClick={() => input.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
              className={cn('flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors', drag ? 'border-stage bg-stage-soft' : 'border-line hover:border-mute hover:bg-ink-3')}>
              <Icon name="upload" size={26} />
              <span className="text-sm font-semibold">{pending.length ? `Enviando ${pending.length}…` : 'Adicionar fotos'}</span>
              <span className="text-xs text-mute">ou arraste aqui</span>
            </button>
            <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={(e) => { if (e.target.files) upload(e.target.files); e.target.value = ''; }} />
          </li>
        ) : null}
      </ul>
      <p className="text-xs text-mute">JPG, PNG, WEBP ou AVIF, até {MAX_MB} MB cada · {photos.length}/{max} fotos</p>
    </div>
  );
}
