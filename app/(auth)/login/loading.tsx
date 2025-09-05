import { Skeleton } from "@/components/ui/skeleton";

const LoginLoading = () => {
  return (
    <div className="flex min-h-svh items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6">
        <Skeleton className="h-6 w-28" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <div className="pt-2">
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLoading;
