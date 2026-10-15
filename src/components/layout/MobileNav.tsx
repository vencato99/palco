'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui';
import { cn } from '@/lib/utils';

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Início', icon: 'home' },
  { href: '/locais', label: 'Buscar', icon: 'search' },
  { href: '/buscar', label: 'Turnês', icon: 'route' },
  { href: '/minha-conta/locais', label: 'Conta', icon: 'user' },
];

/** Barra inferior no mobile, como no app de referência. */
export function MobileNav() {
  const path = usePathname();
  return (
    <nav aria-label="Navegação" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {TABS.map((t) => {
        const active = t.href === '/' ? path === '/' : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} aria-current={active ? 'page' : undefined}
            className={cn('flex flex-col items-center gap-1 py-2.5 text-[11px]', active ? 'font-bold text-stage' : 'text-mute')}>
            <Icon name={t.icon} size={22} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
