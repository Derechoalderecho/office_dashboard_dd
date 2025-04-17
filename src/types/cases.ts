import { Citizen } from "./citizens";
import { Users } from "./users";
import { DocumentResponse } from "@/actions/uploadDocsActions";

export interface CaseHistoryLog {
  id_caso: number;
  estado_anterior: string;
  estado_nuevo: string;
  id_historial: number;
  fecha_cambio: string;
}

export interface Nota {
  id_nota: number;
  id_caso: number;
  id_usuario: number;
  id_usuario_crea?: number;
  mensaje: string;
  fecha_crea: string;
  fecha_actualiza: string;
  usuario?: Users;
}

export interface Cases {
  id_caso: number;
  id_ciudadano: number;
  persona_modifica: string;
  tipo_proceso: string;
  estado: string;
  tiempo_respuesta: number;
  notas: string;
  fecha_crea: string;
  fecha_actualiza: string;
  fecha_elimina: string;
  eliminado: boolean;
  ciudadano: Citizen;
  usuarios: Users[];
  actions?: string;
  key?: string;
  notas_list?: Nota[];
  documentos?: DocumentResponse[];
  pretensiones?: string;
  concepto_estudiante?: string;
  hechos?: string;
  tramite?: string;
  antecedentes?: string;
  tutela?: string;
  calificacion?: string;
  calificacion1?: string;
  calificacion2?: string;
  calificacion3?: string;
  calificacion4?: string;
  ganado?: boolean;
  entidad?: string;
  fundamentos?: string;
  estudiante_asignado?: string;
}

export type Column = {
  name: string;
  uid: string;
  sortable?: boolean;
};

export type StatusOption = {
  name: string;
  uid: string;
};

export type userTypeOption = {
  name: string;
  uid: string;
};

export type RangeValue<T> = { start: T; end: T };

export type DateRange = {
  start: { year: number; month: number; day: number };
  end: { year: number; month: number; day: number };
};

export type CaseWithKey = Cases & {
  key: string;
  assignedUsers?: Users[];
  usuarios?: Users[];
};
