'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { SeatingFormat, VenueType } from '@prisma/client';
import { AMENITIES, SEATING_FORMATS, UFS, VENUE_TYPES } from '@/lib/constants';
import { Button, Chip, Input, Select, Textarea, useToast } from '@/components/ui';
import { FormError, useApi } from '@/components/forms/useApi';

type S = {
  id: string; name: string; type: VenueType; state: string; city: string; capacity: number | null;
  seatingFormat: SeatingFormat | null; acceptsRental: boolean | null; acceptsBoxOffice: boolean | null;
  amenityKeys: string[]; dressingRooms: number | null; internalNotes: string | null;
};

/** O admin corrige os dados enviados e decide: aprovar (cria o local publicado), pedir dados ou rejeitar. */
export function SuggestionReview({ s }: { s: S }) {
  const router = useRouter();
  const toast = useToast();
  const { call, loading, error, fields } = useApi();
  const [o, setO] = useState({
    name: s.name, type: s.type, state: s.state, city: s.city, capacity: s.capacity ? String(s.capacity) : '',
    seatingFormat: s.seatingFormat ?? 'SEATED', acceptsRental: s.acceptsRental ?? true, acceptsBoxOffice: s.acceptsBoxOffice ?? false,
    dressingRooms: s.dressingRooms ?? 0, amenities: s.amenityKeys,
  });
  const [notes, setNotes] = useState(s.internalNotes ?? '');
  const set = (p: Partial<typeof o>) => setO((c) => ({ ...c, ...p }));

  async function decide(action: 'approve' | 'needs_info' | 'reject') {
    const r = await call<{ slug?: string }>(`/api/admin/suggestions/${s.id}`, 'PATCH', {
      action, internalNotes: notes, overrides: action === 'approve' ? { ...o, capacity: o.capacity || undefined } : undefined,
    });
    if (!r.ok) return;
    toast({ message: action === 'approve' ? `“${o.name}” publicado.` : action === 'reject' ? 'Sugestão rejeitada.' : 'Pedido de dados registrado.' });
    router.push('/admin/sugestoes');
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <FormError message={error} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input label="Nome oficial" value={o.name} onChange={(e) => set({ name: e.target.value })} error={fields['overrides.name']} />
        <Select label="Tipo" value={o.type} onChange={(e) => set({ type: e.target.value as VenueType })}>
          {(Object.keys(VENUE_TYPES) as VenueType[]).map((t) => <option key={t} value={t}>{VENUE_TYPES[t]}</option>)}
        </Select>
        <Select label="Estado" value={o.state} onChange={(e) => set({ state: e.target.value })}>{UFS.map((u) => <option key={u}>{u}</option>)}</Select>
        <Input label="Cidade" value={o.city} onChange={(e) => set({ city: e.target.value })} />
        <Input label="Capacidade total" inputMode="numeric" value={o.capacity} onChange={(e) => set({ capacity: e.target.value.replace(/\D/g, '') })} error={fields.capacity} />
        <Select label="Formato" value={o.seatingFormat} onChange={(e) => set({ seatingFormat: e.target.value as SeatingFormat })}>
          {(Object.keys(SEATING_FORMATS) as SeatingFormat[]).map((k) => <option key={k} value={k}>{SEATING_FORMATS[k]}</option>)}
        </Select>
        <Input label="Camarins" inputMode="numeric" value={String(o.dressingRooms)} onChange={(e) => set({ dressingRooms: Number(e.target.value.replace(/\D/g, '') || 0) })} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip active={o.acceptsRental} onClick={() => set({ acceptsRental: !o.acceptsRental })}>Locação</Chip>
        <Chip active={o.acceptsBoxOffice} onClick={() => set({ acceptsBoxOffice: !o.acceptsBoxOffice })}>Bilheteria</Chip>
      </div>
      <fieldset><legend className="mb-3 text-sm font-semibold">Comodidades confirmadas</legend>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => <Chip key={a.key} active={o.amenities.includes(a.key)} onClick={() => set({ amenities: o.amenities.includes(a.key) ? o.amenities.filter((x) => x !== a.key) : [...o.amenities, a.key] })}>{a.label}</Chip>)}
        </div>
      </fieldset>
      <Textarea label="Notas internas da verificação" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: confirmado por telefone com a gerência em…" />
      <div className="flex flex-wrap gap-2 border-t border-line pt-5">
        <Button loading={loading} onClick={() => decide('approve')} className="bg-ok text-ink hover:bg-ok/90">Aprovar e publicar</Button>
        <Button variant="secondary" loading={loading} onClick={() => decide('needs_info')}>Solicitar dados à casa</Button>
        <Button variant="danger" loading={loading} onClick={() => decide('reject')} className="ml-auto">Rejeitar</Button>
      </div>
    </div>
  );
}
