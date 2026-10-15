import { ListSkeleton } from '@/components/ui/Skeletons';

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-page flex-col gap-6 px-4 py-8 md:px-6">
      <div className="skeleton h-16 w-full rounded-2xl" />
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1"><ListSkeleton rows={6} /></div>
        <div className="skeleton hidden h-96 rounded-3xl md:block md:w-[380px]" />
      </div>
    </div>
  );
}
