import { Citizen } from "./citizens";
export interface Cases {
  id_caso: number;
  id_ciudadano: number;
  persona_modifica: number;
  tipo_proceso: string;
  estado: string;
  tiempo_respuesta: number;
  notas: string;
  fecha_crea: string;
  fecha_actualiza: string;
  fecha_elimina: string;
  eliminado: boolean;
  ciudadano: Citizen;
  actions?: string;
  key?: string;
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

export type CaseWithKey = Cases & { key: string };
