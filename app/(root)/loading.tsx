import { Skeleton } from "@/components/ui/skeleton";

const IndexLoading = () => {
  return (
    <div className="min-h-svh">
      <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 pb-14 pt-16 text-center sm:gap-8 sm:pb-20 sm:pt-20">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-[min(48rem,90vw)]" />
        <Skeleton className="h-6 w-[min(38rem,90vw)]" />
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-40" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton className="h-5 w-56" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-xl border bg-card p-6 text-center sm:p-10">
          <Skeleton className="mx-auto h-7 w-80" />
          <Skeleton className="mx-auto mt-2 h-5 w-96" />
        </div>
      </section>
    </div>
  );
};

export default IndexLoading;
