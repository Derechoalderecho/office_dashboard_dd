import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
  } from "@heroui/react";
import { CaseWithKey } from "@/types/cases";
import { CitizenWithKey } from "@/types/citizens";

interface ModalTableProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseWithKey | null;
}

export function ModalCase({ isOpen, onClose, caseData }: ModalTableProps) {
  if (!caseData) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Vista previa del caso #{caseData.id_caso}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Ciudadano</strong>
                  <p>{caseData.ciudadano?.primer_nombre} {caseData.ciudadano?.primer_apellido}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Correo</strong>
                  <p>{caseData.ciudadano?.email}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Teléfono</strong>
                  <p>{caseData.ciudadano?.num_movil}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Tipo de Proceso</strong>
                  <p>{caseData.tipo_proceso}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Estado</strong>
                  <p>{caseData.estado}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Tiempo de Respuesta</strong>
                  <p>{caseData.tiempo_respuesta} Horas</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Fecha de Creación</strong>
                  <p>{new Date(caseData.fecha_crea).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Notas</strong>
                  <p className="text-right">{caseData.notas}</p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

interface ModalCitizenProps {
    isOpen: boolean;
    onClose: () => void;
    citizenData: CitizenWithKey | null;
  }

export function ModalCitizen({ isOpen, onClose, citizenData }: ModalCitizenProps) {
  if (!citizenData) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2>Ciudadano</h2>
            </ModalHeader>
            <ModalBody>
              <div>
                <p>{citizenData.primer_nombre} {citizenData.primer_apellido}</p>
                    <p>{citizenData.email}</p>
                </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
