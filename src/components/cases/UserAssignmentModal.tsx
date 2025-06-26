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
} from "@heroui/react";
import { Users } from "@/types/users";
import { logger } from "@/utils/logUtils";
import { fetchAllUsers } from "@/services/userService";
import { deleteUserCaseAssignment, assignUserToCase, fetchCaseUsers } from "@/services/completeUserCasesService";

interface CaseUser {
  id_caso: number;
  id_usuario: number;
  rol: string;
}

interface UserAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCaseIds: number[];
  onAssignUsers: (assignments: {caseId: number, userId: number, role: string}[]) => void;
}

// Roles disponibles para asignación
const ROLES = {
  STUDENT: "Estudiante",
  TEACHER: "Docente",
  MONITOR: "Monitor",
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
  // Estado para errores
  const [error, setError] = useState<string | null>(null);

  // Cargar usuarios al abrir el modal
  useEffect(() => {
    if (isOpen) {
      console.log("IDs de casos seleccionados:", selectedCaseIds);
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

  // Función para preparar las asignaciones y enviarlas al componente padre
  const handleSubmit = async () => {
    // Verificar si al menos un usuario está seleccionado
    if (!selectedStudent && !selectedTeacher && !selectedMonitor) {
      return;
    }

    try {
      setIsLoading(true);
      const assignments: {caseId: number, userId: number, role: string}[] = [];
      const assignmentResults: boolean[] = [];

      // Para cada caso seleccionado
      for (const caseId of selectedCaseIds) {
        // Obtener los usuarios actuales asignados a este caso
        const currentUsers = await fetchCaseUsers(caseId);
        console.log(`Usuarios actuales del caso ${caseId}:`, currentUsers);
        
        // Gestionar estudiante
        if (selectedStudent) {
          // Buscar si ya existe un estudiante asignado
          const existingStudent = currentUsers.find(
            user => user.rol?.toLowerCase() === ROLES.STUDENT.toLowerCase()
          );
          
          if (existingStudent) {
            // Eliminar el estudiante existente
            console.log(`Eliminando estudiante existente ${existingStudent.id_usuario} del caso ${caseId}`);
            await deleteUserCaseAssignment(caseId, existingStudent.id_usuario);
          }
          
          // Asignar nuevo estudiante
          console.log(`Asignando estudiante ${selectedStudent.id_usuario} al caso ${caseId}`);
          const result = await assignUserToCase(
            caseId,
            selectedStudent.id_usuario,
            ROLES.STUDENT
          );
          assignmentResults.push(result);
          
          assignments.push({
            caseId,
            userId: selectedStudent.id_usuario,
            role: ROLES.STUDENT
          });
        }

        // Gestionar docente
        if (selectedTeacher) {
          // Buscar si ya existe un docente asignado
          const existingTeacher = currentUsers.find(
            user => user.rol?.toLowerCase() === ROLES.TEACHER.toLowerCase()
          );
          
          if (existingTeacher) {
            // Eliminar el docente existente
            console.log(`Eliminando docente existente ${existingTeacher.id_usuario} del caso ${caseId}`);
            await deleteUserCaseAssignment(caseId, existingTeacher.id_usuario);
          }
          
          // Asignar nuevo docente
          console.log(`Asignando docente ${selectedTeacher.id_usuario} al caso ${caseId}`);
          const result = await assignUserToCase(
            caseId,
            selectedTeacher.id_usuario,
            ROLES.TEACHER
          );
          assignmentResults.push(result);
          
          assignments.push({
            caseId,
            userId: selectedTeacher.id_usuario,
            role: ROLES.TEACHER
          });
        }

        // Gestionar monitor
        if (selectedMonitor) {
          // Buscar si ya existe un monitor asignado
          const existingMonitor = currentUsers.find(
            user => user.rol?.toLowerCase() === ROLES.MONITOR.toLowerCase()
          );
          
          if (existingMonitor) {
            // Eliminar el monitor existente
            console.log(`Eliminando monitor existente ${existingMonitor.id_usuario} del caso ${caseId}`);
            await deleteUserCaseAssignment(caseId, existingMonitor.id_usuario);
          }
          
          // Asignar nuevo monitor
          console.log(`Asignando monitor ${selectedMonitor.id_usuario} al caso ${caseId}`);
          const result = await assignUserToCase(
            caseId,
            selectedMonitor.id_usuario,
            ROLES.MONITOR
          );
          assignmentResults.push(result);
          
          assignments.push({
            caseId,
            userId: selectedMonitor.id_usuario,
            role: ROLES.MONITOR
          });
        }
      }

      // Verificar si todas las asignaciones fueron exitosas
      const allSuccessful = assignmentResults.every(result => result === true);
      
      if (!allSuccessful) {
        logger.warn("Algunas asignaciones no pudieron completarse");
        setError("Algunas asignaciones no pudieron completarse");
      }

      // Enviar las asignaciones al componente padre
      onAssignUsers(assignments);
      onClose();
    } catch (error) {
      logger.error("Error durante el proceso de asignación:", error);
      setError("Ocurrió un error durante el proceso de asignación");
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar usuarios por rol
  const getFilteredUsers = (role: string) => {
    return users.filter(user => 
      user.rol && user.rol.toLowerCase() === role.toLowerCase()
    );
  };

  // Obtener el nombre completo del usuario
  const getUserFullName = (user: Users): string => {
    return `${user.primer_nombre || ''} ${user.primer_apellido || ''}`.trim();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Asignar usuarios a casos
            </ModalHeader>
            <ModalBody>
              {error ? (
                <div className="text-danger">{error}</div>
              ) : isLoading ? (
                <div className="flex justify-center">
                  <Spinner size="lg" />
                  <p className="ml-2">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Seleccione los usuarios para asignar a{" "}
                      <strong>{selectedCaseIds.length}</strong> caso(s)
                      seleccionado(s).
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Estudiante</p>
                    <Autocomplete
                      label="Seleccionar estudiante"
                      placeholder="Buscar por nombre o email"
                      itemHeight={48}
                      className="w-full"
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
                          <div className="flex flex-col">
                            <span>{getUserFullName(user)}</span>
                            <span className="text-sm text-gray-500">
                              {user.email}
                            </span>
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
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isDisabled={isLoading || !!error || (!selectedStudent && !selectedTeacher && !selectedMonitor)}
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
