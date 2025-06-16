import { Column, siteOption } from "@/types/sharedTypes";

export const columns: Column[] = [
  { name: "Creado en", uid: "created_date" },
  { name: "Nombre", uid: "primer_nombre" },
  { name: "Email", uid: "email" },
  { name: "Teléfono", uid: "num_movil" },
  { name: "Acciones", uid: "actions" },
];

export const siteOptions: siteOption[] = [
    { name: "Cali", uid: "cali" },
    { name: "Ibagué", uid: "ibague" },
    { name: "Cali sede sur", uid: "cali_sur" },
  ];
