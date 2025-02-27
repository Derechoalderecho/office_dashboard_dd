import { Column, userTypeOption, siteOption } from "@/types/reviewers";

export const columns: Column[] = [
  { name: "Nombre", uid: "name" },
  { name: "Tipo de usuario", uid: "user_type" },
  { name: "Áreas asignadas", uid: "assigned_areas" },
  { name: "Sede", uid: "site" },
  { name: "Consultas", uid: "queries_number" },
  { name: "Procesos", uid: "procceses_number" },
];

export const userTypeOptions: userTypeOption[] = [
  { name: "Asesor", uid: "asesor" },
  { name: "Monitor", uid: "monitor" },
  { name: "Profesor", uid: "professor" },
];

export const siteOptions: userTypeOption[] = [
  { name: "Cali", uid: "cali" },
  { name: "Ibagué", uid: "ibague" },
  { name: "Cali sede sur", uid: "cali_sur" },
];
