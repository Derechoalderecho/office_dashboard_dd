import { UserRole } from '@/store/slices/authSlice';

/**
 * Transforms the state text according to the user's role
 * @param estado
 * @param role
 * @returns
 */
export function transformStateByRole(estado: string, role: UserRole): string {
  // If there is no role, return the original state
  if (!role) return estado;

  // Specific transformations according to the state and role
  switch (estado) {
    case "Viabilidad":
      if (role === "Estudiante") return "Revisión de viabilidad";
      if (role === "Docente" || role === "Monitor") return "Viabilidad";
      break;

    case "Pendiente":
      if (role === "Estudiante") return "Elaboración tutela";
      if (role === "Docente" || role === "Monitor") return "Pendiente";
      break;
      
    case "Revisar tutela":
      if (role === "Estudiante") return "En revisión";
      if (role === "Docente" || role === "Monitor") return "Revisar tutela";
      break;
      
    case "Radicar":
      // For students, show a more descriptive text
      if (role === "Estudiante") return "Pendiente de radicación";
      // Docentes and monitors see the technical name
      return "Radicar";
      
    case "Espera del juez":
      // All roles see the same state
      return "Espera del juez";
      
    case "Valoración del asesor":
      if (role === "Estudiante") return "En valoración";
      if (role === "Docente" || role === "Monitor") return "Valoración del asesor";
      break;

    case "No aprobado":
      // All roles see the same state
      return "No aprobado";
      break;
  }

  // If there is no specific transformation, return the original state
  return estado;
} 