"use client";

import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { Users } from "@/types/users";
import { fetchAllUsers } from "@/services/userService";

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

  const handleUserSelect = (role: string, userId: string) => {
    updateFormData({
      [`${role}_id`]: userId,
      // Si es el primer usuario seleccionado, lo establecemos como persona_modifica
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
          placeholder="Seleccione un docente"
          selectedKeys={formData.profesor_id ? [formData.profesor_id] : []}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0]?.toString() || "";
            handleUserSelect("profesor", selectedKey);
          }}
          isLoading={isLoading}
          errorMessage={validationErrors?.profesor_id}
          isRequired
        >
          {users
            .filter(user => user.rol === "Docente")
            .map((profesor) => (
              <SelectItem key={profesor.id_usuario.toString()}>
                {`${profesor.primer_nombre} ${profesor.primer_apellido}`}
              </SelectItem>
            ))}
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
          placeholder="Seleccione un estudiante"
          selectedKeys={formData.alumno_id ? [formData.alumno_id] : []}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0]?.toString() || "";
            handleUserSelect("alumno", selectedKey);
          }}
          isLoading={isLoading}
          errorMessage={validationErrors?.alumno_id}
          isRequired
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
    </div>
  );
}
