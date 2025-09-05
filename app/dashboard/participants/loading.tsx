import { Skeleton } from "@/components/ui/skeleton";

const ParticipantLoading = () => {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-2 h-4 w-60" />
          <div className="mt-2 flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-3 sm:p-4">
        <div className="rounded-md border p-2 sm:p-3">
          <Skeleton className="h-6 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="mt-2 h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParticipantLoading;
