import { Skeleton } from "@/components/ui/skeleton";

const AddLoading = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="grid gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-36" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-3 h-80 w-full" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default AddLoading;
