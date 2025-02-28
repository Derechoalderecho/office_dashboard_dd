"use client";

import { Tooltip, Button } from "@heroui/react";
import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { CitizenWithKey } from "@/types/citizens";
import { parseDateToLocal } from "@/utils/date";

interface TableCellRendererProps {
  user: CitizenWithKey;
  columnKey: keyof CitizenWithKey;
}

export const TableCellRendererCitizens = ({
  user,
  columnKey,
}: TableCellRendererProps) => {
  const cellValue = user[columnKey];

  switch (columnKey) {
    case "created_at":
      return (
        <div className="flex flex-col">
          <p className="font-medium text-sm">
            {parseDateToLocal(cellValue as string | number | Date)}
          </p>
        </div>
      );
    case "first_name":
      return (
        <div className="flex flex-col">
          <p className="text-base font-semibold">{`${String(cellValue)} ${
            user.second_name ? String(user.second_name) : ""
          } `}</p>
          <p className="text-base font-medium">
            {user.first_lastname ? String(user.first_lastname) : ""} {""}
            {user.second_lastname ? String(user.second_lastname) : ""}
          </p>
        </div>
      );
    case "email":
      return (
        <div className="flex flex-col">
          <p className="text-base font-medium">{String(cellValue)}</p>
        </div>
      );
    case "mobile_phone":
      return (
        <div className="flex flex-col">
          <p className="text-base">{String(cellValue)}</p>
        </div>
      );
    case "site":
      return (
        <div className="flex flex-col">
          <p className="text-base">{String(cellValue)}</p>
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
