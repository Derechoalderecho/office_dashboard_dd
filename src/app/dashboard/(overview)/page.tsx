import CardCountsWrapper from "@/components/dashboard/CardCounts";
import PieChartsWrapper from "@/components/dashboard/PieChartsWrapper";

export default function DashboardPage() {
  return (
    <main>
      <h4 className="font-medium text-lg mb-5">
        Dashboard
      </h4>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 border-b pb-5 mb-5">
        <CardCountsWrapper />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <PieChartsWrapper />
        <PieChartsWrapper />
      </div>
    </main>
  );
}
