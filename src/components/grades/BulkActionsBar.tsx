"use client";

import { Selection } from "@heroui/react";
import { Button } from "@heroui/react";
import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";

interface BulkActionsBarProps {
  selectedKeys: Selection;
  filteredItemsLength: number;
}

export function BulkActionsBar({
  selectedKeys,
  filteredItemsLength,
}: BulkActionsBarProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="flex justify-between items-center gap-3 py-4 px-6 bg-white rounded-xl shadow mb-4">
      <div className="flex gap-2 items-center">
        <p className="text-sm">
          {selectedKeys === "all"
            ? `${filteredItemsLength} calificaciones seleccionadas`
            : `${selectedKeys.size} calificaciones seleccionadas`}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          color="danger"
          startContent={<TrashIcon className="w-5" />}
          isLoading={isDeleting}
          isDisabled={isDeleting}
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
} 