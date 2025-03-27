"use client";

import { Chip, Button, Tooltip } from "@heroui/react";
import {
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import { parseDateToLocal } from "@/utils/date";
import { Cases } from "@/types/cases";

interface CaseHeaderProps {
  caseData: Cases;
}

export default function CaseHeader({ caseData }: CaseHeaderProps) {
  return (
    <section className="flex items-center justify-between pb-4 mb-7 border-b-1">
      <div>
        <div className="flex gap-4 items-center mb-1">
          <h1 className="text-4xl font-medium">INV4257-09-011</h1>
          <Chip
            className={`Capitalize ${
              caseData.estado === "Aprobado"
                ? "bg-success text-[#12A150]"
                : caseData.estado === "Seguimiento"
                ? "bg-followed text-[#006FEE]"
                : caseData.estado === "Acción necesaria"
                ? "bg-warning text-[#C4841D]"
                : caseData.estado === "No aprobado"
                ? "bg-error text-[#F31260]"
                : ""
            }`}
            size="sm"
            variant="flat"
          >
            {caseData.estado}
          </Chip>
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
