import { SkeletonLoader } from "@/ui/Skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="">
        <SkeletonLoader />
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <SkeletonLoader />
        </div>
        <div className="col-span-1">
          <SkeletonLoader />
        </div>
      </div>
      <div className="">
        <SkeletonLoader />
      </div>
    </div>
  );
}
