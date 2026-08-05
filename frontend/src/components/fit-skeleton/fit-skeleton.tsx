import { Skeleton } from "@/components/skeleton";

export function FitSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-4 border border-hairline-subtle bg-panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-8 w-10" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>

          <div className="border-t border-hairline-subtle" />

          <div className="flex flex-col gap-4">
            {[0, 1, 2, 3].map((j) => (
              <div key={j} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-2.5 w-8" />
                </div>
                <Skeleton className="h-1 w-full" />
                <Skeleton className="h-2.5 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
