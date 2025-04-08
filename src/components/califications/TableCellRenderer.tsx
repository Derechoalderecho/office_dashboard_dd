"use client";

import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Chip, Tooltip, Button } from "@heroui/react";
import { CaseWithKey } from "@/types/cases";

interface TableCellRendererProps {
  case: CaseWithKey;
  columnKey: keyof CaseWithKey;
  onPreviewCase?: (caseData: CaseWithKey) => void;
  onCalificateCase?: (caseData: CaseWithKey) => void;
}

export const TableCellRendererCalifications = ({
  case: caseData,
  columnKey,
  onPreviewCase,
  onCalificateCase,
}: TableCellRendererProps) => {
  const cellValue = caseData[columnKey];

  switch (columnKey) {
    case "tipo_proceso":
      return (
        <div className="flex flex-col">
          <p className="text-base font-medium">{String(cellValue)}</p>
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
    case "calificacion":
      // Format the calificacion value
      let displayValue = "-";
      if (cellValue !== null && cellValue !== undefined) {
        // If it's a numeric string, parse it
        const numValue = Number(cellValue);
        if (!isNaN(numValue)) {
          // If it's in integer format (0-50), convert to decimal (0-5)
          if (numValue > 5) {
            displayValue = (numValue / 10).toFixed(1);
          } else {
            displayValue = numValue.toString();
          }
        } else {
          displayValue = String(cellValue);
        }
      }
      
      return (
        <div className="flex flex-col">
          <p className="text-base font-medium text-primary">
            {displayValue}
          </p>
        </div>
      );
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Calificar estudiante">
            <Button
              isIconOnly
              className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
              onPress={() => onCalificateCase?.(caseData)}
              isDisabled={!caseData.usuarios?.some(user => user.rol === "Estudiante")}
            >
              <PencilSquareIcon className="w-6" />
            </Button>
          </Tooltip>
        </div>
      );
    default:
      return <div className="text-sm">{String(cellValue)}</div>;
  }
};
