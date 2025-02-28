import { siteOption, userTypeOption, Column } from "@/types/sharedTypes";

export const columns: Column[] = [
  { name: "Nombre", uid: "name" },
  { name: "Tipo de usuario", uid: "user_type", sortable: true },
  { name: "Áreas asignadas", uid: "assigned_areas", sortable: true },
  { name: "Sede", uid: "site", sortable: true },
  { name: "Consultas", uid: "queries_number"},
  { name: "Procesos", uid: "procceses_number" },
];

export const userTypeOptions: userTypeOption[] = [
  { name: "Asesor", uid: "asesor" },
  { name: "Monitor", uid: "monitor" },
  { name: "Profesor", uid: "professor" },
];

export const siteOptions: siteOption[] = [
  { name: "Cali", uid: "cali" },
  { name: "Ibagué", uid: "ibague" },
  { name: "Cali sede sur", uid: "cali_sur" },
];
