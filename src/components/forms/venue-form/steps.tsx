'use client';
import Image from 'next/image';
import { useRef, useState } from 'react';
import type { VenueType } from '@prisma/client';
import { AMENITIES, SEATING_FORMATS, UFS, VENUE_TYPES } from '@/lib/constants';
import { Counter, Icon, Input, Segmented, Select, Textarea, type IconName } from '@/components/ui';
import { cn, formatNumber } from '@/lib/utils';
import type { StepProps } from './types';

export function StepBasics({ d, set, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-5">
      <Input label="Nome do local *" value={d.name} onChange={(e) => set({ name: e.target.value })} error={errors.name} placeholder="Ex.: Teatro Municipal" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Tipo" value={d.type} onChange={(e) => set({ type: e.target.value as VenueType })}>
          {(Object.keys(VENUE_TYPES) as VenueType[]).map((t) => <option key={t} value={t}>{VENUE_TYPES[t]}</option>)}
        </Select>
        <Select label="Estado" value={d.state} onChange={(e) => set({ state: e.target.value })} error={errors.state}>{UFS.map((u) => <option key={u}>{u}</option>)}</Select>
        <Input label="Cidade *" value={d.city} onChange={(e) => set({ city: e.target.value })} error={errors.city} />
      </div>
      <Input label="Endereço" value={d.address} onChange={(e) => set({ address: e.target.value })} placeholder="Rua, número, bairro" />
      <Textarea label="Sobre o local" value={d.description} onChange={(e) => set({ description: e.target.value })} placeholder="História, perfil de programação, diferenciais…" rows={5} />
    </div>
  );
}

export function StepAudience({ d, set, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <Input label="Capacidade total *" inputMode="numeric" className="max-w-xs" value={d.capacity}
        onChange={(e) => set({ capacity: e.target.value.replace(/\D/g, '') })} error={errors.capacity} placeholder="Nº de pessoas" />
      <Segmented label="Formato do público" value={d.seatingFormat}
        options={(Object.keys(SEATING_FORMATS) as (keyof typeof SEATING_FORMATS)[]).map((k) => ({ value: k, label: SEATING_FORMATS[k] }))}
        onChange={(v) => set({ seatingFormat: v })} />
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold">Modelo de negócio (um ou ambos) *</legend>
        {([['acceptsRental', 'Locação', 'Diária fixa paga pela produção'], ['acceptsBoxOffice', 'Bilheteria', 'A casa fica com um percentual da venda']] as const).map(([k, l, t]) => (
          <button key={k} type="button" aria-pressed={d[k]} onClick={() => set({ [k]: !d[k] })}
            className={cn('flex items-center justify-between rounded-2xl p-4 text-left', d[k] ? 'border-2 border-paper bg-ink-3' : 'border border-line')}>
            <span><span className="block font-bold">{l}</span><span className="text-sm text-mute">{t}</span></span>
            {d[k] ? <Icon name="check" /> : null}
          </button>
        ))}
        {errors.acceptsRental ? <p className="text-[13px] font-medium text-stage">{errors.acceptsRental}</p> : null}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        {d.acceptsRental ? <Input label="Valor da diária (R$)" inputMode="decimal" value={d.rentalPrice} onChange={(e) => set({ rentalPrice: e.target.value })} placeholder="Ex.: 18.000" /> : null}
        {d.acceptsBoxOffice ? <Input label="Divisão de bilheteria (% da casa)" inputMode="decimal" value={d.boxOfficePercent} onChange={(e) => set({ boxOfficePercent: e.target.value })} placeholder="Ex.: 20" /> : null}
      </div>
    </div>
  );
}

const SPEC_FIELDS = [['som', 'Som (P.A.)'], ['luz', 'Luz'], ['energia', 'Energia'], ['cargaDescarga', 'Carga e descarga'], ['horarios', 'Horários de montagem']] as const;

