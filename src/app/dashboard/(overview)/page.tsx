import CardCountsWrapper from "@/components/dashboard/CardCounts";
import PieChartsWrapper from "@/components/dashboard/PieChartProcedures";
import PieChartCases from "@/components/dashboard/PieChartCases";
import { CardsSkeleton } from "@/ui/Skeletons";
import { Suspense } from "react";
import RefreshButton from "@/components/dashboard/RefreshButton";

export default async function DashboardPage() {
  return (
    <main>
      <div className="flex justify-between items-center mb-5">
        <h4 className="font-medium text-lg">
          Dashboard
        </h4>
        <RefreshButton />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 border-b pb-5 mb-5">
        <Suspense fallback={<CardsSkeleton />}>
          <CardCountsWrapper />
        </Suspense>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <PieChartsWrapper />
        <PieChartCases />
      </div>
    </main>
  );
}
