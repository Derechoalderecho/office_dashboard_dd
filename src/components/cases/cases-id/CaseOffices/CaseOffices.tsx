"use client";

import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { RefObject } from "react";
import CaseInfo from "@/components/cases/cases-id/CaseInfo";
import CasePreview from "@/components/cases/cases-id/CasePreview";
import DocumentsSection from "@/components/cases/cases-id/DocumentsSection";
import NotesSection from "@/components/cases/cases-id/NotesSection";
import CaseHistoryLogs from "@/components/cases/cases-id/CaseHistoryLogs";
import { CompleteCaseData } from "@/types/cases";

interface CaseOfficesProps {
  caseData: CompleteCaseData | null;
  caseId: number;
  notasList: any[];
  historyLogs: any[];
  role: string;
  statusChangeLoading: boolean;
  onApproveSubmission: () => Promise<void> | void;
  onRejectSubmission: () => Promise<void> | void;
  onViableSubmission: () => Promise<void> | void;
  onNotViableSubmission: () => Promise<void> | void;
  onRadicarClick: () => void;
  onTutelaUploaded: (isFromRadicarButton?: boolean) => Promise<void> | void;
  onChangeTutelaInEsperaJuez: () => Promise<void> | void;
  canUploadTutela: () => boolean;
  showRadicarNotification: boolean;
  onCloseRadicarNotification: () => void;
  tutelaPreviewRef: RefObject<HTMLDivElement | null>;
  loadCaseData: () => Promise<void> | void;
}

export default function CaseOffices({
  caseData,
  caseId,
  notasList,
  historyLogs,
  role,
  statusChangeLoading,
  onApproveSubmission,
  onRejectSubmission,
  onViableSubmission,
  onNotViableSubmission,
  onRadicarClick,
  onTutelaUploaded,
  onChangeTutelaInEsperaJuez,
  canUploadTutela,
  showRadicarNotification,
  onCloseRadicarNotification,
  tutelaPreviewRef,
  loadCaseData
}: CaseOfficesProps) {
  return (
    <main>
      <div key={caseData?.id_caso}>
        {/* Modal de notificación para casos en estado Radicar */}
        <Modal
          isOpen={showRadicarNotification}
          onClose={onCloseRadicarNotification}
          placement="center"
          classNames={{
            base: "bg-white shadow-lg rounded-lg max-w-md mx-auto",
            header: "border-b border-gray-200 p-4",
            body: "p-6",
            footer: "border-t border-gray-200 p-4"
          }}
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1 text-center">
              <div className="flex justify-center mb-2">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">¡Caso listo para radicar!</h3>
            </ModalHeader>
            <ModalBody>
              <div className="text-center space-y-4">
                <p className="text-gray-700">
                  La tutela ha sido aprobada y está lista para ser radicada. Para completar este proceso, haga clic en el botón "Radicar Tutela" en la parte superior de la página.
                </p>
                <p className="text-sm text-gray-500">
                  Una vez radicada, el caso pasará automáticamente al estado "Espera del juez".
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-center">
              <Button
                color="primary"
                className="w-full"
                onPress={onCloseRadicarNotification}
              >
                Entendido
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <section className="flex gap-6">
          <div className="w-[70%] shadow-custom bg-[#F9FAFB] rounded-lg">
            <div className="p-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">
                  Caso n# - {caseData?.id_caso}
                </h2>
                { /* <EditCaseModal caseData={caseData!} onSuccess={loadCaseData} />*/}
              </div>
              <hr className="my-4" />
         
              <CaseInfo caseData={caseData!} />

              <hr className="my-4" />
              
              {/* Añadir la ref para poder hacer scroll a esta sección */}
              <div ref={tutelaPreviewRef} className="transition-all duration-300">
                <CasePreview 
                  caseId={caseData?.id_caso || caseId} 
                  onTutelaUploaded={onTutelaUploaded}
                  canUpload={canUploadTutela()}
                  caseState={caseData?.estado_actual}
                />
              </div>
           
              <DocumentsSection caseId={caseData?.id_caso || caseId} />
           </div>
           </div>
          <aside className="w-[30%]">
            <NotesSection 
              caseId={caseData?.id_caso || caseId} 
              initialNotes={notasList}
              onNoteAdded={() => loadCaseData()}
            />

            <hr className="my-5" />
            <p className="font-medium mb-8">Registro de cambios de estado</p>

            <CaseHistoryLogs historyLogs={historyLogs} />
          </aside>
        </section>
       </div>
    </main>
  );
}