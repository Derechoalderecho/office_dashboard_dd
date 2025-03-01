export interface Citizen {
  id_ciudadano: number;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  tipo_documento: string;
  num_documento: string;
  email: string;
  num_fijo: string;
  num_movil: string;
  dane_municipio: string;
  fecha_crea: string;
  fecha_actualiza: string;
  persona_modifica: number;
  actions?: string;
  key?: string;
}

export type CitizenWithKey = Citizen & { key: string };
