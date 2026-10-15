'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

export function CityPicker({ cities, value }: { cities: { city: string; state: string; count: number }[]; value?: string }) {
  const router = useRouter();
  const path = usePathname();
  const [pending, start] = useTransition();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">Filtrar por cidade</span>
      <select value={value ?? ''} aria-busy={pending}
        onChange={(e) => start(() => router.replace(e.target.value ? `${path}?cidade=${encodeURIComponent(e.target.value)}` : path, { scroll: false }))}
        className="h-11 appearance-none rounded-full border border-line bg-ink-2 px-5 font-semibold outline-none focus:border-paper">
        <option value="">Todas as cidades</option>
        {cities.map((c) => <option key={`${c.city}-${c.state}`} value={c.city}>{c.city}, {c.state}</option>)}
      </select>
    </label>
  );
}
