'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { AMENITIES, UFS } from '@/lib/constants';
import { countActiveFilters } from '@/lib/filters';
import { Chip, Icon, Segmented } from '@/components/ui';
import { useFilterUrl } from './useFilterUrl';

// O modal só é baixado quando a pessoa abre "Mais filtros".
const FiltersModal = dynamic(() => import('./FiltersModal').then((m) => m.FiltersModal), { ssr: false });

const CAPACITY = [
  { label: 'Qualquer', min: undefined, max: undefined },
  { label: 'Até 300', min: undefined, max: 300 },
  { label: '300 a 1.000', min: 300, max: 1000 },
  { label: '1.000 a 3.000', min: 1000, max: 3000 },
  { label: '3.000+', min: 3000, max: undefined },
];
const QUICK_AMENITIES = ['bar', 'som', 'luz', 'estacionamento', 'acessibilidade', 'carga'] as const;

const selectCls = 'h-12 w-full appearance-none rounded-xl border border-line bg-ink-2 px-3 text-[15px] outline-none focus:border-paper';

export function FilterBar() {
  const { filters, update, pending } = useFilterUrl();
  const [modal, setModal] = useState(false);
  const [city, setCity] = useState(filters.city ?? '');
  const capIndex = Math.max(0, CAPACITY.findIndex((c) => c.min === filters.capMin && c.max === filters.capMax));

  // Debounce da cidade: evita navegação a cada tecla.
  useEffect(() => {
    if ((filters.city ?? '') === city) return;
    const t = setTimeout(() => update({ city: city || undefined }), 400);
    return () => clearTimeout(t);
  }, [city]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAmenity = (key: (typeof AMENITIES)[number]['key']) => {
    const set = new Set(filters.amenities ?? []);
    set.has(key) ? set.delete(key) : set.add(key);
    update({ amenities: [...set] });
  };

  return (
    <section aria-label="Filtros" className="flex flex-col gap-4" data-pending={pending || undefined}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-mute">Capacidade
          <select className={selectCls} value={capIndex} onChange={(e) => { const c = CAPACITY[+e.target.value]!; update({ capMin: c.min, capMax: c.max }); }}>
            {CAPACITY.map((c, i) => <option key={c.label} value={i}>{c.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-mute">Modelo de negócio
          <select className={selectCls} value={filters.model ?? ''} onChange={(e) => update({ model: (e.target.value || undefined) as never })}>
            <option value="">Locação ou bilheteria</option>
            <option value="rental">Locação (diária)</option>
            <option value="boxoffice">Bilheteria (divisão)</option>
          </select>
        </label>
        <div className="col-span-2 lg:col-span-1 [&_legend]:text-[13px] [&_legend]:text-mute">
          <Segmented label="Formato do público" value={filters.format}
            options={[{ value: 'SEATED', label: 'Sentado' }, { value: 'STANDING', label: 'De pé' }, { value: 'HYBRID', label: 'Híbrido' }]}
            onChange={(v) => update({ format: filters.format === v ? undefined : v })} />
        </div>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-mute">Estado
          <select className={selectCls} value={filters.states?.length === 1 ? filters.states[0] : ''} onChange={(e) => update({ states: e.target.value ? [e.target.value] : undefined })}>
            <option value="">Todos</option>
            {UFS.map((uf) => <option key={uf}>{uf}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-mute">Cidade
          <input className={selectCls} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Digite a cidade" />
        </label>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        <button type="button" onClick={() => setModal(true)}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-2 border-paper px-4 text-sm font-semibold">
          <Icon name="filter" size={16} /> Mais filtros
          {countActiveFilters(filters) ? <span className="rounded-full bg-stage px-2 text-xs text-white">{countActiveFilters(filters)}</span> : null}
        </button>
        {QUICK_AMENITIES.map((k) => (
          <Chip key={k} active={filters.amenities?.includes(k)} onClick={() => toggleAmenity(k)}>
            {AMENITIES.find((a) => a.key === k)!.label}
          </Chip>
        ))}
      </div>
      {modal ? <FiltersModal open={modal} onClose={() => setModal(false)} /> : null}
    </section>
  );
}
