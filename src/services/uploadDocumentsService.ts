//Servicio para subir documentos de solo anexos al caso

"use server";

import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export type DocumentResponse = {
  nombre_documento: string;
  ext_documento: string;
  enlace: string;
  url_firmada?: string;
  id_documento: number; // Agregado como obligatorio para compatibilidad
  id_caso?: number;
  id_documento_caso?: number;
  fecha_asigna: string;
  tipo_documento?: 'Docx' | 'MD' | 'Tutela' | 'Radicado' | 'Otro';
  subido_por?: string;
  status?: string;
  created_date?: string;
  modified_date?: string;
  deleted_at?: string | null;
  fecha_subida?: string;
};

export type UploadDocumentResult = {
  success: boolean;
  data?: DocumentResponse;
  error?: string;
};

/**
 * Determina el tipo de documento basado en la extensión del archivo
 * @param fileName Nombre del archivo con extensión
 * @returns Tipo de documento según las reglas establecidas
 */
const determineDocumentType = (fileName: string): 'Docx' | 'Otro' => {
  const extension = fileName.toLowerCase().split('.').pop();
  
  if (extension === 'docx' || extension === 'doc') {
    return 'Docx';
  }
  
  return 'Otro';
};

/**
 * Sube un documento al caso especificado
 * @param file Archivo a subir
 * @param caseId ID del caso
 * @param userId ID del usuario que sube el documento
 * @returns Resultado de la operación
 */
export async function uploadDocument(
  file: File,
  caseId: number,
  userId: string
): Promise<UploadDocumentResult> {
  try {
    console.log(`Subiendo documento ${file.name} al caso ${caseId} por el usuario ${userId}`);
    
    // Crear FormData para el archivo
    const formData = new FormData();
    formData.append('file', file);
    
    // Determinar el tipo de documento basado en la extensión
    const tipoDocumento = determineDocumentType(file.name);
    console.log(`Tipo de documento determinado: ${tipoDocumento}`);
    
    // Realizar la petición al nuevo endpoint con los parámetros requeridos
    const response = await axios.post(
      `${API_BASE_URL}/documentos/caso/${caseId}/upload?tipo_documento=${tipoDocumento}&subido_por=${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      console.log('Documento subido exitosamente:', response.data);
      return { success: true, data: response.data };
    } else {
      console.error('Error en respuesta de subida:', response.statusText);
      return {
        success: false,
        error: `Error al subir archivo: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    console.error('Error al subir documento:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error desconocido al subir el documento';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
