import { Column, StatusOption } from "@/types/sharedTypes";

export const columns: Column[] = [
  { name: "ID", uid: "id" },
  { name: "Asignados", uid: "assignedUsers" },
  { name: "Fecha de creación", uid: "created_date" },
  { name: "Tipo de proceso", uid: "tipo_caso", sortable: true },
  { name: "Estado", uid: "estado_actual", sortable: true },
  { name: "Ciudadano", uid: "ciudadano" },
  { name: "Calificación", uid: "calificacion" },
  { name: "Tiempo de respuesta", uid: "tiempo_respuesta", sortable: true },
  { name: "Acciones", uid: "actions" },
];

export const statusOptions: StatusOption[] = [
  { name: "Seguimiento", uid: "Seguimiento" },
  { name: "Aprobado", uid: "Aprobado" },
  { name: "No aprobado", uid: "No aprobado" },
  { name: "Acción necesaria", uid: "Acción necesaria" },
  { name: "Viabilidad", uid: "Viabilidad" },
  { name: "Elaboración tutela", uid: "Elaboración tutela" },
  { name: "Valoración del asesor", uid: "Valoración del asesor" },
  { name: "Revisar tutela", uid: "Revisar tutela" },
  { name: "Radicar", uid: "Radicar" },
  { name: "Pendiente", uid: "Pendiente" },
  { name: "Espera del juez", uid: "Espera del juez" },
];


