"use client";

import dynamic from "next/dynamic";
/*
const TableGrades = dynamic(
  () => import("@/components/grades/Table"),
  {
    ssr: false,
  }
);
*/
export default function GradesPage() {
  return (
    <>
      <h1 className="semibold-32 text-primary mb-7">Panel de calificaciones</h1>
      <section className="flex flex-col gap-2 pb-8">
        <p className="text-[#808080] text-sm">
          Filtra los estudiantes por su caso
        </p>
       {/* <TableGrades />*/}
      </section>
    </>
  );
}
