import { Column, StatusOption } from "@/types/sharedTypes";

export const columns: Column[] = [
  { name: "Creado en", uid: "created" },
  { name: "Actualizado en", uid: "update" },
  { name: "Tipo de proceso", uid: "proccess_type", sortable: true },
  { name: "Estado", uid: "status", sortable: true },
  { name: "Cliente", uid: "name" },
  { name: "Tiempo Respuesta", uid: "response_time", sortable: true },
  { name: "Asignado", uid: "assigned", sortable: true },
  { name: "Acciones", uid: "actions" },
];

export const statusOptions: StatusOption[] = [
  { name: "Seguimiento", uid: "follow_up" },
  { name: "Aprobado", uid: "aproved" },
  { name: "No Aprobado", uid: "not_approved" },
  { name: "Acción Necesaria", uid: "action_required" },
];


