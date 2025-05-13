"use client";

import { ClockIcon, EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Chip, Tooltip, Button, Avatar, AvatarGroup } from "@heroui/react";
import { parseDateToLocal } from "@/utils/date";
import { CaseWithKey } from "@/types/cases";
import { transformStateByRole } from "@/utils/stateTransformer";
import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";

interface TableCellRendererProps {
  user: CaseWithKey;
  columnKey: keyof CaseWithKey;
  onPreviewCase?: (caseData: CaseWithKey) => void;
}

export const TableCellRendererCases = ({
  user,
  columnKey,
  onPreviewCase,
}: TableCellRendererProps) => {
  const cellValue = user[columnKey as keyof CaseWithKey];
  // Obtenemos el rol del usuario
  const { role } = useUserRole();

  switch (columnKey) {
    case "id_caso":
      return (
        <div className="flex flex-col">
          <p className="font-medium text-sm text-blue-600">#{String(cellValue)}</p>
        </div>
      );
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
      // Transformamos el estado según el rol del usuario
      const originalState = String(cellValue);
      const displayState = transformStateByRole(originalState, role);
      
      return (
        <Chip
          className={`capitalize ${
            displayState === "Aprobado"
              ? "bg-success text-[#12A150]"
              : displayState === "Seguimiento"
              ? "bg-followed text-[#006FEE]"
              : displayState === "Acción necesaria"
              ? "bg-warning text-[#C4841D]"
              : displayState === "No aprobado"
              ? "bg-error text-[#F31260]"
              : displayState === "Viabilidad"
              ? "bg-purple-100 text-purple-600"
              : displayState === "Elaboración tutela"
              ? "bg-indigo-100 text-indigo-600"
              : displayState === "Valoración del asesor"
              ? "bg-teal-100 text-teal-600"
              : displayState === "Revisar tutela"
              ? "bg-amber-100 text-amber-600"
              : displayState === "Radicar"
              ? "bg-emerald-100 text-emerald-600"
              : displayState === "Pendiente"
              ? "bg-rose-100 text-rose-600"
              : displayState === "Espera del juez"
              ? "bg-sky-100 text-sky-600"
              : ""
          }`}
          size="sm"
          variant="flat"
        >
          {displayState}
        </Chip>
      );
    case "ciudadano":
      const ciudadano = user.ciudadano;
      return (
        <div className="flex flex-col">
          <p className="text-sm font-semibold">
            {ciudadano?.primer_nombre} {ciudadano?.primer_apellido}
          </p>
          {ciudadano?.email && <p className="text-sm">{ciudadano.email}</p>}
          {ciudadano?.num_movil && (
            <p className="text-sm">{ciudadano.num_movil}</p>
          )}
        </div>
      );
    case "tiempo_respuesta":
      const tiempo = Number(cellValue);
      const getColor = () => {
        if (tiempo <= 24) return "text-[#F31260]";
        if (tiempo <= 48) return "text-[#C4841D]";
        if (tiempo <= 72) return "text-[#006FEE]";
        return "text-[#12A150]";
      };
      return (
        <div className="flex gap-2 items-center">
          <ClockIcon className={`w-6 ${getColor()}`} />
          <p className={`text-sm font-semibold ${getColor()}`}>
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
              onPress={() => onPreviewCase?.(user)}
            >
              <EyeIcon className="w-6" />
            </Button>
          </Tooltip>
          <Tooltip content="Editar caso">
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
    case "usuarios":
      return (
        <>
          {user.usuarios && user.usuarios.length > 0 ? (
            <AvatarGroup
              isBordered
              max={2}
              total={user.usuarios.length > 2 ? user.usuarios.length : undefined}
              classNames={{
                count: "text-sm h-8 w-8",
              }}
            >
              {user.usuarios.map((assignedUser, index) => (
                <Tooltip
                  key={index}
                  content={
                    assignedUser.primer_nombre +
                    " " +
                    assignedUser.primer_apellido
                  }
                >
                  <Avatar
                    key={index}
                    size="sm"
                    name={
                      assignedUser.primer_nombre +
                      " " +
                      assignedUser.primer_apellido
                    }
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
          ) : (
            <p className="text-sm text-gray-500">Sin usuarios asignados</p>
          )}
        </>
      );
    default:
      return <div className="text-sm">{String(cellValue)}</div>;
  }
};
