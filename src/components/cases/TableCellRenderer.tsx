"use client";

import { ClockIcon, EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Chip, Tooltip, Button, Avatar, AvatarGroup } from "@heroui/react";
import { parseDateToLocal } from "@/utils/date";
import { CaseWithKey } from "@/types/cases";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUsersByCaseId } from "@/services/caseService";

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
  const [assignedUsers, setAssignedUsers] = useState([]);
  const cellValue = user[columnKey as keyof CaseWithKey];

  useEffect(() => {
    if (columnKey === "usuarios_asignados") {
      const loadAssignedUsers = async () => {
        const users = await fetchUsersByCaseId(user.id_caso);
        setAssignedUsers(users);
      };
      loadAssignedUsers();
    }
  }, [columnKey, user.id_caso]);

  console.log(assignedUsers);

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
    case "usuarios_asignados":
      return (
        <>
          {assignedUsers.length > 0 ? (
            <AvatarGroup isBordered max={2} total={assignedUsers.length - 1}>
              {assignedUsers.map((assignedUser, index) => (
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
