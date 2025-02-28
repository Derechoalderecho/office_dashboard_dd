import { Column, userTypeOption, siteOption } from "@/types/users";

export const columns: Column[] = [
  { name: "Identificación", uid: "id_document" },
  { name: "Nombre", uid: "name", sortable: true },
  { name: "Tipo de usuario", uid: "user_type", sortable: true },
  { name: "Rama de derecho", uid: "branch_law", sortable: true },
  { name: "Sede", uid: "site", sortable: true },
  { name: "Consultas activas", uid: "active_consults" },
  { name: "Procesos activos", uid: "active_processes" },
  { name: "Consultas calificación", uid: "consults_calification" },
  { name: "Procesos calificación", uid: "processes_calification" },
];

export const userTypeOptions: userTypeOption[] = [
  { name: "Estudiante", uid: "student" },
  { name: "Asesor", uid: "asesor" },
  { name: "Monitor", uid: "monitor" },
  { name: "Profesor", uid: "professor" },
];

export const siteOptions: siteOption[] = [
  { name: "Cali", uid: "cali" },
  { name: "Ibagué", uid: "ibague" },
  { name: "Cali sede sur", uid: "cali_sur" },
];
