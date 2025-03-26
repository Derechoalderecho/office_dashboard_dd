"use client";

import { Tooltip, Button } from "@heroui/react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { CitizenWithKey } from "@/types/citizens";
import { parseDateToLocal } from "@/utils/date";

interface TableCellRendererProps {
  user: CitizenWithKey;
  columnKey: keyof CitizenWithKey;
  onPreviewCitizen?: (citizenData: CitizenWithKey) => void;
}

export const TableCellRendererCitizens = ({
  user,
  columnKey,
  onPreviewCitizen,
}: TableCellRendererProps) => {
  const cellValue = user[columnKey];

  switch (columnKey) {
    case "fecha_crea":
      return (
        <div className="flex flex-col">
          <p className="font-medium text-sm">
            {parseDateToLocal(cellValue as string | number | Date)}
          </p>
        </div>
      );
    case "primer_nombre":
      return (
        <p className="text-sm font-semibold">
        {user?.primer_nombre} {user?.primer_apellido}
      </p>
      );
    case "email":
      return (
        <div className="flex flex-col">
          <p className="text-base font-medium">{String(cellValue)}</p>
        </div>
      );
    case "num_movil":
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
              onPress={() => onPreviewCitizen?.(user)}
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
