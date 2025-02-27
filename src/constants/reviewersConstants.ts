import { Column, StatusOption } from "@/types/reviewers";

export const columns: Column[] = [
  { name: "Nombre", uid: "name" },
  { name: "Tipo de usuario", uid: "user_type" },
  { name: "Áreas asignadas", uid: "assigned_areas" },
  { name: "Sede", uid: "site" },
  { name: "Consultas", uid: "queries_number" },
  { name: "Procesos", uid: "procceses_number" },
];

export const statusOptions: StatusOption[] = [
  { name: "Asesor", uid: "asesor" },
  { name: "Monitor", uid: "monitor" },
  { name: "Profesor", uid: "professor" },
];