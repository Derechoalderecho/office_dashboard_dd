import { Skeleton, Card, CardBody } from "@heroui/react";

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function CardSkeleton() {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
    >
      <div className="flex justify-end p-4">
        <Skeleton className="h-10 w-10 rounded-md bg-gray-200" />
      </div>
      <div className="flex flex-col items-center justify-center gap-6 truncate rounded-xl bg-white px-4 py-16">
        <Skeleton className="h-7 w-16 rounded-md bg-gray-200" />
        <Skeleton className="h-7 w-16 rounded-md bg-gray-200" />
      </div>
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
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
}

export default function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8"></div>
    </>
  );
}
