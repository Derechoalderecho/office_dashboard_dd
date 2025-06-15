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

    // Usar el ID de documento del caso si está disponible
    const idDocumentoCaso = document.id_documento_caso || document.id_documento;
    const apiUrl = `${API_BASE_URL}/documentos/caso/${idDocumentoCaso}/download`;
    
    try {
      const response = await axios.get(apiUrl, {
        responseType: 'blob'
      });
      
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
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
