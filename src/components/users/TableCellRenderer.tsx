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
    case "id_document":
      return (
        <div className="flex flex-col">
          <p className="text-base font-medium">{String(cellValue)}</p>
        </div>
      );
    case "name":
      return (
        <div className="flex flex-col">
          <p className="text-base font-medium">{String(cellValue)}</p>
        </div>
      );
    case "user_type":
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
    case "site":
    case "email":
      return (
        <div className="flex flex-col">
          <p className="text-base font-semibold text-primary">
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
            <Link href={`/users/${user.key}`}>
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