export function StepStructure({ d, set }: StepProps) {
  const toggle = (k: (typeof AMENITIES)[number]['key']) =>
    set({ amenities: d.amenities.includes(k) ? d.amenities.filter((x) => x !== k) : [...d.amenities, k] });
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Counter label="Camarins" value={d.dressingRooms} onChange={(n) => set({ dressingRooms: n })} />
        <Input label="Vagas de estacionamento" inputMode="numeric" value={d.parkingSpots} onChange={(e) => set({ parkingSpots: e.target.value.replace(/\D/g, '') })} />
      </div>
      <fieldset className="grid grid-cols-3 gap-3">
        <legend className="mb-2 text-sm font-semibold">Palco (metros)</legend>
        <Input label="Largura" inputMode="decimal" value={d.stageWidth} onChange={(e) => set({ stageWidth: e.target.value })} />
        <Input label="Profundidade" inputMode="decimal" value={d.stageDepth} onChange={(e) => set({ stageDepth: e.target.value })} />
        <Input label="Altura" inputMode="decimal" value={d.stageHeight} onChange={(e) => set({ stageHeight: e.target.value })} />
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Comodidades</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {AMENITIES.map((a) => {
            const on = d.amenities.includes(a.key);
            return (
              <button key={a.key} type="button" aria-pressed={on} onClick={() => toggle(a.key)}
                className={cn('flex min-h-24 flex-col justify-between gap-2 rounded-2xl p-4 text-left', on ? 'border-2 border-paper bg-ink-3' : 'border border-line')}>
                <Icon name={a.icon as IconName} size={22} /><span className="text-sm font-semibold">{a.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-semibold">Ficha técnica</legend>
        {SPEC_FIELDS.map(([k, l]) => (
          <Input key={k} label={l} value={d.techSpecs[k] ?? ''} onChange={(e) => set({ techSpecs: { ...d.techSpecs, [k]: e.target.value } })} />
        ))}
      </fieldset>
    </div>
  );
}

export function StepPhotos({ d, set }: StepProps) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setErr(null); setUploading(files.length);
    // Uploads em paralelo; cada foto que termina já aparece.
    const done = await Promise.all([...files].map(async (file) => {
      const body = new FormData(); body.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(data.error ?? 'Falha no upload.'); return null; }
      return { url: data.url as string };
    }));
    setUploading(0);
    set({ photos: [...d.photos, ...done.filter(Boolean) as { url: string }[]] });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-mute">Recomendado: palco, plateia, fachada, camarim e foyer. JPG, PNG ou WEBP até 8 MB.</p>
      {err ? <p role="alert" className="text-sm text-stage">{err}</p> : null}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {d.photos.map((p, i) => (
          <li key={p.url} className="overflow-hidden rounded-2xl border border-line">
            <div className="relative aspect-[4/3] bg-ink-3">
              <Image src={p.url} alt={`Foto ${i + 1}`} fill sizes="240px" className="object-cover" />
              {i === d.coverIndex ? <span className="absolute left-2 top-2 rounded-full bg-paper px-2 py-0.5 text-xs font-bold text-ink">Capa</span> : null}
            </div>
            <div className="grid grid-cols-2 text-sm font-semibold">
              <button type="button" className="h-11 border-r border-line" onClick={() => set({ coverIndex: i })}>Definir capa</button>
              <button type="button" className="h-11 text-stage" onClick={() => {
                const photos = d.photos.filter((_, j) => j !== i);
                set({ photos, coverIndex: d.coverIndex === i ? 0 : d.coverIndex > i ? d.coverIndex - 1 : d.coverIndex });
              }}>Remover</button>
            </div>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => input.current?.click()} disabled={uploading > 0}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line hover:border-mute">
            <Icon name="upload" size={26} />
            <span className="text-sm font-semibold">{uploading ? `Enviando ${uploading}…` : 'Adicionar fotos'}</span>
          </button>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
        </li>
      </ul>
    </div>
  );
}

export function StepContacts({ d, set, errors }: StepProps) {
  const summary = [
    ['Local', `${d.name || '—'} · ${VENUE_TYPES[d.type]}`],
    ['Cidade', `${d.city || '—'}, ${d.state}`],
    ['Capacidade', `${d.capacity ? formatNumber(Number(d.capacity)) : '—'} · ${SEATING_FORMATS[d.seatingFormat]}`],
    ['Modelo', [d.acceptsRental && 'Locação', d.acceptsBoxOffice && 'Bilheteria'].filter(Boolean).join(' + ') || '—'],
    ['Estrutura', `${d.dressingRooms} camarins · ${d.amenities.length} comodidades`],
    ['Fotos', String(d.photos.length)],
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Responsável pela pauta" value={d.contactName} onChange={(e) => set({ contactName: e.target.value })} />
        <Input label="E-mail" type="email" value={d.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} error={errors.contactEmail} />
        <Input label="Telefone" type="tel" value={d.contactPhone} onChange={(e) => set({ contactPhone: e.target.value })} />
        <Input label="WhatsApp" type="tel" value={d.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
        <Input label="Site" type="url" value={d.website} onChange={(e) => set({ website: e.target.value })} placeholder="https://" />
        <Input label="Instagram" value={d.instagram} onChange={(e) => set({ instagram: e.target.value })} placeholder="@" />
      </div>
      <div className="rounded-2xl bg-ink-3 p-5">
        <p className="mb-3 font-bold">Resumo antes de salvar</p>
        <dl className="flex flex-col gap-2 text-sm">
          {summary.map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-line pb-2 last:border-0"><dt className="text-mute">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
        </dl>
      </div>
    </div>
  );
}
