import Link from 'next/link';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/admin', label: 'Painel' },
  { href: '/admin/sugestoes', label: 'Sugestões' },
  { href: '/minha-conta/locais/novo', label: 'Registrar local' },
];

/** O middleware já barra quem não é admin; aqui revalidamos no servidor (defesa em profundidade). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireUser(['ADMIN']);
  return (
    <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-8 pb-28 md:flex-row md:px-6">
      <nav aria-label="Admin" className="flex gap-1 overflow-x-auto md:w-56 md:shrink-0 md:flex-col">
        <span className="mb-2 hidden px-3 text-xs font-bold text-mute md:block">Administração</span>
        {NAV.map((n) => <Link key={n.href} href={n.href} className="shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-ink-2">{n.label}</Link>)}
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
