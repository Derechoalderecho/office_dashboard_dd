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
import { Cases } from "@/types/cases";
import { transformStateByRole } from "@/utils/stateTransformer";
import { UserRole } from "@/store/slices/authSlice";
import { useState } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface CaseHeaderProps {
  caseData: Cases;
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
  const displayState = transformStateByRole(caseData.estado, role);
  const [isRadicarInfoOpen, setIsRadicarInfoOpen] = useState(false);
  const [isChangeTutelaDialogOpen, setIsChangeTutelaDialogOpen] = useState(false);

  const handleRadicarClick = () => {
    if (onRadicarClick) {
      onRadicarClick();
    } else {
      // Mostrar información sobre la radicación
      setIsRadicarInfoOpen(true);
    }
  };

  const handleChangeTutelaClick = () => {
    // Mostrar diálogo de confirmación
    setIsChangeTutelaDialogOpen(true);
  };

  const confirmChangeTutela = () => {
    // Cerrar diálogo
    setIsChangeTutelaDialogOpen(false);
    
    // Llamar a la función del componente padre
    if (onChangeTutelaInEsperaJuez) {
      onChangeTutelaInEsperaJuez();
    }
  };

  // Determinar si se debe mostrar los botones de viabilidad
  const showViabilityButtons = caseData.estado === "Viabilidad";

  // Determinar si se debe mostrar el botón de "Aprobar Envío"
  const showApproveButton = caseData.estado === "Revisar tutela";

  // Determinar si se debe mostrar el botón de "Rechazar Envío"
  const showRejectButton =
    caseData.estado === "Revisar tutela" ||
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
                ? "bg-success text-[#12A150]"
                : displayState === "Seguimiento"
                ? "bg-followed text-[#006FEE]"
                : displayState === "Acción necesaria"
                ? "bg-warning text-[#C4841D]"
                : displayState === "No aprobado"
                ? "bg-error text-[#F31260]"
                : displayState === "Viabilidad"
                ? "bg-purple-100 text-purple-600"
                : displayState === "Elaboración tutela"
                ? "bg-indigo-100 text-indigo-600"
                : displayState === "Valoración del asesor"
                ? "bg-teal-100 text-teal-600"
                : displayState === "Revisar tutela"
                ? "bg-amber-100 text-amber-600"
                : displayState === "Radicar"
                ? "bg-emerald-100 text-emerald-600"
                : displayState === "Pendiente"
                ? "bg-rose-100 text-rose-600"
                : displayState === "Espera del juez"
                ? "bg-sky-100 text-sky-600"
                : ""
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                displayState === "Aprobado"
                  ? "bg-[#12A150]"
                  : displayState === "Seguimiento"
                  ? "bg-[#006FEE]"
                  : displayState === "No aprobado"
                  ? "bg-[#F31260]"
                  : displayState === "Viabilidad"
                  ? "bg-purple-600"
                  : displayState === "Elaboración tutela"
                  ? "bg-indigo-600"
                  : displayState === "Valoración del asesor"
                  ? "bg-teal-600"
                  : displayState === "Revisar tutela"
                  ? "bg-amber-600"
                  : displayState === "Radicar"
                  ? "bg-emerald-600"
                  : displayState === "Pendiente"
                  ? "bg-rose-600"
                  : displayState === "Espera del juez"
                  ? "bg-sky-600"
                  : "bg-[#C4841D]"
              }`}
            ></div>
            <span className="text-sm font-medium capitalize">
              {displayState}
            </span>
          </div>
        </div>
        <p className="text-sm text-secondary">
          {parseDateToLocal(caseData.fecha_crea)}
        </p>
      </div>
      <div className="flex gap-2 items-center">
        {/* Botones de Viabilidad */}
        {showViabilityButtons && (
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

        {/* Botón de Cambiar Radicado (solo para estado "Espera del juez") */}
        {caseData.estado === "Espera del juez" && (
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
        {showApproveButton && (
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
