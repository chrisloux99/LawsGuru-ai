import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export default function Skeleton({ className, count = 1 }: SkeletonProps) {
  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse rounded-lg bg-earth-800/60 shimmer",
              className
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-earth-800/60 shimmer",
        className
      )}
    />
  );
}

export function DocumentCardSkeleton() {
  return (
    <div className="glass-panel p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="w-8 h-8 rounded" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass-panel p-4 text-center">
      <Skeleton className="h-8 w-16 mx-auto mb-2" />
      <Skeleton className="h-3 w-20 mx-auto" />
    </div>
  );
}
