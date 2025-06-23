

"use client";

import { EyeIcon } from "@heroicons/react/24/outline";
import { Chip, Tooltip, Button } from "@heroui/react";
import { CaseWithKey, CompleteCaseData } from "@/types/cases";

interface TableCellRendererProps {
  case: CaseWithKey;
  columnKey: string;
  onPreviewCase?: (caseData: CaseWithKey) => void;
}

export const TableCellRendererGrades = ({
  case: caseData,
  columnKey,
  onPreviewCase,
}: TableCellRendererProps) => {
  // Acceder al valor de forma segura
  const cellValue = columnKey in caseData ? caseData[columnKey as keyof CaseWithKey] : undefined;

  switch (columnKey) {
    case "id_caso":
      return (
        <div className="flex flex-col">
          <p className="font-medium text-sm text-blue-600">#{String(cellValue)}</p>
        </div>
      );
    case "tipo_proceso":
      return (
        <div className="flex flex-col">
          <p className="text-base font-medium">{String(cellValue)}</p>
        </div>
      );
    case "estado_actual":
      return (
        <Chip
          className={`capitalize ${
            cellValue === "Aprobado"
              ? "bg-success text-[#12A150]"
              : cellValue === "Seguimiento"
              ? "bg-followed text-[#006FEE]"
              : cellValue === "Acción necesaria"
              ? "bg-warning text-[#C4841D]"
              : cellValue === "No aprobado"
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
      const ciudadano = caseData.ciudadano;
      return (
        <div className="flex flex-col">
          <p className="text-sm font-semibold">
            {ciudadano?.primer_nombre} {ciudadano?.primer_apellido}
          </p>
          {ciudadano?.email && <p className="text-sm">{ciudadano.email}</p>}
        </div>
      );
    case "estudiante_asignado":
      const estudiante = caseData.usuarios?.find(
        user => user.rol === "Estudiante"
      );
      return (
        <div className="flex flex-col">
          {estudiante ? (
            <p className="text-sm font-medium">
              {estudiante.primer_nombre} {estudiante.primer_apellido}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Sin estudiante asignado</p>
          )}
        </div>
      );
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Ver detalles del caso">
            <Button
              isIconOnly
              className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
              onPress={() => onPreviewCase?.(caseData)}
            >
              <EyeIcon className="w-6" />
            </Button>
          </Tooltip>
        </div>
      );
    default:
      return <div className="text-sm">{String(cellValue)}</div>;
  }
};