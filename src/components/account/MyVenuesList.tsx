'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useOptimistic, useState, useTransition } from 'react';
import type { VenueStatus, VenueType } from '@prisma/client';
import { VENUE_STATUS, VENUE_TYPES } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import { Badge, ButtonLink, EmptyState, Icon, Modal, Button, useToast } from '@/components/ui';

type Row = {
  id: string; slug: string; name: string; type: VenueType; city: string; state: string; capacity: number;
  status: VenueStatus; updatedAt: string; cover: string | null; photos: number; openRequests: number;
};

/** Lista com exclusão otimista: o item some na hora e volta se a API falhar ou se a pessoa desfizer. */
export function MyVenuesList({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [, start] = useTransition();
  const [optimistic, removeOptimistic] = useOptimistic(rows, (cur, id: string) => cur.filter((r) => r.id !== id));

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return n ? optimistic.filter((r) => `${r.name} ${r.city}`.toLowerCase().includes(n)) : optimistic;
  }, [optimistic, q]);

  function confirmDelete() {
    const row = toDelete!;
    setToDelete(null);
    start(async () => {
      removeOptimistic(row.id);
      const res = await fetch(`/api/venues/${row.id}`, { method: 'DELETE' });
      if (!res.ok) { toast({ message: 'Não foi possível excluir. Tente de novo.' }); router.refresh(); return; }
      router.refresh();
      toast({
        message: `“${row.name}” excluído.`,
        action: { label: 'Desfazer', onClick: async () => { await fetch(`/api/venues/${row.id}/restore`, { method: 'POST' }); router.refresh(); } },
      });
    });
  }

  if (!rows.length) {
    return <EmptyState title="Nenhum local por aqui" text="Cadastre seu primeiro espaço para receber pedidos de pauta."
      action={<ButtonLink href="/minha-conta/locais/novo">Cadastrar local</ButtonLink>} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="sr-only" htmlFor="q-mine">Buscar nos meus locais</label>
      <input id="q-mine" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou cidade"
        className="h-12 w-full max-w-md rounded-xl border border-line bg-ink-2 px-4 outline-none focus:border-paper" />
      <ul className="flex flex-col gap-3">
        {list.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-ink-2 p-3 transition-colors hover:border-mute/60">
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-ink-3">
              {r.cover ? <Image src={r.cover} alt="" fill sizes="112px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-mute"><Icon name="stage" /></div>}
            </div>
            <div className="flex min-w-0 flex-1 basis-60 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold">{r.name}</p>
                <Badge tone={VENUE_STATUS[r.status].tone}>{VENUE_STATUS[r.status].label}</Badge>
                {r.openRequests ? <Badge tone="info">{r.openRequests} consulta(s) nova(s)</Badge> : null}
              </div>
              <p className="text-sm text-mute">{VENUE_TYPES[r.type]} · {r.city}, {r.state} · {formatNumber(r.capacity)} pessoas</p>
              <p className="text-xs text-mute">Atualizado em {new Date(r.updatedAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.status === 'PUBLISHED' ? <ButtonLink href={`/${r.slug}`} variant="secondary" size="sm">Ver perfil</ButtonLink> : null}
              <ButtonLink href={`/minha-conta/locais/${r.id}/editar`} variant="light" size="sm"><Icon name="edit" size={16} />Editar</ButtonLink>
              <Button variant="danger" size="sm" onClick={() => setToDelete(r)} aria-label={`Excluir ${r.name}`}><Icon name="trash" size={16} />Excluir</Button>
            </div>
          </li>
        ))}
      </ul>
      {!list.length ? <p className="text-mute">Nenhum local encontrado para “{q}”.</p> : null}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title={`Excluir “${toDelete?.name ?? ''}”?`} size="sm"
        footer={<><Button variant="secondary" onClick={() => setToDelete(null)}>Cancelar</Button><Button variant="danger" onClick={confirmDelete}>Excluir local</Button></>}>
        <p>O local sai da busca e das turnês. Avaliações e histórico ficam ocultos. Você poderá desfazer logo em seguida.</p>
      </Modal>
    </div>
  );
}
