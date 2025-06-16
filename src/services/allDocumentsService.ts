//Servicio para obtener todos los documentos de un caso en solo los anexos

"use server";

import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export type DocumentResponse = {
  nombre_documento: string;
  ext_documento: string;
  enlace: string;
  url_firmada?: string;
  id_documento: number;
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

/**
 * Obtiene documentos de un caso filtrados por tipo
 * @param caseId ID del caso
 * @param documentType Tipo de documento a filtrar
 * @returns Lista de documentos del tipo especificado
 */
export async function getDocumentsByCaseIdAndType(
  caseId: number,
  documentType: string
): Promise<DocumentResponse[]> {
  try {
    console.log(`Obteniendo documentos para el caso ${caseId} de tipo ${documentType}`);
    // Usamos el endpoint correcto que estaba en el servicio original
    const response = await axios.get(`${API_BASE_URL}/documentos/caso/${caseId}/documentos/?tipo=${documentType}`);
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener documentos por tipo:", error);
    if (error.response?.status === 404) {
      return []; // Si no hay documentos, devolver array vacío
    }
    throw error;
  }
}

/**
 * Descarga un documento usando su ID
 * @param document Documento a descargar 
 * @returns Objeto con información de la descarga o error
 */
export async function downloadDocument(
  document: DocumentResponse
): Promise<{ success: boolean; data?: Blob; fileName?: string; error?: string }> {
  try {
    if (!document) {
      return { success: false, error: "No se proporcionó información del documento" };
    }

    // Extraer el nombre del archivo para usarlo como nombre de descarga
    let fileName = document.nombre_documento;
    if (document.ext_documento && !fileName.endsWith(document.ext_documento)) {
      fileName += document.ext_documento;
    }

    // Primero, obtener la URL firmada si no la tenemos aún
    let urlFirmada = document.url_firmada || document.enlace;
    
    // Si no tenemos URL firmada, necesitamos obtenerla primero
    if (!urlFirmada) {
      const idDocumentoCaso = document.id_documento_caso || document.id_documento;
      console.log(`Obteniendo URL firmada para el documento ${idDocumentoCaso}`);
      
      try {
        const urlResponse = await axios.get(`${API_BASE_URL}/documentos/${idDocumentoCaso}/download`);
        
        if (urlResponse.status === 200 && urlResponse.data) {
          urlFirmada = urlResponse.data.url_firmada || urlResponse.data.enlace || urlResponse.data;
          console.log('URL firmada obtenida:', urlFirmada);
        } else {
          return { 
            success: false, 
            error: 'No se pudo obtener el enlace de descarga'
          };
        }
      } catch (urlError: any) {
        console.error('Error al obtener la URL firmada:', urlError);
        return { 
          success: false, 
          error: urlError.message || 'Error al obtener el enlace de descarga'
        };
      }
    }
    
    // Asegurarnos de que tenemos una URL
    if (!urlFirmada || typeof urlFirmada !== 'string') {
      return { 
        success: false, 
        error: 'No se pudo obtener una URL válida para la descarga'
      };
    }
    
    console.log(`Descargando archivo desde URL: ${urlFirmada}`);
    
    try {
      // Descargar el archivo real usando la URL firmada
      const response = await axios.get(urlFirmada, {
        responseType: 'blob'
      });
      
      if (response.status === 200) {
        // Determinar el tipo MIME basado en la extensión del archivo
        // Usar el Content-Type de la respuesta o inferirlo de la extensión
        let mimeType = response.headers['content-type'];
        
        // Si el mime type indica que es JSON, necesitamos inferirlo de la extensión
        if (mimeType.includes('application/json') || mimeType.includes('text/plain')) {
          // Si la extensión está en el documento, usarla para determinar el tipo MIME
          const extension = document.ext_documento?.toLowerCase() || fileName.split('.').pop()?.toLowerCase();
          
          // Mapeo de extensiones comunes a tipos MIME
          if (extension) {
            const mimeTypes: Record<string, string> = {
              'pdf': 'application/pdf',
              'doc': 'application/msword',
              'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'xls': 'application/vnd.ms-excel',
              'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'ppt': 'application/vnd.ms-powerpoint',
              'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              'txt': 'text/plain',
              'jpg': 'image/jpeg',
              'jpeg': 'image/jpeg',
              'png': 'image/png',
              'gif': 'image/gif'
            };
            
            // Limpiar la extensión de cualquier punto o espacio
            const cleanExt = extension.replace(/^\.|\.$/g, '').trim();
            
            if (mimeTypes[cleanExt]) {
              mimeType = mimeTypes[cleanExt];
              console.log(`Usando tipo MIME ${mimeType} para archivo con extensión ${cleanExt}`);
            }
          }
        }
        
        // Crear el blob con el tipo MIME adecuado
        const blob = new Blob([response.data], { type: mimeType });
        return { 
          success: true, 
          data: blob,
          fileName: fileName
        };
      } else {
        return {
          success: false,
          error: `Error al descargar documento: ${response.statusText}`,
        };
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { 
          success: false, 
          error: "El documento solicitado no existe o no está disponible" 
        };
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        return { 
          success: false, 
          error: "No tienes permisos para descargar este documento" 
        };
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error("Error downloading document:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido al descargar el documento";
    return { success: false, error: errorMessage };
  }
}
