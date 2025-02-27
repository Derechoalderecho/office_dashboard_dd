import { Column, StatusOption } from "@/types/reviewers";

export const columns: Column[] = [
  { name: "Nombre", uid: "name" },
  { name: "Tipo de usuario", uid: "user_type" },
  { name: "Áreas asignadas", uid: "assigned_areas" },
  { name: "Consultas", uid: "queries_number" },
  { name: "Procesos", uid: "procceses_number" },
];

export const statusOptions: StatusOption[] = [
  { name: "Seguimiento", uid: "follow_up" },
  { name: "Aprobado", uid: "aproved" },
  { name: "No Aprobado", uid: "not_approved" },
  { name: "Acción Necesaria", uid: "action_required" },
];