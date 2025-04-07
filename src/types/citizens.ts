export interface Citizen {
  id_caso: number;
  id_ciudadano: number;
  persona_modifica: number;
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
  direccion?: {
    barrio: string;
    numero_casa: string;
    calle: string;
    carrera: string;
  };
  actions?: string;
  key?: string;
}

export type CitizenWithKey = Citizen & { key: string };
