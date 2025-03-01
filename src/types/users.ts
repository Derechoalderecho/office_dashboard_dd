export interface Users {
  id_usuario: number;
  id_usuario_firebase: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string;
  email: string;
  rol: string;
  tipo_documento: string;
  num_documento: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  actions?: string;
  key?: string;
}

export type UserWithKey = Users & { key: string };
