import { UserRole } from '@/store/slices/authSlice';

/**
 * Transforma el texto del estado según el rol del usuario
 * @param estado Estado original del caso
 * @param role Rol del usuario
 * @returns Estado transformado según el rol
 */
export function transformStateByRole(estado: string, role: UserRole): string {
  // Si no hay rol, devolvemos el estado original
  if (!role) return estado;

  // Transformaciones específicas según el estado y rol
  switch (estado) {
    case "Pendiente":
      if (role === "Estudiante") return "Elaboración tutela";
      if (role === "Docente" || role === "Monitor") return "Pendiente";
      break;
      
    case "Revisar tutela":
      if (role === "Estudiante") return "En revisión";
      if (role === "Docente" || role === "Monitor") return "Revisar tutela";
      break;
      
    case "Radicar":
      // Para estudiantes mostrar un texto más descriptivo
      if (role === "Estudiante") return "Pendiente de radicación";
      // Docentes y monitores ven el nombre técnico
      return "Radicar";
      
    case "Espera del juez":
      // Todos los roles ven el mismo estado
      return "Espera del juez";
      
    case "Valoración del asesor":
      if (role === "Estudiante") return "En valoración";
      if (role === "Docente" || role === "Monitor") return "Valoración del asesor";
      break;
  }

  // Si no hay transformación específica, devolvemos el estado original
  return estado;
} 