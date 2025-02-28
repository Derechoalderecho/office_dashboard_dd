"use client";

import dynamic from "next/dynamic";

const TableCitizens = dynamic(() => import("@/components/citizens/Table"), {
  ssr: false,
});

export default function CitizensPage() {
  return (
    <>
      <h1 className="text-4xl font-bold text-primary mb-7">Ciudadanos</h1>
      <section className="flex flex-col gap-2 pb-8">
        <p className="text-[#808080] text-sm">
          Filtra los ciudadanos por su nombre
        </p>
        <TableCitizens />
      </section>
    </>
  );
}
