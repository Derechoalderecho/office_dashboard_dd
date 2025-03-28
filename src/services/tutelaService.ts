import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export interface TutelaResponse {
  nombre_documento: string;
  enlace: string;
  contenido_documento: string;
  ext_documento: string;
  id_caso: number;
  id_documento: number;
  fecha_asigna: string;
}

/**
 * Sube un documento de tutela al servidor
 * @param formData Formulario con el archivo a subir
 * @param caseId ID del caso
 * @returns Respuesta con la información del documento
 */
export async function uploadTutelaDocument(
  formData: FormData,
  caseId: number
): Promise<{success: boolean; data?: TutelaResponse; error?: string}> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/tutelas/${caseId}`,
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
        error: `Error al subir la tutela: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    console.error("Error uploading tutela document:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    return { success: false, error: errorMessage };
  }
} 