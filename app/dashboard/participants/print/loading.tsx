import { Skeleton } from "@/components/ui/skeleton";

const PrintLoading = () => {
  return (
    <div className="p-2 sm:p-4 space-y-4">
      <div>
        <Skeleton className="h-6 w-64" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-full">
            <Skeleton className="h-[60vh] w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrintLoading;
