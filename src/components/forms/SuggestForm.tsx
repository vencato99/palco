'use client';
import { useState, type FormEvent } from 'react';
import type { VenueType } from '@prisma/client';
import { AMENITIES, UFS, VENUE_TYPES } from '@/lib/constants';
import { Button, Chip, Input, Segmented, Select } from '@/components/ui';
import { FormError, useApi } from './useApi';

type Relation = 'MANAGER' | 'PRODUCED_THERE' | 'KNOWS_IT';

export function SuggestForm() {
  const { call, loading, error, fields } = useApi();
  const [done, setDone] = useState(false);
  const [format, setFormat] = useState<'SEATED' | 'STANDING' | 'HYBRID'>();
  const [rental, setRental] = useState(false);
  const [box, setBox] = useState(false);
  const [amen, setAmen] = useState<string[]>([]);
  const [relation, setRelation] = useState<Relation>('PRODUCED_THERE');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await call('/api/suggestions', 'POST', {
      name: f.get('name'), type: f.get('type'), state: f.get('state'), city: f.get('city'),
      capacity: f.get('capacity') || null, dressingRooms: f.get('dressingRooms') || null, contact: f.get('contact'),
      seatingFormat: format ?? null, acceptsRental: rental || null, acceptsBoxOffice: box || null,
      amenityKeys: amen, relation,
    });
    if (r.ok) setDone(true);
  }

  if (done) return (
    <div className="flex flex-col gap-3 rounded-3xl border border-line p-8 text-center">
      <h2 className="font-display text-2xl font-bold">Sugestão enviada</h2>
      <p className="text-mute">Nossa equipe confirma as informações com a casa. Se você estiver logado, avisaremos quando o local for publicado.</p>
      <Button variant="secondary" onClick={() => setDone(false)} className="mx-auto">Sugerir outro local</Button>
    </div>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" noValidate>
      <FormError message={error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Nome do local" name="name" className="sm:col-span-2" error={fields.name} />
        <Select label="Tipo" name="type" defaultValue="THEATER">{(Object.keys(VENUE_TYPES) as VenueType[]).map((t) => <option key={t} value={t}>{VENUE_TYPES[t]}</option>)}</Select>
        <Input label="Capacidade aproximada" name="capacity" inputMode="numeric" error={fields.capacity} />
        <Select label="Estado" name="state" defaultValue="" error={fields.state}><option value="" disabled>Selecione</option>{UFS.map((u) => <option key={u}>{u}</option>)}</Select>
        <Input label="Cidade" name="city" error={fields.city} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Segmented label="Formato" value={format} options={[{ value: 'SEATED', label: 'Sentado' }, { value: 'STANDING', label: 'De pé' }, { value: 'HYBRID', label: 'Híbrido' }]} onChange={setFormat} />
        <fieldset><legend className="mb-3 text-sm font-semibold">Modelo de negócio</legend>
          <div className="flex gap-2"><Chip active={rental} onClick={() => setRental(!rental)}>Locação</Chip><Chip active={box} onClick={() => setBox(!box)}>Bilheteria</Chip></div>
        </fieldset>
      </div>
      <fieldset><legend className="mb-3 text-sm font-semibold">O que o local tem?</legend>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => <Chip key={a.key} active={amen.includes(a.key)} onClick={() => setAmen((c) => (c.includes(a.key) ? c.filter((x) => x !== a.key) : [...c, a.key]))}>{a.label}</Chip>)}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Camarins" name="dressingRooms" inputMode="numeric" />
        <Input label="Contato do local" name="contact" hint="Site, Instagram, e-mail ou telefone" />
      </div>
      <Segmented<Relation> label="Qual sua relação com o local?" value={relation} onChange={setRelation}
        options={[{ value: 'MANAGER', label: 'Sou responsável' }, { value: 'PRODUCED_THERE', label: 'Já produzi lá' }, { value: 'KNOWS_IT', label: 'Só conheço' }]} />
      <Button type="submit" size="lg" loading={loading} className="self-start">Enviar sugestão para análise</Button>
    </form>
  );
}
