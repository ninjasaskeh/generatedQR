import { Skeleton } from "@/components/ui/skeleton";

const TemplateLoading = () => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 items-start">
        <div className="rounded-lg border bg-card p-3 sm:p-4 grid gap-3 content-start">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="grid gap-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-24" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="rounded-lg border bg-card p-3 sm:p-4 grid gap-3 content-start">
          <Skeleton className="h-4 w-24" />
          <div className="rounded-md border bg-white overflow-hidden">
            <Skeleton className="h-[420px] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateLoading;
