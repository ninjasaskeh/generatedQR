import { Skeleton } from "@/components/ui/skeleton";

const DashboardLoading = () => {
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      {/* Section cards (4) */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <Skeleton className="h-4 w-28" />
            <div className="mt-2">
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="px-0 lg:px-2">
        <div className="rounded-lg border bg-card p-4">
          <Skeleton className="h-72 w-full" />
        </div>
      </div>

      {/* Latest table */}
      <div className="px-0 lg:px-2">
        <div className="mb-3 h-5 w-40">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="rounded-lg border bg-card p-3 sm:p-4">
          <div className="rounded-md border p-2 sm:p-3 overflow-x-auto">
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoading;
