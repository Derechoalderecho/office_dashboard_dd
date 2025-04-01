"use client";

import { Chip, Button, Tooltip } from "@heroui/react";
import {
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowUpIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { parseDateToLocal } from "@/utils/date";
import { Cases } from "@/types/cases";
import { transformStateByRole } from "@/utils/stateTransformer";
import { useUserRole } from "@/hooks/useUserRole";
import { useState } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface CaseHeaderProps {
  caseData: Cases;
  onApproveSubmission?: () => Promise<void>;
  onRejectSubmission?: () => Promise<void>;
  isStatusChangeLoading?: boolean;
  onRadicarClick?: () => void;
}

export default function CaseHeader({
  caseData,
  onApproveSubmission,
  onRejectSubmission,
  isStatusChangeLoading = false,
  onRadicarClick,
}: CaseHeaderProps) {
  const { role } = useUserRole();
  const displayState = transformStateByRole(caseData.estado, role);
  const [isRadicarInfoOpen, setIsRadicarInfoOpen] = useState(false);

  const handleRadicarClick = () => {
    if (onRadicarClick) {
      onRadicarClick();
    } else {
      // Mostrar información sobre la radicación
      setIsRadicarInfoOpen(true);
    }
  };

  // Determinar si se debe mostrar el botón de "Aprobar Envío"
  const showApproveButton = caseData.estado === "Revisar tutela";
  
  // Determinar si se debe mostrar el botón de "Rechazar Envío"
  const showRejectButton = caseData.estado === "Revisar tutela" || 
                          caseData.estado === "Radicar" || 
                          caseData.estado === "Valoración del asesor";
  
  // Determinar el texto del botón de aprobar según el estado
  const getApproveButtonText = () => {
    if (caseData.estado === "Revisar tutela") {
      return "Aprobar Tutela";
    }
    return "Aprobar Envío";
  };

  return (
    <section className="flex items-center justify-between pb-4 mb-7 border-b-1">
      <div>
        <div className="flex gap-4 items-center mb-1">
          <h1 className="text-4xl font-medium">INV4257-09-011</h1>
          <div
            className={`w-fit flex gap-2 items-center rounded-full py-1 px-3 
            ${
              displayState === "Aprobado"
                ? "bg-[#12A150]/10 text-[#12A150]"
                : displayState === "Seguimiento"
                ? "bg-[#006FEE]/10 text-[#006FEE]"
                : "bg-[#C4841D]/10 text-[#C4841D]"
            }`}
          >
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
        {/* Botón de Radicar (solo para estado "Radicar") */}
        {caseData.estado === "Radicar" && (
          <Button
            className="text-white bg-[#006FEE]"
            isDisabled={isStatusChangeLoading}
            isLoading={isStatusChangeLoading}
            onPress={handleRadicarClick}
            startContent={<ArrowUpTrayIcon className="w-6 text-white" />}
          >
            Radicar Tutela
          </Button>
        )}

        {/* Botón de Aprobar (para estados "Revisar tutela" y "Radicar") */}
        {showApproveButton && (
          <Button
            className="text-white bg-[#12A150]"
            isDisabled={!onApproveSubmission || isStatusChangeLoading}
            isLoading={isStatusChangeLoading}
            onPress={onApproveSubmission}
            startContent={
              <CheckCircleIcon className="w-6 text-white" />
            }
          >
            {getApproveButtonText()}
          </Button>
        )}

        {/* Botón de Rechazar (para varios estados) */}
        {showRejectButton && onRejectSubmission && (
          <Button
            variant="bordered"
            color="danger"
            isDisabled={isStatusChangeLoading}
            onPress={onRejectSubmission}
            isLoading={isStatusChangeLoading}
            startContent={<XCircleIcon className="w-6 text-danger" />}
          >
            Rechazar Envío
          </Button>
        )}
        
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

      <AlertDialog
        isOpen={isRadicarInfoOpen}
        onClose={() => setIsRadicarInfoOpen(false)}
        onConfirm={() => setIsRadicarInfoOpen(false)}
        title="Información sobre radicación"
        description="Para avanzar este caso, es obligatorio radicar la tutela. Desplácese hacia abajo hasta la sección 'Previsualización de la tutela' y cargue el documento. Una vez cargado, el estado cambiará automáticamente a 'Espera del juez'. Esta es la única forma de avanzar el caso en este estado."
        confirmText="Entendido"
        type="info"
      />
    </section>
  );
}
