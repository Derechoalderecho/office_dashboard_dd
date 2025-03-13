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
};

export default function AdministrationStep({
  formData, 
  updateFormData,
}: AdministrationProps) {
  const [users, setUsers] = useState<Users[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const allUsers = await fetchAllUsers();
      setUsers(allUsers);
    };
    loadUsers();
  }, []);

  const allUsers = users; // All users for persona_modifica selection

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Usuario encargado del caso</h3>
          <p className="text-sm text-gray-500 mb-4">
            Seleccione el usuario que será responsable de este caso. Este usuario será asignado como la persona que modifica el caso.
          </p>
          <Select
            id="persona_modifica"
            name="persona_modifica"
            variant="bordered"
            label="Usuario encargado"
            labelPlacement="outside"
            placeholder="Seleccione el usuario encargado"
            value={formData.persona_modifica}
            onChange={(e) => updateFormData({ persona_modifica: e.target.value })}
            className="w-full"
            isRequired
          >
            {allUsers.map((user) => (
              <SelectItem key={user.id_usuario.toString()}>
                {`${user.primer_nombre} ${user.primer_apellido} - ${user.rol}`}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Información adicional (solo para referencia)</h3>
          <p className="text-sm text-gray-500 mb-4">
            Esta información se guarda solo para referencia y no se realiza ninguna asignación automática en el sistema.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              id="profesor_id"
              name="profesor_id"
              variant="bordered"
              label="Profesor de referencia"
              labelPlacement="outside"
              placeholder="Seleccione un profesor"
              value={formData.profesor_id}
              onChange={(e) => updateFormData({ profesor_id: e.target.value })}
              isRequired
            >
              {users.filter(user => user.rol === "Docente").map((profesor) => (
                <SelectItem key={profesor.id_usuario.toString()}>
                  {`${profesor.primer_nombre} ${profesor.primer_apellido}`}
                </SelectItem>
              ))}
            </Select>

            <Select
              id="monitor_id"
              name="monitor_id"
              variant="bordered"
              label="Monitor de referencia"
              labelPlacement="outside"
              placeholder="Seleccione un monitor"
              value={formData.monitor_id}
              onChange={(e) => updateFormData({ monitor_id: e.target.value })}
              isRequired
            >
              {users.filter(user => user.rol === "Monitor").map((monitor) => (
                <SelectItem key={monitor.id_usuario.toString()}>
                  {`${monitor.primer_nombre} ${monitor.primer_apellido}`}
                </SelectItem>
              ))}
            </Select>
            
            <Select
              id="alumno_id"
              name="alumno_id"
              variant="bordered"
              label="Alumno de referencia"
              labelPlacement="outside"
              placeholder="Seleccione un alumno"
              value={formData.alumno_id}
              onChange={(e) => updateFormData({ alumno_id: e.target.value })}
              isRequired
            >
              {users.filter(user => user.rol === "Estudiante").map((alumno) => (
                <SelectItem key={alumno.id_usuario.toString()}>
                  {`${alumno.primer_nombre} ${alumno.primer_apellido}`}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
