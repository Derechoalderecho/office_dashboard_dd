import { Column, StatusOption } from "@/types/sharedTypes";

export const columns: Column[] = [
  { name: "Fecha de creación", uid: "fecha_crea" },
  { name: "Fecha de actualización", uid: "fecha_actualiza" },
  { name: "Tipo de proceso", uid: "tipo_proceso", sortable: true },
  { name: "Estado", uid: "estado", sortable: true },
  { name: "Ciudadano", uid: "ciudadano" },
  { name: "Tiempo de respuesta", uid: "tiempo_respuesta", sortable: true },
  { name: "Acciones", uid: "actions" },
];

export const statusOptions: StatusOption[] = [
  { name: "Seguimiento", uid: "follow_up" },
  { name: "Aprobado", uid: "aproved" },
  { name: "No Aprobado", uid: "not_approved" },
  { name: "Acción Necesaria", uid: "action_required" },
];


