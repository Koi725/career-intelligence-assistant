import { BlueprintCard } from "@/components/blueprint-card";
import { Skeleton } from "@/components/skeleton";

export function FitSkeleton() {
  return (
    <BlueprintCard>
      <div className="flex flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-2 w-2/5" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        <div className="border-t border-hairline-subtle" />

        {/* Axis skeletons */}
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-2 w-2/5" />
              <Skeleton className="h-score-track w-full" />
              <Skeleton className="h-2 w-11/12" />
            </div>
          ))}
        </div>
      </div>
    </BlueprintCard>
  );
}
