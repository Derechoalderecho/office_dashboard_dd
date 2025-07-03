import { Users } from "./users";
import { DocumentResponse } from "./documents";

export interface Nota {
  id_caso: number;
  id_usuario: number;
  mensaje: string;
  id_nota_caso: number;
  created_date: string;
  modified_date: string | null;
  deleted_at: string | null;
  status: boolean;
  usuario?: Users;
  documentos?: DocumentResponse[];
}