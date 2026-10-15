import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findDuplicates, getSuggestion } from '@/server/services/suggestion.service';
import { SuggestionReview } from '@/components/admin/SuggestionReview';
import { HttpError } from '@/lib/http';

export const metadata = { title: 'Revisar sugestão' };

export default async function SuggestionDetail({ params }: { params: { id: string } }) {
  const s = await getSuggestion(params.id).catch((e) => { if (e instanceof HttpError) notFound(); throw e; });
  const dups = await findDuplicates(s.name, s.state, s.city);
  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/sugestoes" className="text-sm text-mute hover:text-paper">← Voltar para sugestões</Link>
      <div>
        <h1 className="font-display text-3xl font-extrabold">{s.name}</h1>
        <p className="text-mute">Enviado por {s.submittedBy?.name ?? 'visitante'}{s.submittedBy?.email ? ` (${s.submittedBy.email})` : ''} · contato informado: {s.contact ?? '—'}</p>
      </div>
      {dups.length ? (
        <div role="alert" className="rounded-2xl border border-warn/40 bg-warn/10 p-4 text-sm">
          <p className="font-bold text-warn">Possível duplicado</p>
          <ul className="mt-1">{dups.map((d) => <li key={d.id}><Link href={`/${d.slug}`} className="underline">{d.name} — {d.city}</Link></li>)}</ul>
        </div>
      ) : null}
      <div className="rounded-3xl border border-line bg-ink-2 p-6"><SuggestionReview s={s} /></div>
    </div>
  );
}
