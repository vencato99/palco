import { GridSkeleton } from '@/components/ui/Skeletons';

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-page flex-col gap-8 px-4 py-8 md:px-6">
      <div className="skeleton h-44 w-full rounded-3xl" />
      <div className="skeleton h-9 w-64" />
      <GridSkeleton />
    </div>
  );
}
