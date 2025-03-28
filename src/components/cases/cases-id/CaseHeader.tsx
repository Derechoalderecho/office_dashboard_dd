"use client";

import { Chip, Button, Tooltip } from "@heroui/react";
import {
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import { parseDateToLocal } from "@/utils/date";
import { Cases } from "@/types/cases";
import { transformStateByRole } from "@/utils/stateTransformer";
import { useUserRole } from "@/hooks/useUserRole";

interface CaseHeaderProps {
  caseData: Cases;
}

export default function CaseHeader({ caseData }: CaseHeaderProps) {
  const { role } = useUserRole();
  const displayState = transformStateByRole(caseData.estado, role);

  return (
    <section className="flex items-center justify-between pb-4 mb-7 border-b-1">
      <div>
        <div className="flex gap-4 items-center mb-1">
          <h1 className="text-4xl font-medium">INV4257-09-011</h1>
          <div className={`w-fit flex gap-2 items-center rounded-full py-1 px-3 
            ${
              displayState === "Aprobado"
                ? "bg-[#12A150]/10 text-[#12A150]"
                : displayState === "Seguimiento"
                ? "bg-[#006FEE]/10 text-[#006FEE]"
                : "bg-[#C4841D]/10 text-[#C4841D]"
            }`}>
            <div
              className={`w-2 h-2 rounded-full ${
                displayState === "Aprobado"
                  ? "bg-[#12A150]"
                  : displayState === "Seguimiento"
                  ? "bg-[#006FEE]"
                  : "bg-[#C4841D]"
              }`}
            ></div>
            <span className="text-sm font-medium">{displayState}</span>
          </div>
        </div>
        <p className="text-sm text-secondary">
          {parseDateToLocal(caseData.fecha_crea)}
        </p>
      </div>
      <div className="flex gap-2 items-center">
        <Button
          className="text-white bg-[#12A150]"
          startContent={
            <ClipboardDocumentCheckIcon className="w-6 text-white" />
          }
        >
          Aprobar envío
        </Button>
        <Button
          variant="bordered"
          color="primary"
          isDisabled
          startContent={<DocumentArrowUpIcon className="w-6" />}
        >
          Elevar Instancia
        </Button>
        <Tooltip content="Editar documento">
          <Button
            variant="bordered"
            color="secondary"
            isDisabled
            isIconOnly
            startContent={<PencilSquareIcon className="w-6" />}
          />
        </Tooltip>
      </div>
    </section>
  );
}
