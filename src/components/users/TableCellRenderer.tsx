"use client";

import { EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Chip, Tooltip, Button } from "@heroui/react";
import { UserWithKey } from "@/types/users";

interface TableCellRendererProps {
  user: UserWithKey;
  columnKey: keyof UserWithKey;
  onPreviewUser?: (user: UserWithKey) => void;
}

export const TableCellRendererUsers = ({
  user,
  columnKey,
  onPreviewUser,
}: TableCellRendererProps) => {
  const cellValue = user[columnKey];

  switch (columnKey) {
    case "num_documento":
      return (
        <div className="flex flex-col">
          <p className="text-base font-medium">{String(cellValue)}</p>
        </div>
      );
  case "areas_atencion":
      // 'cellValue' es un array: [{ id: 2, nombre: "..." }]
      // Mapeamos el array para obtener los nombres y los unimos con una coma
      const areas = (cellValue as any[])?.map(area => area.nombre).join(', ');
      return (
        <div className="flex flex-col">
          <p className="text-base">{areas || "Sin área"}</p>
        </div>
      );

    case "universidades":
      // 'cellValue' es un array: [{ id: 19, nombre: "..." }]
      const universidades = (cellValue as any[])?.map(uni => uni.nombre).join(', ');
      return (
        <div className="flex flex-col">
          <p className="text-base">{universidades || "Sin universidad"}</p>
        </div>
      );
    case "primer_nombre":
      return (
        <p className="text-sm font-semibold">
          {user?.primer_nombre} {user?.primer_apellido}
        </p>
      );
    case "rol":
      const rolNombre =
        typeof cellValue === "object" && cellValue !== null && "nombre" in cellValue
          ? (cellValue as { nombre: string }).nombre
          : String(cellValue);
      return (
        <Chip
          className={`capitalize ${
            rolNombre === "Docente"
              ? "bg-success text-[#12A150]"
              : rolNombre === "Monitor"
              ? "bg-followed text-[#006FEE]"
              : rolNombre === "Director"
              ? "bg-warning text-[#C4841D]"
              : rolNombre === "Estudiante"
              ? "bg-error text-[#F31260]"
              : ""
          }`}
          size="sm"
          variant="flat"
        >
          {String(rolNombre)}
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
              onPress={() => onPreviewUser?.(user)}
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
