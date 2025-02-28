import { Column, siteOption } from "@/types/sharedTypes";

export const columns: Column[] = [
  { name: "Creado en", uid: "created_at" },
  { name: "Nombre", uid: "first_name" },
  { name: "Email", uid: "email" },
  { name: "Teléfono", uid: "mobile_phone" },
  { name: "Sede", uid: "site", sortable: true },
  { name: "Acciones", uid: "actions" },
];

export const siteOptions: siteOption[] = [
    { name: "Cali", uid: "cali" },
    { name: "Ibagué", uid: "ibague" },
    { name: "Cali sede sur", uid: "cali_sur" },
  ];
