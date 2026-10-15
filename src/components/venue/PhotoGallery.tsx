'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Icon, Modal } from '@/components/ui';

type Photo = { id: string; url: string; caption: string | null };

/** Mosaico no desktop, carrossel com rolagem nativa (scroll-snap) no mobile, e lightbox com todas as fotos. */
export function PhotoGallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [open, setOpen] = useState(false);
  if (!photos.length) {
    return <div className="flex aspect-[21/9] items-center justify-center rounded-3xl bg-ink-2 text-mute"><Icon name="stage" size={48} /></div>;
  }
  const [first, ...rest] = photos;
  return (
    <>
      <div className="-mx-4 flex snap-x snap-mandatory overflow-x-auto md:hidden">
        {photos.map((p, i) => (
          <div key={p.id} className="relative aspect-[4/3] w-full shrink-0 snap-center">
            <Image src={p.url} alt={p.caption ?? `${name} — foto ${i + 1}`} fill sizes="100vw" priority={i === 0} className="object-cover" />
            <span className="absolute bottom-3 right-3 rounded-lg bg-ink/85 px-2 py-1 text-xs">{i + 1} / {photos.length}</span>
          </div>
        ))}
      </div>
      <div className="relative hidden h-[460px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:grid">
        <div className="relative col-span-2 row-span-2">
          <Image src={first!.url} alt={first!.caption ?? name} fill priority sizes="50vw" className="object-cover" />
        </div>
        {rest.slice(0, 4).map((p) => (
          <div key={p.id} className="relative"><Image src={p.url} alt={p.caption ?? name} fill sizes="25vw" className="object-cover" /></div>
        ))}
        <button type="button" onClick={() => setOpen(true)} className="absolute bottom-4 right-4 h-10 rounded-xl bg-paper px-4 text-sm font-semibold text-ink">
          Ver todas as {photos.length} fotos
        </button>
      </div>
      {open ? (
        <Modal open={open} onClose={() => setOpen(false)} title={`Fotos de ${name}`} size="lg">
          <div className="grid gap-3 sm:grid-cols-2">
            {photos.map((p) => (
              <figure key={p.id} className="flex flex-col gap-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl"><Image src={p.url} alt={p.caption ?? name} fill sizes="(min-width:640px) 384px, 100vw" className="object-cover" loading="lazy" /></div>
                {p.caption ? <figcaption className="text-sm text-mute">{p.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </Modal>
      ) : null}
    </>
  );
}
