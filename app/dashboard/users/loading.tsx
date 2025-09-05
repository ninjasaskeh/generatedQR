import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="grid gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="rounded-md border overflow-hidden p-2 sm:p-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full mb-2 last:mb-0" />
            ))}
          </div>
          <div className="mt-3 flex justify-end">
            <Skeleton className="h-9 w-60" />
          </div>
        </div>
      </div>
    </div>
  );
}
