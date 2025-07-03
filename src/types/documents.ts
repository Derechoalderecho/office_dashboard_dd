export interface DocumentResponse {
  nombre_documento: string;
  ext_documento?: string;
  enlace: string;
  url_firmada?: string;
  id_documento: number;
  id_caso?: number;
  id_documento_caso?: number;
  id_nota?: number;
  fecha_asigna: string;
  fecha_crea?: string;
  tipo_documento?: 'Docx' | 'MD' | 'Tutela' | 'Radicado' | 'Otro';
  subido_por?: string;
  status?: string;
  created_date?: string;
  modified_date?: string;
  deleted_at?: string | null;
  fecha_subida?: string;
  contenido?: string;
  contenido_documento?: string;
  nombre?: string;
  extension?: string;
  tipo?: string;
}
