import { Column, userTypeOption, siteOption } from "@/types/sharedTypes";

export const columns: Column[] = [
  { name: "Identificación", uid: "num_documento" },
  { name: "Nombre", uid: "primer_nombre" },
  { name: "Rol", uid: "rol", sortable: true },
  { name: "Email", uid: "email" },
  { name: "Acciones", uid: "actions" },
];

export const userTypeOptions: userTypeOption[] = [
  { name: "Estudiante", uid: "student" },
  { name: "Director", uid: "director" },
  { name: "Monitor", uid: "monitor" },
  { name: "Docente", uid: "professor" },
];

export const siteOptions: siteOption[] = [
  { name: "Cali", uid: "cali" },
  { name: "Ibagué", uid: "ibague" },
  { name: "Cali sede sur", uid: "cali_sur" },
];
