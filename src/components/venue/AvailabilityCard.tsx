'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input, Select, useToast } from '@/components/ui';

/** Card de consulta de disponibilidade (lateral no desktop, barra fixa no mobile). */
export function AvailabilityCard({ venueId, rental, boxOffice, loggedIn }: {
  venueId: string; rental: string | null; boxOffice: string | null; loggedIn: boolean;
}) {
  const [date, setDate] = useState('');
  const [audience, setAudience] = useState('');
  const [eventType, setEventType] = useState('Show musical');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const toast = useToast();
  const router = useRouter();

  async function submit() {
    if (!loggedIn) return router.push(`/entrar?voltar=${encodeURIComponent(location.pathname)}`);
    if (!date) return setErr({ date: 'Escolha uma data.' });
    setLoading(true);
    const res = await fetch('/api/availability', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueIds: [venueId], date, expectedAudience: audience || null, eventType }),
    });
    setLoading(false);
    if (res.ok) { toast({ message: 'Consulta enviada. A casa responde por e-mail.' }); setErr({}); }
    else setErr((await res.json()).fields ?? { _: 'Não foi possível enviar.' });
  }

  return (
    <div id="consultar" className="flex flex-col gap-4 rounded-3xl border border-line bg-ink-2 p-6">
      <h3 className="font-display text-xl font-bold">Modelos de negócio</h3>
      <div className="flex flex-col gap-2">
        {rental !== undefined && rental !== null ? <div className="rounded-xl border-2 border-paper p-3"><p className="font-bold">Locação</p><p className="text-sm text-mute">{rental}</p></div> : null}
        {boxOffice ? <div className="rounded-xl border border-line p-3"><p className="font-bold">Bilheteria</p><p className="text-sm text-mute">{boxOffice}</p></div> : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data desejada" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={err.date} />
        <Input label="Público estimado" inputMode="numeric" value={audience} onChange={(e) => setAudience(e.target.value.replace(/\D/g, ''))} placeholder="1.500" />
      </div>
      <Select label="Tipo de evento" value={eventType} onChange={(e) => setEventType(e.target.value)}>
        {['Show musical', 'Peça de teatro', 'Stand-up', 'Dança', 'Corporativo', 'Festival'].map((t) => <option key={t}>{t}</option>)}
      </Select>
      <Button size="lg" loading={loading} onClick={submit}>{loggedIn ? 'Consultar disponibilidade' : 'Entrar para consultar'}</Button>
      {err._ ? <p className="text-sm text-stage">{err._}</p> : null}
    </div>
  );
}
