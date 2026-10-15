import { ListSkeleton, PageTitleSkeleton } from '@/components/ui/Skeletons';

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-8 md:px-6">
      <PageTitleSkeleton />
      <ListSkeleton />
    </div>
  );
}
