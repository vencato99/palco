'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Início' },
  { href: '/locais', label: 'Buscar locais' },
  { href: '/buscar', label: 'Montar turnê' },
  { href: '/sobre', label: 'Sobre' },
];

export function NavLinks() {
  const path = usePathname();
  return (
    <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
      {LINKS.map((l) => {
        const active = l.href === '/' ? path === '/' : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined}
            className={cn('rounded-lg px-3 py-2 text-sm', active ? 'font-semibold text-paper' : 'text-mute hover:text-paper')}>
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
