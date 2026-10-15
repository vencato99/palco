import { GridSkeleton } from '@/components/ui/Skeletons';

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-page flex-col gap-8 px-4 py-12 md:px-6">
      <div className="skeleton h-16 w-full max-w-3xl" /><div className="skeleton h-16 w-full max-w-4xl" />
      <GridSkeleton />
    </div>
  );
}
