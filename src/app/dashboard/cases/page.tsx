"use client";

import { Tab, Tabs } from "@heroui/react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const TableCases = dynamic(() => import("@/components/cases/Table"), {
  ssr: false,
});

export default function CasesPage() {
  const pathname = usePathname();
  return (
    <>
      <h1 className="semibold-32 text-primary mb-7">Casos</h1>
      <section className="flex flex-col gap-2 pb-8">
        <Tabs aria-label="Opciones" selectedKey={pathname} className="mb-4">
          <Tab key="casos" title="Casos" href="/dashboard/cases" />
          <Tab
            key="calificaciones"
            title="Calificaciones"
            href="/dashboard/cases/califications"
          />
        </Tabs>
        <p className="text-[#808080] text-sm">
          Filtra los casos por su actual estado
        </p>
        <TableCases />
      </section>
    </>
  );
}
