import { Skeleton } from "@heroui/react";

export function CardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-10 w-3/4 rounded-lg" />
      <Skeleton className="h-6 w-1/2 rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
    </div>
  );
}

export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-3/4 rounded-lg" />
      <Skeleton className="h-6 w-1/2 rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-full rounded-lg" />
    </div>
  );
}

export function CardsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-6 space-y-5">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
