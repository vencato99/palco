'use client';
import { useState } from 'react';
import type { VenueType } from '@prisma/client';
import { AMENITIES, VENUE_TYPES } from '@/lib/constants';
import type { VenueFilters } from '@/lib/validators';
import { Button, Chip, Counter, Icon, Modal, Segmented, type IconName } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useFilterUrl } from './useFilterUrl';

/** Rascunho local dos filtros; só vai para a URL ao confirmar — uma navegação só. */
export function FiltersModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { filters, update } = useFilterUrl();
  const [d, setD] = useState<VenueFilters>(filters);
  const set = (p: Partial<VenueFilters>) => setD((cur) => ({ ...cur, ...p }));
  const toggleAmenity = (k: (typeof AMENITIES)[number]['key']) => {
    const s = new Set(d.amenities ?? []);
    s.has(k) ? s.delete(k) : s.add(k);
    set({ amenities: [...s] });
  };

  return (
    <Modal open={open} onClose={onClose} title="Filtros" size="lg"
      footer={<>
        <button type="button" className="h-11 px-2 font-semibold underline" onClick={() => setD({ sort: 'rating' })}>Limpar tudo</button>
        <Button size="lg" onClick={() => { update(d); onClose(); }}>Mostrar resultados</Button>
      </>}>
      <div className="flex flex-col divide-y divide-line">
        <section className="flex flex-col gap-3 pb-6">
          <h3 className="font-display text-lg font-bold">Tipo de local</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(VENUE_TYPES) as VenueType[]).map((t) => (
              <Chip key={t} active={d.type === t} onClick={() => set({ type: d.type === t ? undefined : t })}>{VENUE_TYPES[t]}</Chip>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 py-6">
          <h3 className="col-span-2 font-display text-lg font-bold">Capacidade de público</h3>
          {(['capMin', 'capMax'] as const).map((k) => (
            <label key={k} className="flex flex-col rounded-xl border border-line px-4 py-2 text-xs text-mute">
              {k === 'capMin' ? 'Mínimo' : 'Máximo'}
              <input inputMode="numeric" className="bg-transparent py-1 text-base text-paper outline-none" value={d[k] ?? ''}
                onChange={(e) => set({ [k]: parseInt(e.target.value.replace(/\D/g, ''), 10) || undefined })} placeholder="pessoas" />
            </label>
          ))}
        </section>

        <section className="grid gap-6 py-6 sm:grid-cols-2">
          <Segmented label="Formato do público" value={d.format}
            options={[{ value: 'SEATED', label: 'Sentado' }, { value: 'STANDING', label: 'De pé' }, { value: 'HYBRID', label: 'Híbrido' }]}
            onChange={(v) => set({ format: d.format === v ? undefined : v })} />
          <Segmented label="Modelo de negócio" value={d.model}
            options={[{ value: 'rental', label: 'Locação' }, { value: 'boxoffice', label: 'Bilheteria' }]}
            onChange={(v) => set({ model: d.model === v ? undefined : v })} />
        </section>

        <section className="flex flex-col gap-3 py-6">
          <h3 className="font-display text-lg font-bold">Estrutura</h3>
          <Counter label="Camarins" hint="Quantidade mínima" value={d.dressingMin ?? 0} onChange={(n) => set({ dressingMin: n || undefined })} />
          <Counter label="Vagas de estacionamento" hint="No local ou conveniado" step={50} value={d.parkingMin ?? 0} onChange={(n) => set({ parkingMin: n || undefined })} />
        </section>

        <section className="flex flex-col gap-3 pt-6">
          <h3 className="font-display text-lg font-bold">Comodidades</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AMENITIES.map((a) => {
              const on = d.amenities?.includes(a.key);
              return (
                <button key={a.key} type="button" aria-pressed={on} onClick={() => toggleAmenity(a.key)}
                  className={cn('flex min-h-24 flex-col justify-between gap-3 rounded-2xl p-4 text-left', on ? 'border-2 border-paper bg-ink-3' : 'border border-line hover:border-mute')}>
                  <Icon name={a.icon as IconName} size={24} />
                  <span className="text-sm font-semibold">{a.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </Modal>
  );
}
