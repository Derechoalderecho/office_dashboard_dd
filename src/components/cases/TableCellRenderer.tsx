"use client";

import { ClockIcon, EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Chip, User, Tooltip, Button } from "@heroui/react";
import { parseDateToLocal } from "@/utils/date";
import { CaseWithKey } from "@/types/cases";
import Link from "next/link";

interface TableCellRendererProps {
  user: CaseWithKey;
  columnKey: keyof CaseWithKey;
}

export const TableCellRendererCases = ({
  user,
  columnKey,
}: TableCellRendererProps) => {
  const cellValue = user[columnKey as keyof CaseWithKey];

  switch (columnKey) {
    case "fecha_crea":
      return (
        <div className="flex flex-col">
          <p className="font-medium text-sm">
            {parseDateToLocal(cellValue as string | number | Date)}
          </p>
        </div>
      );
    case "fecha_actualiza":
      return (
        <div className="flex flex-col">
          <p className="text-sm font-medium">
            {parseDateToLocal(cellValue as string | number | Date)}
          </p>
        </div>
      );
    case "tipo_proceso":
      return (
        <div className="flex flex-col">
          <p className="text-sm">{String(cellValue)}</p>
        </div>
      );
    case "estado":
      return (
        <Chip
          className={`capitalize ${
            cellValue === "Aprobado"
              ? "bg-success text-[#12A150]"
              : cellValue === "Seguimiento"
              ? "bg-followed text-[#006FEE]"
              : cellValue === "Acción Necesaria"
              ? "bg-warning text-[#C4841D]"
              : cellValue === "No Aprobado"
              ? "bg-error text-[#F31260]"
              : ""
          }`}
          size="sm"
          variant="flat"
        >
          {String(cellValue)}
        </Chip>
      );
    case "ciudadano":
      const ciudadano = user.citizen;
      return (
        <div className="flex flex-col">
          <p className="text-sm font-semibold">
            {ciudadano?.primer_nombre} {ciudadano?.primer_apellido}
          </p>
          {ciudadano?.email && (
            <p className="text-sm">{ciudadano.email}</p>
          )}
          {ciudadano?.num_movil && (
            <p className="text-sm">{ciudadano.num_movil}</p>
          )}
        </div>
      );
    case "tiempo_respuesta":
      return (
        <div className="flex gap-2 items-center">
          <ClockIcon className="w-6 text-[#12A150]" />
          <p className="text-sm font-semibold text-[#12A150]">
            {String(cellValue)} Horas
          </p>
        </div>
      );
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Vista previa">
            <Button
              isIconOnly
              className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
            >
              <EyeIcon className="w-6" />
            </Button>
          </Tooltip>
          <Tooltip content="Editar cliente">
            <Link href={`/dashboard/cases/${user.id_caso}`}>
              <Button
                isIconOnly
                className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <PencilIcon className="w-6" />
              </Button>
            </Link>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
};
