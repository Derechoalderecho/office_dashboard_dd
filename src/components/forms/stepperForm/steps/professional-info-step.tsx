"use client";

import { Select, SelectItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { Users } from "@/types/users";
import { fetchAllUsers } from "@/services/userService";

type ProfessionalInfoProps = {
  formData: {
    rol: string;
    profesor_id?: string;
    monitor_id?: string;
    alumno_id?: string;
  };
  updateFormData: (
    data: Partial<{
      rol: string;
      profesor_id?: string;
      monitor_id?: string;
      alumno_id?: string;
    }>
  ) => void;
};

export default function ProfessionalInfoStep({
  formData,
  updateFormData,
}: ProfessionalInfoProps) {
  const [users, setUsers] = useState<Users[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const allUsers = await fetchAllUsers();
      setUsers(allUsers);
    };
    loadUsers();
  }, []);

  const profesores = users.filter((user) => user.rol === "Docente");
  const monitores = users.filter((user) => user.rol === "Monitor");
  const alumnos = users.filter((user) => user.rol === "Estudiante");

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="profesor_id"
          name="profesor_id"
          variant="bordered"
          label="Profesor"
          labelPlacement="outside"
          placeholder="Seleccione el profesor"
          value={formData.profesor_id}
          onChange={(e) => updateFormData({ profesor_id: e.target.value })}
        >
          {profesores.map((profesor) => (
            <SelectItem key={profesor.id_usuario} value={profesor.id_usuario}>
              {`${profesor.primer_nombre} ${profesor.primer_apellido}`}
            </SelectItem>
          ))}
        </Select>

        <Select
          id="monitor_id"
          name="monitor_id"
          variant="bordered"
          label="Monitor"
          labelPlacement="outside"
          placeholder="Seleccione el monitor"
          value={formData.monitor_id}
          onChange={(e) => updateFormData({ monitor_id: e.target.value })}
        >
          {monitores.map((monitor) => (
            <SelectItem key={monitor.id_usuario} value={monitor.id_usuario}>
              {`${monitor.primer_nombre} ${monitor.primer_apellido}`}
            </SelectItem>
          ))}
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Select
          id="alumno_id"
          name="alumno_id"
          variant="bordered"
          label="Alumno"
          labelPlacement="outside"
          placeholder="Seleccione el alumno"
          value={formData.alumno_id}
          onChange={(e) => updateFormData({ alumno_id: e.target.value })}
          className="w-full"
        >
          {alumnos.map((alumno) => (
            <SelectItem key={alumno.id_usuario} value={alumno.id_usuario}>
              {`${alumno.primer_nombre} ${alumno.primer_apellido}`}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  );
}
