

"use client";

import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Chip, Tooltip, Button } from "@heroui/react";
import { CaseWithKey } from "@/types/cases";

interface TableCellRendererProps {
  case: CaseWithKey;
  columnKey: string;
  onPreviewCase?: (caseData: CaseWithKey) => void;
  onGradeCase?: (caseData: CaseWithKey) => void;
}

export const TableCellRendererGrades = ({
  case: caseData,
  columnKey,
  onPreviewCase,
  onGradeCase,
}: TableCellRendererProps) => {
  // Acceder al valor de forma segura
  const cellValue = columnKey in caseData ? caseData[columnKey as keyof CaseWithKey] : undefined;

  switch (columnKey) {
    case "calificacion":
      // Verificar si hay calificaciones
      if (caseData.calificaciones && caseData.calificaciones.length > 0) {
        // Calcular el promedio de todas las calificaciones
        const promedio = caseData.calificaciones.reduce((sum, cal) => sum + cal.promedio, 0) / caseData.calificaciones.length;
        return (
          <div className="flex justify-center items-center">
            <Chip color="primary" variant="flat" className="font-semibold">
              {promedio.toFixed(1)}
            </Chip>
          </div>
        );
      } else {
        return (
          <div className="flex justify-center items-center">
            <Chip color="default" variant="flat" className="text-gray-500">
              Sin calificar
            </Chip>
          </div>
        );
      }
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
    case "calificacion":
      const calificaciones = caseData.calificaciones;
      return (
        <div className="flex flex-col">
          {calificaciones && calificaciones.length > 0 ? (
            <p className="text-sm font-medium">
              {String(calificaciones[0].promedio)}
          </p>
          ) : (
            <p className="text-sm text-gray-500">Sin calificar</p>
          )}
        </div>
      );
    case "actions":
      return (
        <div className="relative flex items-center gap-2">
          <Tooltip content="Ver calificaciones del caso">
            <Button
              isIconOnly
              className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
              onPress={() => onPreviewCase?.(caseData)}
            >
              <EyeIcon className="w-6" />
            </Button>
          </Tooltip>
          <Tooltip content="Calificar caso">
            <Button
              isIconOnly
              className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
              onPress={() => onGradeCase?.(caseData)}
            >
              <PencilSquareIcon className="w-6" />
            </Button>
          </Tooltip>
        </div>
      );
      
    default:
      return <span>{String(cellValue)}</span>;
  }
};