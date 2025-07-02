"use server";

import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export type DocumentResponse = {
  nombre_documento: string;
  ext_documento?: string;
  enlace: string;
  url_firmada?: string;
  id_nota?: number;
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
  contenido?: string;
};

/**
 * Sube un documento de tutela al folder específico de radicados
 * @param formData Formulario con el archivo a subir
 * @param caseId ID del caso
 * @returns Respuesta con el documento subido o error
 */
export async function uploadRadicadoDocument(
  formData: FormData,
  caseId: number
): Promise<{ success: boolean; data?: DocumentResponse; error?: string }> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/upload/${caseId}/?folder=radicados`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: `Error al subir tutela: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    console.error("Error uploading tutela document to upload endpoint:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    return { success: false, error: errorMessage };
  }
}

export async function getDocumentById(
  documentId: number
): Promise<{ success: boolean; data?: DocumentResponse; error?: string }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/documentos/${documentId}`);
    
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: `Error al obtener documento: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    console.error("Error fetching document:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    return { success: false, error: errorMessage };
  }
}

export async function getDocumentsByCaseId(
  caseId: number
): Promise<{ success: boolean; data?: DocumentResponse[]; error?: string }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/casos/${caseId}/documentos`);
    
    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: `Error al obtener documentos: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    console.error("Error fetching documents for case:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    return { success: false, error: errorMessage };
  }
}

export async function downloadDocument(
  documentId: number,
  folder?: string
): Promise<{ success: boolean; data?: Blob; fileName?: string; error?: string }> {
  try {
    // Primero, obtener los detalles del documento para obtener el nombre, extensión y enlace
    const docResponse = await axios.get(`${API_BASE_URL}/documentos/${documentId}`);
    const documentData = docResponse.data as DocumentResponse;
    const fileName = `${documentData.nombre_documento}${documentData.ext_documento}`;
    
    // Determinar el folder adecuado
    let documentFolder = folder;
    
    if (!documentFolder && documentData.enlace) {
      // Intentar extraer el folder de la URL firmada
      try {
        // La URL firmada tiene un formato como:
        // https://storage.googleapis.com/bucket_consultorios/radicados/archivo.ext?X-Goog...
        // o https://storage.googleapis.com/bucket_consultorios/documentos_casos/archivo.ext?X-Goog...
        const urlParts = documentData.enlace.split('/');
        // Buscamos el índice de 'bucket_consultorios' y tomamos el siguiente elemento
        const bucketIndex = urlParts.findIndex(part => part === 'bucket_consultorios');
        if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
          documentFolder = urlParts[bucketIndex + 1];
          // Si el folder contiene un signo de interrogación, lo eliminamos
          if (documentFolder.includes('?')) {
            documentFolder = documentFolder.split('?')[0];
          }
          console.log('Folder extraído de la URL:', documentFolder);
          
          // Validar que el folder sea uno de los válidos
          const validFolders = ['radicados', 'documentos_casos', 'tutelas'];
          if (!validFolders.includes(documentFolder)) {
            console.log('Folder no válido, usando documentos_casos como default');
            documentFolder = 'documentos_casos';
          }
        } else {
          // Si no podemos extraer el folder, usamos el default
          documentFolder = 'documentos_casos';
        }
      } catch (error) {
        console.error('Error al extraer folder de la URL:', error);
        // Si hay algún error al extraer el folder, usamos el default
        documentFolder = 'documentos_casos';
      }
    } else if (!documentFolder) {
      // Si no hay enlace ni folder especificado, usamos el default
      documentFolder = 'documentos_casos';
    }
    
    // Construir la URL con el parámetro folder como query parameter
    const downloadUrl = `${API_BASE_URL}/documentos/${documentId}/download?folder=${documentFolder}`;
    console.log('URL de descarga:', downloadUrl, 'Folder:', documentFolder);
    
    // Hacer la solicitud de descarga
    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'blob'
      });
      
      if (response.status === 200) {
        // Crear un blob con los datos recibidos
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
    } catch (downloadError: any) {
      // Si falla con el folder detectado y no es el default, intentamos con documentos_casos
      if (documentFolder !== 'documentos_casos') {
        console.log('Intento fallido con folder:', documentFolder, 'Intentando con documentos_casos');
        const fallbackUrl = `${API_BASE_URL}/documentos/${documentId}/download?folder=documentos_casos`;
        
        try {
          const fallbackResponse = await axios.get(fallbackUrl, {
            responseType: 'blob'
          });
          
          if (fallbackResponse.status === 200) {
            const blob = new Blob([fallbackResponse.data], { type: fallbackResponse.headers['content-type'] });
            return { 
              success: true, 
              data: blob,
              fileName: fileName
            };
          }
        } catch (fallbackError) {
          console.error('Error en fallback download:', fallbackError);
          // Continuamos con el error original si el fallback también falla
        }
      }
      
      // Si llegamos aquí, ambos intentos fallaron o solo falló el intento principal
      throw downloadError;
    }
  } catch (error: any) {
    console.error("Error downloading document:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido al descargar el documento";
    return { success: false, error: errorMessage };
  }
}
