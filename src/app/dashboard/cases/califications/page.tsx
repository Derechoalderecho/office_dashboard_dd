"use client";

import dynamic from "next/dynamic";
import { Tab, Tabs } from "@heroui/react";
import { usePathname } from "next/navigation";

const TableCalifications = dynamic(
  () => import("@/components/califications/Table"),
  {
    ssr: false,
  }
);

export default function CalificationsPage() {
  const pathname = usePathname();
  return (
    <>
      <h1 className="semibold-32 text-primary mb-7">Panel de calificaciones</h1>
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
          Filtra los estudiantes por su caso
        </p>
        <TableCalifications />
      </section>
    </>
  );
}
