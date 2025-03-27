"use client";

import { Chip, Button } from "@heroui/react";
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
      <div className="flex flex-col gap-2 items-center">
        <Button
          color="primary"
          isDisabled
          startContent={<DocumentArrowUpIcon className="w-6" />}
        >
          Elevar Instancia
        </Button>
        <div className="flex items-center gap-2">
          <Button
            color="secondary"
            variant="bordered"
            isDisabled
            startContent={<PencilSquareIcon className="w-6" />}
          >
            Editar documento
          </Button>
          <Button
            className="border-[#12A150] text-[#12A150]"
            variant="bordered"
            startContent={
              <ClipboardDocumentCheckIcon className="w-6 text-[#12A150]" />
            }
          >
            Aprobar envío
          </Button>
        </div>
      </div>
    </section>
  );
} 