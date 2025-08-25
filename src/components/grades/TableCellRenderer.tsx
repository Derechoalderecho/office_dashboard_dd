"use client";

import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { Chip, Tooltip, Button } from "@heroui/react";
import { CaseWithKey } from "@/types/cases";
import { UserRole } from "@/store/slices/authSlice";

interface TableCellRendererProps {
  case: CaseWithKey;
  columnKey: string;
  onPreviewCase?: (caseData: CaseWithKey) => void;
  onGradeCase?: (caseData: CaseWithKey) => void;
  userRole?: UserRole;
}

export const TableCellRendererGrades = ({
  case: caseData,
  columnKey,
  onPreviewCase,
  onGradeCase,
  userRole,
}: TableCellRendererProps) => {
  // Acceder al valor de forma segura
  const cellValue = columnKey in caseData ? caseData[columnKey as keyof CaseWithKey] : undefined;

  switch (columnKey) {
    case "id":
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
        user => user.rol.nombre === "Estudiante"
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
      
      // Determinar el color según el valor de la calificación
      const getGradeColor = (grade: number) => {
        if (grade >= 4.0) return "success";
        if (grade >= 3.0) return "warning";
        return "danger";
      };
      
      return (
        <div className="flex">
          {calificaciones && calificaciones.length > 0 && calificaciones[0].promedio != null ? (
            <Chip 
              color={getGradeColor(calificaciones[0].promedio) as any}
              variant="flat"
              className="font-semibold"
            >
              {calificaciones[0].promedio.toFixed(1)}
            </Chip>
          ) : (
            <Chip color="default" variant="flat" className="text-gray-500">
              Sin calificar
            </Chip>
          )}
        </div>
      );
    case "actions":
      return (
        <div className="flex items-center gap-2">
          <Tooltip content="Ver calificaciones del caso">
            <Button
              isIconOnly
              className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
              onPress={() => onPreviewCase?.(caseData)}
            >
              <EyeIcon className="w-6" />
            </Button>
          </Tooltip>
          {userRole === 'Docente' || userRole === 'Director' || userRole === 'Monitor' ? (
            <Tooltip content="Calificar caso">
              <Button
                isIconOnly
                className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
                onPress={() => onGradeCase?.(caseData)}
              >
              <PencilSquareIcon className="w-6" />
            </Button>
          </Tooltip>
          ) : null}
        </div>
      );
      
    case "assignedUsers":
      const assignedStudent = caseData.usuarios?.find(
        user => user.rol.nombre === "Estudiante"
      );
      const assignedTeacher = caseData.usuarios?.find(
        user => user.rol.nombre === "Docente"
      );
      
      return (
        <div className="flex flex-col">
          {userRole === 'Docente' || userRole === 'Director' || userRole === 'Monitor' ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estudiante:</span>
              <span className="text-sm">
                {assignedStudent ? `${assignedStudent.primer_nombre} ${assignedStudent.primer_apellido}` : "Sin asignar"}
              </span>
            </div>
          ) : null}
          {userRole === 'Estudiante' || userRole === 'Director' || userRole === 'Monitor' ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Docente:</span>
              <span className="text-sm">
                {assignedTeacher ? `${assignedTeacher.primer_nombre} ${assignedTeacher.primer_apellido}` : "Sin asignar"}
              </span>
            </div>
          ) : null}
          {!userRole && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Estudiante:</span>
                <span className="text-sm">
                  {assignedStudent ? `${assignedStudent.primer_nombre} ${assignedStudent.primer_apellido}` : "Sin asignar"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Docente:</span>
                <span className="text-sm">
                  {assignedTeacher ? `${assignedTeacher.primer_nombre} ${assignedTeacher.primer_apellido}` : "Sin asignar"}
                </span>
              </div>
            </>
          )}
        </div>
      );
      
    default:
      return <span>{String(cellValue)}</span>;
  }
};