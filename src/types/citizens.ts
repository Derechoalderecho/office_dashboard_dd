export interface Citizen {
  tipo_documento: string;
  num_documento: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  sexo: string;
  genero: string | null;
  orientacion_sexual: string;
  telefono_fijo: string;
  email: string;
  num_movil: string;
  nacionalidad: string;
  otra_nacionalidad: string;
  estado_civil: string;
  escolaridad: string;
  etnia: string;
  estrato: number;
  zona_residencia: string;
  dane_municipio: string;
  discapacidad: boolean;
  sabe_leer_escribir: boolean;
  direccion_residencia: string;
  fecha_nacimiento: string;
  id_ciudadano: number;
  created_date: string;
  modified_date: string | null;
  deleted_at: string | null;
  status: boolean;
  departamento: string;
  municipio: string;
  key?: string;
  actions?: string;
}

export type CitizenWithKey = Citizen & { key: string };
