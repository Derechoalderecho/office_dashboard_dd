"use client";

import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Chip, Tooltip, Button } from "@heroui/react";
import Link from "next/link";
import { UserWithKey } from "@/types/users";

interface TableCellRendererProps {
  user: UserWithKey;
  columnKey: keyof UserWithKey;
}

export const TableCellRendererUsers = ({
  user,
  columnKey,
}: TableCellRendererProps) => {
  const cellValue = user[columnKey];

  switch (columnKey) {
    case "num_documento":
      return (
        <div className="flex flex-col">
          <p className="text-base font-medium">{String(cellValue)}</p>
        </div>
      );
    case "primer_nombre":
      return (
        <p className="text-sm font-semibold">
          {user?.primer_nombre} {user?.primer_apellido}
        </p>
      );
    case "rol":
      return (
        <Chip
          className={`capitalize ${
            cellValue === "Docente"
              ? "bg-success text-[#12A150]"
              : cellValue === "Monitor"
              ? "bg-followed text-[#006FEE]"
              : cellValue === "Director"
              ? "bg-warning text-[#C4841D]"
              : cellValue === "Estudiante"
              ? "bg-error text-[#F31260]"
              : ""
          }`}
          size="sm"
          variant="flat"
        >
          {String(cellValue)}
        </Chip>
      );
    case "email":
      return (
        <div className="flex flex-col">
          <p className="text-base font-medium text-primary">
            {String(cellValue)}
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
            <Button
              isIconOnly
              className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
            >
              <PencilIcon className="w-6" />
            </Button>
          </Tooltip>
        </div>
      );
    default:
      return cellValue;
  }
};
