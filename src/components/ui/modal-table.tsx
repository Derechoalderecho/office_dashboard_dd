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
import { UserWithKey } from "@/types/users";
import { transformStateByRole } from "@/utils/stateTransformer";
import { useUserRole } from "@/hooks/useUserRole";

interface ModalTableProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseWithKey | null;
}

export function ModalCase({ isOpen, onClose, caseData }: ModalTableProps) {
  const { role } = useUserRole();
  
  if (!caseData) return null;

  const displayState = transformStateByRole(caseData.estado, role);

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
                  <p>
                    {caseData.ciudadano?.primer_nombre}{" "}
                    {caseData.ciudadano?.primer_apellido}
                  </p>
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
                  <p className={`
                    ${displayState === "Aprobado" ? "text-[#12A150]" : 
                      displayState === "Seguimiento" ? "text-[#006FEE]" : 
                      displayState === "Acción necesaria" ? "text-[#C4841D]" : 
                      displayState === "No aprobado" ? "text-[#F31260]" : 
                      displayState === "Elaboración tutela" ? "text-indigo-600" : 
                      displayState === "Revisar tutela" ? "text-amber-600" : 
                      displayState === "Radicar" ? "text-emerald-600" : 
                      displayState === "Espera del juez" ? "text-sky-600" : ""
                    } font-medium`}
                  >
                    {displayState}
                  </p>
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

export function ModalCitizen({
  isOpen,
  onClose,
  citizenData,
}: ModalCitizenProps) {
  if (!citizenData) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              Vista previa del ciudadano #{citizenData.id_ciudadano}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Ciudadano</strong>
                  <p>
                    {citizenData.primer_nombre} {citizenData.primer_apellido}
                  </p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Correo</strong>
                  <p>{citizenData.email}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Documento</strong>
                  <p>
                    {citizenData.tipo_documento} {citizenData.num_documento}
                  </p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Celular</strong>
                  <p>{citizenData.num_movil}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Dane Municipio</strong>
                  <p>{citizenData.dane_municipio}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Fecha de Creación</strong>
                  <p>{new Date(citizenData.fecha_crea).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Fecha de Actualización</strong>
                  <p>
                    {new Date(citizenData.fecha_actualiza).toLocaleDateString()}
                  </p>
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

interface ModalUserProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserWithKey | null;
}

export function ModalUser({ isOpen, onClose, userData }: ModalUserProps) {
  if (!userData) return null;

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              Vista previa del usuario #{userData.id_usuario}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Ciudadano</strong>
                  <p>
                    {userData.primer_nombre} {userData.primer_apellido}
                  </p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Correo</strong>
                  <p>{userData.email}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Rol</strong>
                  <p>{userData.rol}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Documento</strong>
                  <p>
                    {userData.tipo_documento} {userData.num_documento}
                  </p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Fecha de Creación</strong>
                  <p>
                    {new Date(userData.fecha_creacion).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Fecha de Actualización</strong>
                  <p>
                    {new Date(
                      userData.fecha_actualizacion
                    ).toLocaleDateString()}
                  </p>
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
