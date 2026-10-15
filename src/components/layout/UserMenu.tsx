'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Role } from '@prisma/client';
import { initials } from '@/lib/utils';

export function UserMenu({ name, role }: { name: string; role: Role }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const item = 'block rounded-lg px-3 py-2.5 text-sm hover:bg-ink-3';
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 rounded-full border border-line pl-1 pr-3 hover:border-mute">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stage text-xs font-bold text-white">{initials(name)}</span>
        <span className="hidden text-sm font-semibold sm:inline">{name.split(' ')[0]}</span>
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-line bg-ink-2 p-2 shadow-2xl">
          <Link role="menuitem" href="/minha-conta/locais" className={item}>Meus locais</Link>
          <Link role="menuitem" href="/minha-conta/turnes" className={item}>Minhas turnês</Link>
          {role === 'ADMIN' ? <Link role="menuitem" href="/admin" className={item}>Painel admin</Link> : null}
          <button role="menuitem" type="button" onClick={logout} className={`${item} w-full text-left text-mute`}>Sair</button>
        </div>
      ) : null}
    </div>
  );
}
