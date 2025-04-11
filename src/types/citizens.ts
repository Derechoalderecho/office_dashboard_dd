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
  sexo: string;
  genero: string;
  orient_sexual: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  estado_civil: string;
  escolaridad: string;
  etnia: string;
  discapacidad: string;
  sabe_leer_escribir: string;
  estrato: string;
  zona: string;
  departamento: string;
  municipio: string;
  fecha_crea: string;
  fecha_actualiza: string;
  direccion: string;
  actions?: string;
  key?: string;
}

export type CitizenWithKey = Citizen & { key: string };
