"use client";

import { Button, Tooltip } from "@heroui/react";
import {
  PencilSquareIcon,
  DocumentArrowUpIcon,
  XCircleIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  ArrowPathRoundedSquareIcon
} from "@heroicons/react/24/outline";
import { parseDateToLocal } from "@/utils/date";
import { CompleteCaseData } from "@/types/cases";
import { transformStateByRole } from "@/utils/stateTransformer";
import { UserRole } from "@/store/slices/authSlice";
import { useState } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { getCaseStatusStyles } from "@/utils/caseStatusStyles";

interface CaseHeaderProps {
  caseData: CompleteCaseData;
  onApproveSubmission?: () => Promise<void>;
  onRejectSubmission?: () => Promise<void>;
  onViableSubmission?: () => Promise<void>;
  onNotViableSubmission?: () => Promise<void>;
  isStatusChangeLoading?: boolean;
  onRadicarClick?: () => void;
  onChangeTutelaInEsperaJuez?: () => void;
  role: UserRole;
}

export default function CaseHeader({
  caseData,
  onApproveSubmission,
  onRejectSubmission,
  onViableSubmission,
  onNotViableSubmission,
  isStatusChangeLoading = false,
  onRadicarClick,
  onChangeTutelaInEsperaJuez,
  role,
}: CaseHeaderProps) {
  const displayState = transformStateByRole(caseData.estado_actual, role);
  const [isRadicarInfoOpen, setIsRadicarInfoOpen] = useState(false);
  const [isChangeTutelaDialogOpen, setIsChangeTutelaDialogOpen] = useState(false);

  //Botón para radicar tutela
  const handleRadicarClick = () => {
    if (onRadicarClick) {
      onRadicarClick();
    } else {
      // Mostrar información sobre la radicación
      setIsRadicarInfoOpen(true);
    }
  };

  //Botón para cambiar radicado tutela
  const handleChangeTutelaClick = () => {
    // Mostrar alert dialog de confirmación
    setIsChangeTutelaDialogOpen(true);
  };

  const confirmChangeTutela = () => {
    setIsChangeTutelaDialogOpen(false);
    
    // Llamar al manejador de cambio de tutela
    if (onChangeTutelaInEsperaJuez) {
      onChangeTutelaInEsperaJuez();
    }
  };

  // Determinar si se debe mostrar los botones de viabilidad
  const showViabilityButtons = caseData.estado_actual === "Viabilidad";

  // Determinar si se debe mostrar el botón de "Aprobar Envío"
  const showApproveButton = caseData.estado_actual === "Revisar tutela";

  // Determinar si se debe mostrar el botón de "Rechazar Envío"
  const showRejectButton =
    caseData.estado_actual === "Revisar tutela" ||
    caseData.estado_actual === "Radicar" ||
    caseData.estado_actual === "Valoración del asesor";

  // Determinar el texto del botón de aprobar según el estado
  const getApproveButtonText = () => {
    if (caseData.estado_actual === "Revisar tutela") {
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
            className={`w-fit flex gap-2 items-center rounded-full py-1 px-3 ${getCaseStatusStyles(displayState, 'badge')}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${getCaseStatusStyles(displayState, 'indicator')}`}
            ></div>
            <span className="text-sm font-medium capitalize">
              {displayState}
            </span>
          </div>
        </div>
        <p className="text-sm text-secondary">
          {parseDateToLocal(caseData.created_date)}
        </p>
      </div>
      <div className="flex gap-2 items-center">
        {/* Botones de Viabilidad */}
        {showViabilityButtons && (role === "Estudiante" || role === "Docente") && (
          <>
            <Button
              className="text-white bg-[#12A150]"
              isDisabled={!onViableSubmission || isStatusChangeLoading}
              isLoading={isStatusChangeLoading}
              onPress={onViableSubmission}
              startContent={<CheckCircleIcon className="w-6 text-white" />}
            >
              Es Viable
            </Button>
            <Button
              variant="bordered"
              color="danger"
              isDisabled={!onNotViableSubmission || isStatusChangeLoading}
              isLoading={isStatusChangeLoading}
              onPress={onNotViableSubmission}
              startContent={<XCircleIcon className="w-6 text-danger" />}
            >
              No es Viable
            </Button>
          </>
        )}

        {/* Botón de Radicar (solo para estado "Radicar") */}
        {caseData.estado_actual === "Radicar" && (
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

        {/* Botón de Cambiar Radicado (solo para estado "Espera del juez") */}
        {caseData.estado_actual === "Espera del juez" && (
          <Button
            className="text-white bg-[#F59E0B]"
            isDisabled={isStatusChangeLoading}
            isLoading={isStatusChangeLoading}
            onPress={handleChangeTutelaClick}
            startContent={<ArrowPathRoundedSquareIcon className="w-6 text-white" />}
          >
            Cambiar Radicado
          </Button>
        )}

        {/* Botón de Aprobar (para estados "Revisar tutela" y "Radicar") */}
        {showApproveButton && (role === "Docente") && (
          <Button
            className="text-white bg-[#12A150]"
            isDisabled={!onApproveSubmission || isStatusChangeLoading}
            isLoading={isStatusChangeLoading}
            onPress={onApproveSubmission}
            startContent={<CheckCircleIcon className="w-6 text-white" />}
          >
            {getApproveButtonText()}
          </Button>
        )}

        {/* Botón de Rechazar (para varios estados) */}
        {showRejectButton && (role === "Docente") && onRejectSubmission && (
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

      <AlertDialog
        isOpen={isChangeTutelaDialogOpen}
        onClose={() => setIsChangeTutelaDialogOpen(false)}
        onConfirm={confirmChangeTutela}
        title="Cambiar documento radicado"
        description="Está a punto de cambiar el documento radicado. Esta acción es importante y debe realizarse solo si es necesario corregir o actualizar el documento. ¿Está seguro de que desea continuar?"
        confirmText="Sí, cambiar radicado"
        cancelText="Cancelar"
        type="warning"
      />
    </section>
  );
}
