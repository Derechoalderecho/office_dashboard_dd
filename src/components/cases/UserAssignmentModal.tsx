import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Autocomplete,
  AutocompleteItem,
  Chip,
  Spinner,
  addToast,
} from "@heroui/react";
import { Users } from "@/types/users";
import { API_BASE_URL } from "@/config/api";
import axios from "axios";
import { logger } from "@/utils/logUtils";
import { assignUserToCase, fetchUsersByCaseId } from "@/services/caseService";
import { fetchAllUsers } from "@/services/userService";

interface CaseUser {
  id_caso: number;
  id_usuario: number;
  rol: string;
}

interface UserAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCaseIds: number[];
  onAssignUsers: () => void;
}

// Roles disponibles para asignación
const ROLES = {
  STUDENT: "estudiante",
  TEACHER: "docente",
  MONITOR: "monitor",
};

export const UserAssignmentModal: React.FC<UserAssignmentModalProps> = ({
  isOpen,
  onClose,
  selectedCaseIds,
  onAssignUsers,
}) => {
  // Estado para la lista de usuarios cargados desde la API
  const [users, setUsers] = useState<Users[]>([]);
  // Estados para los usuarios seleccionados para cada rol
  const [selectedStudent, setSelectedStudent] = useState<Users | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Users | null>(null);
  const [selectedMonitor, setSelectedMonitor] = useState<Users | null>(null);
  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  // Estado para errores
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Función para cargar usuarios desde el servicio
  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allUsers = await fetchAllUsers();

      if (allUsers && allUsers.length > 0) {
        logger.debug("Usuarios cargados:", allUsers.length);
        setUsers(allUsers);
      } else {
        logger.error("No se encontraron usuarios");
        setError("No se encontraron usuarios disponibles");
      }
    } catch (err) {
      logger.error("Error al cargar usuarios:", err);
      setError(
        "No se pudieron cargar los usuarios. Por favor, intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar la asignación de usuarios a casos
  const handleAssignUsers = async () => {
    if (selectedCaseIds.length === 0) {
      addToast({
        title: "Error",
        description: "No hay casos seleccionados para asignar usuarios",
        color: "danger",
      });
      return;
    }

    // Verificar si al menos un usuario está seleccionado
    if (!selectedStudent && !selectedTeacher && !selectedMonitor) {
      addToast({
        title: "Selección requerida",
        description: "Debe seleccionar al menos un usuario para asignar",
        color: "warning",
      });
      return;
    }

    setIsAssigning(true);
    setError(null);

    try {
      // Crear un array con las asignaciones a realizar
      const assignmentResults = [];

      // Para cada caso seleccionado
      for (const caseId of selectedCaseIds) {
        // Obtener las asignaciones actuales para este caso
        const currentUsers = await fetchUsersByCaseId(caseId);

        // Procesar estudiante
        if (selectedStudent) {
          // Verificar si ya existe un estudiante asignado
          const existingStudent = currentUsers.find(
            (user) => user.rol === ROLES.STUDENT
          );

          if (existingStudent) {
            logger.debug(
              `Se reemplazará la asignación existente para estudiante en caso ${caseId}`
            );
          }

          // Asignar el nuevo estudiante
          const studentResult = await assignUserToCase(
            caseId,
            selectedStudent.id_usuario,
            ROLES.STUDENT
          );
          assignmentResults.push(studentResult);
        }

        // Procesar docente
        if (selectedTeacher) {
          // Verificar si ya existe un docente asignado
          const existingTeacher = currentUsers.find(
            (user) => user.rol === ROLES.TEACHER
          );

          if (existingTeacher) {
            logger.debug(
              `Se reemplazará la asignación existente para docente en caso ${caseId}`
            );
          }

          // Asignar el nuevo docente
          const teacherResult = await assignUserToCase(
            caseId,
            selectedTeacher.id_usuario,
            ROLES.TEACHER
          );
          assignmentResults.push(teacherResult);
        }

        // Procesar monitor
        if (selectedMonitor) {
          // Verificar si ya existe un monitor asignado
          const existingMonitor = currentUsers.find(
            (user) => user.rol === ROLES.MONITOR
          );

          if (existingMonitor) {
            logger.debug(
              `Se reemplazará la asignación existente para monitor en caso ${caseId}`
            );
          }

          // Asignar el nuevo monitor
          const monitorResult = await assignUserToCase(
            caseId,
            selectedMonitor.id_usuario,
            ROLES.MONITOR
          );
          assignmentResults.push(monitorResult);
        }
      }

      // Contar éxitos y fallos
      const successful = assignmentResults.filter(
        (result) => result === true
      ).length;
      const failed = assignmentResults.filter(
        (result) => result === false
      ).length;

      if (failed > 0) {
        addToast({
          title: "Asignación parcial",
          description: `Se completaron ${successful} asignaciones con ${failed} errores`,
          color: "warning",
        });
      } else {
        addToast({
          title: "Éxito",
          description: `Se asignaron usuarios a ${selectedCaseIds.length} casos`,
          color: "success",
        });
      }

      // Llamar al callback de asignación completada
      onAssignUsers();
      onClose();
    } catch (err) {
      logger.error("Error en la asignación de usuarios:", err);
      setError("Ocurrió un error durante la asignación de usuarios");
    } finally {
      setIsAssigning(false);
    }
  };

  // Filtrar usuarios por rol
  const getFilteredUsers = (role: string) => {
    return users.filter(
      (user) => user.rol.toLowerCase() === role.toLowerCase()
    );
  };

  // Obtener el nombre completo del usuario
  const getUserFullName = (user: Users): string => {
    return `${user.primer_nombre} ${user.primer_apellido}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      size="3xl"
      placement="center"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              <h2 className="text-xl font-semibold">
                Asignar usuarios a {selectedCaseIds.length} caso(s)
              </h2>
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner size="lg" color="primary" />
                  <p className="ml-4">Cargando usuarios...</p>
                </div>
              ) : error ? (
                <div className="bg-danger-50 p-4 rounded-lg text-danger">
                  <p>{error}</p>
                  <Button
                    color="primary"
                    variant="light"
                    className="mt-2"
                    onPress={loadUsers}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-sm font-medium mb-2">Estudiante</p>
                    <Autocomplete
                      label="Seleccionar estudiante"
                      placeholder="Buscar por nombre o email"
                      itemHeight={48}
                      selectedKey={selectedStudent?.id_usuario.toString()}
                      onSelectionChange={(key) => {
                        if (key) {
                          const user = users.find(
                            (u) => u.id_usuario.toString() === key.toString()
                          );
                          setSelectedStudent(user || null);
                        } else {
                          setSelectedStudent(null);
                        }
                      }}
                    >
                      {getFilteredUsers(ROLES.STUDENT).map((user) => (
                        <AutocompleteItem
                          key={user.id_usuario.toString()}
                          textValue={getUserFullName(user)}
                        >
                          <div className="flex gap-2 items-center">
                            <div className="flex flex-col">
                              <span className="text-small">
                                {" "}
                                {getUserFullName(user)}
                              </span>
                              <span className="text-tiny text-default-400">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                    {selectedStudent && (
                      <Chip
                        className="mt-2"
                        onClose={() => setSelectedStudent(null)}
                      >
                        {getUserFullName(selectedStudent)}
                      </Chip>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Docente</p>
                    <Autocomplete
                      label="Seleccionar docente"
                      placeholder="Buscar por nombre o email"
                      itemHeight={48}
                      className="w-full"
                      selectedKey={selectedTeacher?.id_usuario.toString()}
                      onSelectionChange={(key) => {
                        if (key) {
                          const user = users.find(
                            (u) => u.id_usuario.toString() === key.toString()
                          );
                          setSelectedTeacher(user || null);
                        } else {
                          setSelectedTeacher(null);
                        }
                      }}
                    >
                      {getFilteredUsers(ROLES.TEACHER).map((user) => (
                        <AutocompleteItem
                          key={user.id_usuario.toString()}
                          textValue={getUserFullName(user)}
                        >
                          <div className="flex flex-col">
                            <span>{getUserFullName(user)}</span>
                            <span className="text-sm text-gray-500">
                              {user.email}
                            </span>
                          </div>
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                    {selectedTeacher && (
                      <Chip
                        className="mt-2"
                        onClose={() => setSelectedTeacher(null)}
                      >
                        {getUserFullName(selectedTeacher)}
                      </Chip>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Monitor</p>
                    <Autocomplete
                      label="Seleccionar monitor"
                      placeholder="Buscar por nombre o email"
                      itemHeight={48}
                      className="w-full"
                      selectedKey={selectedMonitor?.id_usuario.toString()}
                      onSelectionChange={(key) => {
                        if (key) {
                          const user = users.find(
                            (u) => u.id_usuario.toString() === key.toString()
                          );
                          setSelectedMonitor(user || null);
                        } else {
                          setSelectedMonitor(null);
                        }
                      }}
                    >
                      {getFilteredUsers(ROLES.MONITOR).map((user) => (
                        <AutocompleteItem
                          key={user.id_usuario.toString()}
                          textValue={getUserFullName(user)}
                        >
                          <div className="flex flex-col">
                            <span>{getUserFullName(user)}</span>
                            <span className="text-sm text-gray-500">
                              {user.email}
                            </span>
                          </div>
                        </AutocompleteItem>
                      ))}
                    </Autocomplete>
                    {selectedMonitor && (
                      <Chip
                        className="mt-2"
                        onClose={() => setSelectedMonitor(null)}
                      >
                        {getUserFullName(selectedMonitor)}
                      </Chip>
                    )}
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                onPress={onClose}
                disabled={isAssigning}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleAssignUsers}
                isLoading={isAssigning}
                isDisabled={isLoading || !!error}
              >
                Asignar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
