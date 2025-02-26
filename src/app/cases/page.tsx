import TableCases from "@/components/cases/Table";

export default function CasesPage() {
  return (
    <>
      <h1 className="text-lg font-medium mb-7">Casos</h1>
      <section className="flex flex-col gap-2 pb-8">
        <p className="text-[#808080] text-sm">
          Filtra los casos por su actual estado
        </p>
        <TableCases />
      </section>
    </>
  );
}
