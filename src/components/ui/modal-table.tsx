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
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import locations from "@/data/locations.json";
import { parseDateToLocal } from "@/utils/date";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface ModalTableProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseWithKey | null;
}

export function ModalCase({ isOpen, onClose, caseData }: ModalTableProps) {
  const { role } = useAuth();
  const [showMore, setShowMore] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  if (!caseData) return null;

  const displayState = transformStateByRole(caseData.estado_actual, role);

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
                  <p>{caseData.id_tipo_caso}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Estado</strong>
                  <p
                    className={`
                    ${
                      displayState === "Aprobado"
                        ? "text-[#12A150]"
                        : displayState === "Seguimiento"
                        ? "text-[#006FEE]"
                        : displayState === "Acción necesaria"
                        ? "text-[#C4841D]"
                        : displayState === "No aprobado"
                        ? "text-[#F31260]"
                        : displayState === "Elaboración tutela"
                        ? "text-indigo-600"
                        : displayState === "Revisar tutela"
                        ? "text-amber-600"
                        : displayState === "Radicar"
                        ? "text-emerald-600"
                        : displayState === "Espera del juez"
                        ? "text-sky-600"
                        : ""
                    } font-medium`}
                  >
                    {displayState}
                  </p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Tiempo de Respuesta</strong>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Fecha de Creación</strong>
                  <p>{new Date(caseData.created_date).toLocaleDateString()}</p>
                </div>

                {showMore && (
                  <>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Fecha de Actualización</strong>
                      <p>
                        {new Date(
                          caseData.modified_date || caseData.created_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    {caseData.documentos && caseData.documentos.length > 0 && (
                      <div className="flex items-center justify-between border-b pb-3">
                        <strong>Documentos</strong>
                        <p>{caseData.documentos.length} documentos adjuntos</p>
                      </div>
                    )}
                    {caseData.usuarios && caseData.usuarios.length > 0 && (
                      <div className="flex flex-col border-b pb-3">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => setShowUsers(!showUsers)}
                        >
                          <strong>Usuarios Asignados</strong>
                          <div className="flex items-center">
                            <p className="mr-2">
                              {caseData.usuarios.length} usuarios
                            </p>
                            {showUsers ? (
                              <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>

                        {showUsers && (
                          <div className="mt-3 bg-gray-50 p-3 rounded-md space-y-2 max-h-40 overflow-y-auto">
                            {caseData.usuarios.map((usuario, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center py-1 border-b border-gray-200 last:border-0"
                              >
                                <div>
                                  <span className="font-medium">
                                    {usuario.primer_nombre}{" "}
                                    {usuario.primer_apellido}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    {usuario.email}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                    {usuario.rol}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <Button
                variant="light"
                onPress={() => setShowMore(!showMore)}
                className="text-primary"
              >
                {showMore ? "Mostrar menos" : "Mostrar más"}
              </Button>
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
  const [showMore, setShowMore] = useState(false);

  if (!citizenData) return null;

  function getMunicipalityName(daneMunicipio: string) {
    const location = locations.find(
      (loc) => loc.dane_municipio === daneMunicipio
    );
    return location ? location.nombre_municipio : daneMunicipio;
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              Vista previa del ciudadano #{citizenData.id_ciudadano}
            </ModalHeader>
            <ModalBody className="overflow-y-auto max-h-[500px]">
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
                <div className="flex items-center border-b pb-3">
                  <strong>Documento</strong>
                  <div className="flex gap-2 justify-end w-full">
                    <p className="font-medium">{citizenData.tipo_documento}</p>
                    <p>{citizenData.num_documento}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Celular</strong>
                  <p>{citizenData.num_movil}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Municipio</strong>
                  <p className="text-right">
                    {getMunicipalityName(citizenData.dane_municipio)}
                  </p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Dirección</strong>
                  <p className="text-right">
                    {citizenData.direccion_residencia || "No especificado"}
                  </p>
                </div>
                <div className="flex items-center justify-between border-b pb-3">
                  <strong>Fecha de Creación</strong>
                  <p>{new Date(citizenData.created_date).toLocaleDateString()}</p>
                </div>

                {showMore && (
                  <>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Nacionalidad</strong>
                      <p>{citizenData.nacionalidad || "No especificado"}</p>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Teléfono Fijo</strong>
                      <p>{citizenData.telefono_fijo || "No especificado"}</p>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Fecha de Nacimiento</strong>
                      <p>
                        {parseDateToLocal(citizenData.fecha_nacimiento) ||
                          "No especificado"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Fecha de Actualización</strong>
                      <p>
                        {new Date(
                          citizenData.modified_date || citizenData.created_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Etnia</strong>
                      <p>{citizenData.etnia || "No especificado"}</p>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Estrato</strong>
                      <p>{citizenData.estrato || "No especificado"}</p>
                    </div>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <Button
                variant="light"
                onPress={() => setShowMore(!showMore)}
                className="text-primary"
              >
                {showMore ? "Mostrar menos" : "Mostrar más"}
              </Button>
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
  const [showMore, setShowMore] = useState(false);

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
                    {new Date(userData.created_date).toLocaleDateString()}
                  </p>
                </div>

                {showMore && (
                  <>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Segundo Nombre</strong>
                      <p>{userData.segundo_nombre || "No especificado"}</p>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Segundo Apellido</strong>
                      <p>{userData.segundo_apellido || "No especificado"}</p>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Nivel de Consultorio</strong>
                      <p>{userData.nivel_consultorio || "No especificado"}</p>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Fecha de Actualización</strong>
                      <p>
                        {new Date(
                          userData.modified_date || userData.created_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </ModalBody>
            <ModalFooter className="flex justify-between">
              <Button
                variant="light"
                onPress={() => setShowMore(!showMore)}
                className="text-primary"
              >
                {showMore ? "Mostrar menos" : "Mostrar más"}
              </Button>
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

interface ModalCalificationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseWithKey | null;
}


export function ModalCalificationDetails({
  isOpen,
  onClose,
  caseData,
}: ModalCalificationDetailsProps) {
  if (!caseData) return null;

  function formatCalification(
    value: string | number | undefined | null
  ): string {
    if (value === undefined || value === null || value === "") return "-";

    const numValue = Number(value);
    if (isNaN(numValue)) return String(value);

    // Si está en formato 0-50, convertir a 0-5
    if (numValue > 5) {
      return (numValue / 10).toFixed(1);
    } else {
      // Asegurar que siempre tenga un decimal (para mantener consistencia)
      return numValue.toFixed(1);
    }
  }

  // Obtener los valores de calificación del array de calificaciones
  const calificacion = caseData.calificaciones && caseData.calificaciones.length > 0
    ? caseData.calificaciones[0] : null;

  const promedio = calificacion?.promedio;
  const criterio1 = calificacion?.criterio_1;
  const criterio2 = calificacion?.criterio_2;
  const criterio3 = calificacion?.criterio_3;
  const criterio4 = calificacion?.criterio_4;

  function getCriterioLabel(index: number): string {
    switch (index) {
      case 1:
        return "Análisis del caso";
      case 2:
        return "Fundamentación jurídica";
      case 3:
        return "Redacción y argumentación";
      case 4:
        return "Cumplimiento de plazos";
      default:
        return `Criterio ${index}`;
    }
  }

  // Get the student assigned to the case
  const estudiante = caseData.usuarios?.find(
    (user) => user.rol === "Estudiante"
  );
  const nombreEstudiante = estudiante
    ? `${estudiante.primer_nombre} ${estudiante.primer_apellido}`
    : "Sin estudiante asignado";

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Calificación del caso #{caseData.id_caso}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
          
                <div className="bg-blue-50 p-4 rounded-lg mb-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Tipo de Proceso:</span>
                      <span>{caseData.tipo_caso?.nombre_tipo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Estudiante:</span>
                      <span>{nombreEstudiante}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-lg">
                        Calificación Final:
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {formatCalification(promedio)}
                      </span>
                    </div>
                  </div>
                </div>

            
                <div className="mt-2">
                  <h3 className="text-base font-semibold mb-3">
                    Detalle de criterios (25% cada uno)
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Criterio 1: {getCriterioLabel(1)}</strong>
                      <p className="font-medium">
                        {formatCalification(criterio1)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Criterio 2: {getCriterioLabel(2)}</strong>
                      <p className="font-medium">
                        {formatCalification(criterio2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Criterio 3: {getCriterioLabel(3)}</strong>
                      <p className="font-medium">
                        {formatCalification(criterio3)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-b pb-3">
                      <strong>Criterio 4: {getCriterioLabel(4)}</strong>
                      <p className="font-medium">
                        {formatCalification(criterio4)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
