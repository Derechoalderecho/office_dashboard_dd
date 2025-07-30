//Servicio para obtener todos los documentos de un caso en solo los anexos

import { get, downloadFile } from "@/utils/apiUtils";
import { DocumentResponse } from '@/types/documents';

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
    return await get<DocumentResponse[]>(`/documentos/caso/${caseId}/documentos/?tipo=${documentType}`);
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
        const urlData = await get<{url_firmada?: string, enlace?: string}>(`/documentos/caso/${idDocumentoCaso}/download`);
        
        if (urlData) {
          urlFirmada = urlData.url_firmada || urlData.enlace || (typeof urlData === 'string' ? urlData : '');
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
      // Obtener la URL final de descarga usando downloadFile de apiUtils
      console.log(`Obteniendo URL final de descarga usando downloadFile desde: ${urlFirmada}`);
      const downloadUrl = await downloadFile(urlFirmada);
      
      if (downloadUrl) {
        // Ahora descargamos el archivo usando fetch ya que necesitamos un Blob
        console.log(`Descargando archivo desde URL final: ${downloadUrl}`);
        const response = await fetch(downloadUrl);
        
        if (response.ok) {
          const blob = await response.blob();
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
      } else {
        return {
          success: false,
          error: 'No se pudo obtener una URL válida para el documento',
        };
      }
    } catch (error: any) {
      if (error.status === 404) {
        return { 
          success: false, 
          error: "El documento solicitado no existe o no está disponible" 
        };
      } else if (error.status === 401 || error.status === 403) {
        return { 
          success: false, 
          error: "No tienes permisos para descargar este documento" 
        };
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error("Error downloading document:", error);
    const errorMessage = error.message || "Error desconocido al descargar el documento";
    return { success: false, error: errorMessage };
  }
}
