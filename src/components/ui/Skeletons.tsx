import { VenueCardSkeleton } from '@/components/venue/VenueCard';

/** Esqueletos reaproveitados pelos loading.tsx — aparecem na hora do clique, antes dos dados. */
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Carregando locais">
      {Array.from({ length: count }, (_, i) => <VenueCardSkeleton key={i} />)}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-line bg-ink-2 p-3">
          <div className="skeleton h-20 w-28 shrink-0" />
          <div className="flex flex-1 flex-col gap-2"><div className="skeleton h-5 w-1/3" /><div className="skeleton h-4 w-1/2" /></div>
        </div>
      ))}
    </div>
  );
}

export function PageTitleSkeleton() {
  return <div className="flex flex-col gap-2"><div className="skeleton h-10 w-72 max-w-full" /><div className="skeleton h-4 w-40" /></div>;
}
