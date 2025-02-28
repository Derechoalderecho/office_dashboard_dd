import CardCountsWrapper from "@/components/dashboard/CardCounts";

export default function DashboardPage() {
  return (
    <main>
      <h4 className="mb-4 font-medium text-lg">
        Dashboard de Tutelas y Derechos de Petición
      </h4>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardCountsWrapper />
      </div>
    </main>
  );
}
