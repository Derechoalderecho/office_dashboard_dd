export interface Rol {
  id: number;
  nombre: string;
}

export interface AreaAtencion {
  id: number;
  nombre: string;
}

export interface Universidad {
  id: number;
  nombre: string;
}

export interface Users {
  id: number;
  id_usuario_firebase: string;
  tipo_documento: string;
  num_documento: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  email: string;
  rol: Rol;
  status: boolean;
  created_at: string; 
  modified_at: string | null;
  deleted_at: string | null;
  
  // Nuevos campos de la API
  areas_atencion: AreaAtencion[];
  universidades: Universidad[];

  actions?: string;
  key?: string;
}

export type UserWithKey = Users & { key: string };