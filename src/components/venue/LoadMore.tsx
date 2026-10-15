'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { VenueCardData } from '@/server/services/venue.service';
import { Button } from '@/components/ui';
import { VenueCard } from './VenueCard';

/** Paginação por cursor: as primeiras páginas vêm do servidor, as próximas via API. */
export function LoadMore({ initialCursor }: { initialCursor: string | null }) {
  const params = useSearchParams();
  const [items, setItems] = useState<VenueCardData[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function load() {
    if (!cursor) return;
    setLoading(true); setError(false);
    try {
      const q = new URLSearchParams(params.toString());
      q.set('cursor', cursor);
      const res = await fetch(`/api/venues?${q}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems((cur) => [...cur, ...data.items]);
      setCursor(data.nextCursor);
    } catch { setError(true); } finally { setLoading(false); }
  }

  return (
    <>
      {items.map((v) => <VenueCard key={v.id} venue={v} />)}
      {cursor ? (
        <div className="col-span-full flex flex-col items-center gap-2 pt-4">
          <Button variant="secondary" size="lg" loading={loading} onClick={load}>Carregar mais locais</Button>
          {error ? <p className="text-sm text-stage">Não foi possível carregar. Tente de novo.</p> : null}
        </div>
      ) : null}
    </>
  );
}
