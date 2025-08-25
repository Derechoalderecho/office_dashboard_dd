
export interface Nacionalidad {
  id_nacionalidad: number;
  nombre: string;
}

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
  num_fijo: string;
  email: string;
  num_movil: string;
  nacionalidades_principales: Nacionalidad[];
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
  id: number;
  created_at: string;
  modified_at: string | null;
  deleted_at: string | null;
  status: boolean;
  departamento: string;
  municipio: string;
  nacionalidad?: string;
  key?: string;
  actions?: string;
}

export type CitizenWithKey = Citizen & { key: string };
