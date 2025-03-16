import { Column, StatusOption } from "@/types/sharedTypes";

export const columns: Column[] = [
  { name: "Fecha de creación", uid: "fecha_crea" },
  { name: "Fecha de actualización", uid: "fecha_actualiza" },
  { name: "Tipo de proceso", uid: "tipo_proceso", sortable: true },
  { name: "Estado", uid: "estado", sortable: true },
  { name: "Ciudadano", uid: "ciudadano" },
  { name: "Asignados", uid: "usuarios_asignados" },
  { name: "Tiempo de respuesta", uid: "tiempo_respuesta", sortable: true },
  { name: "Acciones", uid: "actions" },
];

export const statusOptions: StatusOption[] = [
  { name: "Seguimiento", uid: "Seguimiento" },
  { name: "Aprobado", uid: "Aprobado" },
  { name: "No aprobado", uid: "No aprobado" },
  { name: "Acción necesaria", uid: "Acción necesaria" },
];


