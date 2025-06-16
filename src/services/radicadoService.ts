"use server";

//Servicio para descargar y obtener el ultimo radicado del caso

import axios from "axios";
import { API_BASE_URL } from "@/config/api";

/**
 * Función para descargar un documento radicado usando su ID
 * @param documentoCasoId - El ID del documento caso (id_documento_caso)
 * @returns Una promesa que resuelve a un objeto con la URL firmada o un error
 */
export async function downloadRadicado(
  documentoCasoId: number
): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
  try {
    // Validar que tenemos un ID válido
    if (!documentoCasoId) {
      return { success: false, error: "No se proporcionó un ID de documento válido" };
    }

    const apiUrl = `${API_BASE_URL}/documentos/caso/${documentoCasoId}/download`;
    console.log(`Solicitando URL firmada para descarga: ${apiUrl}`);

    const response = await axios.get(apiUrl);
    
    if (response.status === 200 && response.data?.url_firmada) {
      console.log("URL firmada obtenida con éxito");
      return { 
        success: true, 
        signedUrl: response.data.url_firmada 
      };
    } else {
      return {
        success: false,
        error: "La respuesta del servidor no contiene una URL de descarga válida"
      };
    }
  } catch (error: any) {
    console.error("Error al obtener la URL firmada para descarga:", error);
    
    let errorMessage = "Error al intentar descargar el documento";
    
    if (error.response) {
      if (error.response.status === 404) {
        errorMessage = "El documento solicitado no existe o no está disponible";
      } else if (error.response.status === 401 || error.response.status === 403) {
        errorMessage = "No tienes permisos para descargar este documento";
      } else {
        errorMessage = error.response.data?.message || error.message || errorMessage;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Obtiene y descarga el último documento radicado para un caso
 * @param caseId - ID del caso
 * @returns Una promesa con la URL firmada para descargar el documento o un error
 */
export async function downloadLastRadicado(
  caseId: number
): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
  try {
    // 1. Primero obtenemos el último documento radicado
    const { getLatestRadicadoDocument } = await import("./tutelaService");
    const radicadoResult = await getLatestRadicadoDocument(caseId);
    
    if (!radicadoResult.success || !radicadoResult.data) {
      return { 
        success: false, 
        error: radicadoResult.error || "No se encontró un documento radicado para este caso" 
      };
    }
    
    // 2. Verificar que tengamos el id_documento_caso necesario
    if (!radicadoResult.data.id_documento_caso) {
      return {
        success: false,
        error: "El documento radicado no tiene un ID válido para descarga"
      };
    }
    
    // 3. Solicitar la URL firmada para la descarga
    return await downloadRadicado(radicadoResult.data.id_documento_caso);
    
  } catch (error: any) {
    console.error("Error al descargar el último documento radicado:", error);
    return { 
      success: false, 
      error: error.message || "Error al intentar descargar el último documento radicado" 
    };
  }
}
