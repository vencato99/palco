'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useTransition } from 'react';
import { filtersFromParams, filtersToParams } from '@/lib/filters';
import type { VenueFilters } from '@/lib/validators';

/** A URL é o estado dos filtros: voltar/avançar e links compartilhados funcionam sozinhos. */
export function useFilterUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const filters = useMemo(() => filtersFromParams(new URLSearchParams(params.toString())), [params]);

  const update = useCallback(
    (patch: Partial<VenueFilters>) => {
      const next = filtersToParams({ ...filters, ...patch, cursor: undefined });
      startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
    },
    [filters, pathname, router],
  );
  const reset = useCallback(() => startTransition(() => router.replace(pathname, { scroll: false })), [pathname, router]);

  // Enquanto a nova lista carrega, a atual fica esmaecida (via CSS em [data-filtering]).
  useEffect(() => {
    const el = document.documentElement;
    if (pending) el.dataset.filtering = 'true'; else delete el.dataset.filtering;
  }, [pending]);
  return { filters, update, reset, pending };
}
