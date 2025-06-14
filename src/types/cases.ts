import { Citizen } from "./citizens";
import { Users } from "./users";
import { DocumentResponse } from "@/actions/uploadDocsActions";

export interface ApiDocumento {
  id_caso: number;
  nombre_documento: string;
  url_archivo: string;
  tipo_documento: string;
  subido_por: number;
  status: boolean;
  id_documento_caso: number;
  created_date: string;
  modified_date: string | null;
  deleted_at: string | null;
  fecha_subida: string | null;
}

export interface ApiDocumentoGenerado {
  id_caso: number;
  titulo: string;
  contenido: string;
  id_estudiante: number;
  tipo_documento: string;
  status: boolean;
  id_documento_generado: number;
  created_date: string;
  modified_date: string | null;
  deleted_at: string | null;
  fecha_creacion: string | null;
}

export interface ApiNota {
  id_caso: number;
  id_usuario: number;
  mensaje: string;
  id_nota_caso: number;
  created_date: string;
  modified_date: string | null;
  deleted_at: string | null;
  status: boolean;
}

export interface ApiCiudadano {
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
  id_ciudadano: number;
  created_date: string;
  modified_date: string | null;
  deleted_at: string | null;
  status: boolean;
}

export interface ApiUsuario {
  id_usuario_firebase: string;
  tipo_documento: string;
  num_documento: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  email: string;
  nivel_consultorio: string;
  rol: string;
  activo: boolean;
  source: string;
  status: boolean;
  id_usuario: number;
  created_date: string;
  modified_date: string | null;
  deleted_at: string | null;
}

export interface ApiDatosTutela {
  id_caso: number;
  hechos: string;
  pretensiones: string;
  fundamentos_derecho: string;
  id_datos_tutela: number;
  created_date: string;
  modified_date: string | null;
  deleted_at: string | null;
  status: boolean;
}

export interface CompleteCaseData {
  id_ciudadano: number;
  id_tipo_caso: number;
  estado_actual: string;
  id_caso: number;
  created_date: string;
  modified_date: string | null;
  deleted_at: string | null;
  status: boolean;
  ciudadano: ApiCiudadano;
  documentos: ApiDocumento[];
  documentos_generados: ApiDocumentoGenerado[];
  notas: ApiNota[];
  usuarios: ApiUsuario[];
  historial_estados: any[]; // Podríamos crear un tipo específico si se proporciona estructura
  datos_tutela?: ApiDatosTutela;
}

// Lo viejo
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
