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

export const TableCellRenderer = ({
  user,
  columnKey,
}: TableCellRendererProps) => {
  const cellValue = user[columnKey];

  switch (columnKey) {
    case "created":
      return (
        <div className="flex flex-col">
          <p className="font-medium text-sm">
            {parseDateToLocal(cellValue as string | number | Date)}
          </p>
        </div>
      );
    case "update":
      return (
        <div className="flex flex-col">
          <p className="text-sm font-medium">
            {parseDateToLocal(cellValue as string | number | Date)}
          </p>
        </div>
      );
    case "proccess_type":
      return (
        <div className="flex flex-col">
          <p className="text-sm">{String(cellValue)}</p>
        </div>
      );
    case "status":
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
    case "name":
      return (
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{String(cellValue)}</p>
          {user.email && <p className="text-sm">{user.email}</p>}
          {user.phone && <p className="text-sm">{user.phone}</p>}
        </div>
      );
    case "response_time":
      return (
        <div className="flex gap-2 items-center">
          <ClockIcon className="w-6 text-[#12A150]" />
          <p className="text-sm font-semibold text-[#12A150]">
            {String(cellValue)} Horas
          </p>
        </div>
      );
    case "assigned":
      return (
        <User
          avatarProps={{ radius: "lg", src: user.assigned.avatar }}
          name={user.assigned.name}
        />
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
            <Link href={`/cases/${user.id}`}>
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
