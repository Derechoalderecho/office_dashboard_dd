export interface Users {
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
  actions?: string;
  key?: string;
}

export type UserWithKey = Users & { key: string };
