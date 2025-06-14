"use client";

import { Tooltip, Button } from "@heroui/react";
import { EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { CitizenWithKey } from "@/types/citizens";
import { parseDate, parseTime } from "@/utils/date";
import { useRouter } from "next/navigation";
import { convertZonaCodeToDisplay } from "@/utils/citizenUtils";

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
  const router = useRouter();
  const cellValue = user[columnKey];

  const handleEditCitizen = (citizen: CitizenWithKey) => {
    router.push(`/dashboard/citizens/edit/${citizen.id_ciudadano}`);
  };

  switch (columnKey) {
    case "created_date":
      return (
        <div className="flex flex-col">
          <p className="font-medium text-sm">
            {parseDate(cellValue as string | number | Date)}
          </p>
          <p className="text-xs text-gray-500">
            {parseTime(cellValue as string | number | Date)}
          </p>
        </div>
      );
    case "primer_nombre":
      return (
        <p className="text-sm font-semibold flex flex-col">
        <span>{user?.primer_nombre} {user?.primer_apellido}</span>
        <span>{user?.segundo_nombre} {user?.segundo_apellido}</span>
      </p>
      );
    case "email":
      return (
        <div className="flex flex-col">
          <p className="text-base text-primary">{String(cellValue)}</p>
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
          <Tooltip content="Editar">
            <Button
              isIconOnly
              className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
              onPress={() => handleEditCitizen(user)}
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
