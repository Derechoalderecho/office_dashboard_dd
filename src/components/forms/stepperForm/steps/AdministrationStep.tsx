"use client";

import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { Users } from "@/types/users";
import { fetchAllUsers } from "@/services/userService";
import { useAuth } from "@/hooks/useAuth";

type AdministrationProps = {
  formData: {
    profesor_id?: string;
    monitor_id?: string;
    alumno_id?: string;
    persona_modifica: string;
  };
  updateFormData: (
    data: Partial<{
      profesor_id?: string;
      monitor_id?: string;
      alumno_id?: string;
      persona_modifica: string;
    }>
  ) => void;
  validationErrors?: { [key: string]: string };
};

export default function AdministrationStep({
  formData, 
  updateFormData,
  validationErrors = {},
}: AdministrationProps) {
  const [users, setUsers] = useState<Users[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { role } = useAuth();
  const { internalUserId } = useAuth();
  const isStudent = role === "Estudiante";

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const allUsers = await fetchAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Automatically set the current user as the student if they are a student
  // and clear profesor_id if student is logged in
  useEffect(() => {
    if (isStudent && internalUserId) {
      const studentId = String(internalUserId);
      
      // Only update if the student ID is different from the current one
      // or if profesor_id is set (we want to clear it for students)
      if (formData.alumno_id !== studentId || formData.profesor_id) {
        console.log(`Estudiante autenticado detectado (ID: ${studentId}). Seleccionando automáticamente y dejando profesor pendiente.`);
        
        updateFormData({
          alumno_id: studentId,
          // Clear profesor_id for students - will be handled by teachers later
          profesor_id: undefined,
          // If the persona_modifica is not set, set it to the student ID
          persona_modifica: !formData.persona_modifica ? studentId : formData.persona_modifica
        });
      }
    }
  }, [isStudent, internalUserId, formData.alumno_id, formData.profesor_id]);

  const handleUserSelect = (role: string, userId: string) => {
    updateFormData({
      [`${role}_id`]: userId,
      // If the persona_modifica is not set, set it to the student ID
      persona_modifica: !formData.persona_modifica ? userId : formData.persona_modifica
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          id="profesor_id"
          name="profesor_id"
          variant="bordered"
          label="Docente asignado"
          labelPlacement="outside"
          placeholder={isStudent ? "Pendiente de asignación" : "Seleccione un docente"}
          selectedKeys={formData.profesor_id ? [formData.profesor_id] : isStudent ? ["pendiente"] : []}
          onSelectionChange={(keys) => {
            if (!isStudent) {
              const selectedKey = Array.from(keys)[0]?.toString() || "";
              handleUserSelect("profesor", selectedKey);
            }
          }}
          isLoading={isLoading}
          errorMessage={validationErrors?.profesor_id}
          isRequired
          isDisabled={isStudent}
        >
          {isStudent ? (
            <SelectItem key="pendiente">Pendiente de asignación</SelectItem>
          ) : (
            users
              .filter(user => user.rol === "Docente")
              .map((profesor) => (
                <SelectItem key={profesor.id_usuario.toString()}>
                  {`${profesor.primer_nombre} ${profesor.primer_apellido}`}
                </SelectItem>
              ))
          )}
        </Select>

        <Select
          id="monitor_id"
          name="monitor_id"
          variant="bordered"
          label="Monitor asignado"
          labelPlacement="outside"
          placeholder="Seleccione un monitor"
          selectedKeys={formData.monitor_id ? [formData.monitor_id] : []}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0]?.toString() || "";
            handleUserSelect("monitor", selectedKey);
          }}
          isLoading={isLoading}
          errorMessage={validationErrors?.monitor_id}
        >
          {users
            .filter(user => user.rol === "Monitor")
            .map((monitor) => (
              <SelectItem key={monitor.id_usuario.toString()}>
                {`${monitor.primer_nombre} ${monitor.primer_apellido}`}
              </SelectItem>
            ))}
        </Select>
        
        <Select
          id="alumno_id"
          name="alumno_id"
          variant="bordered"
          label="Estudiante asignado"
          labelPlacement="outside"
          placeholder={isStudent ? "Usted está asignado automáticamente" : "Seleccione un estudiante"}
          selectedKeys={formData.alumno_id ? [formData.alumno_id] : []}
          onSelectionChange={(keys) => {
            if (!isStudent) {
              const selectedKey = Array.from(keys)[0]?.toString() || "";
              handleUserSelect("alumno", selectedKey);
            }
          }}
          isLoading={isLoading}
          errorMessage={validationErrors?.alumno_id}
          isRequired
          isDisabled={isStudent}
        >
          {users
            .filter(user => user.rol === "Estudiante")
            .map((alumno) => (
              <SelectItem key={alumno.id_usuario.toString()}>
                {`${alumno.primer_nombre} ${alumno.primer_apellido}`}
              </SelectItem>
            ))}
        </Select>
      </div>
      
      {isStudent && (
        <div className="text-sm text-blue-600 mt-2">
          <p>Como estudiante, usted está asignado automáticamente a este caso.</p>
          <p>El docente será asignado posteriormente por el coordinador del consultorio jurídico.</p>
        </div>
      )}
    </div>
  );
}
