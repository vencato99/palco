import { VenueCardSkeleton, VenueGrid } from '@/components/venue/VenueCard';

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-page flex-col gap-8 px-4 py-8 md:px-6">
      <div className="h-40 animate-pulse rounded-3xl bg-ink-2" />
      <VenueGrid>{Array.from({ length: 6 }, (_, i) => <VenueCardSkeleton key={i} />)}</VenueGrid>
    </div>
  );
}
