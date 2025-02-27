"use client";

import dynamic from "next/dynamic";

const TableCases = dynamic(() => import("@/components/cases/Table"), {
  ssr: false,
});

export default function CasesPage() {
  return (
    <>
      <h1 className="text-4xl font-bold text-primary mb-7">Casos</h1>
      <section className="flex flex-col gap-2 pb-8">
        <p className="text-[#808080] text-sm">
          Filtra los casos por su actual estado
        </p>
        <TableCases />
      </section>
    </>
  );
}
