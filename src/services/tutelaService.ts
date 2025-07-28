//Servicio para subir todos los documentos del casePreview desde pendiente hasta radicar

import { get, post } from "@/utils/apiUtils";

export interface TutelaResponse {
  nombre_documento: string;
  enlace: string;
  contenido: string;
  ext_documento: string;
  id_caso: number;
  id_documento: number;
  fecha_asigna: string;
  id_documento_caso: number;
}

/**
 * Uploads a tutela document to the server
 * @param formData - The form data with the file
 * @param caseId - The case ID
 * @param studentId - The student ID
 * @returns A promise with the upload result
 */
export async function uploadTutelaDocument(
  formData: FormData,
  caseId: number,
  studentId: number
): Promise<{ success: boolean; data?: TutelaResponse; error?: string }> {
  try {
    // Endpoint para convertir y subir documentos
    const endpoint = `/documentos/convert/docx-to-md`;
    console.log(`📤 Subiendo documento al endpoint: ${endpoint}`);
    
    // Crear un nuevo FormData para tener control total sobre los parámetros
    const newFormData = new FormData();
    
    // Primero, transferir el archivo desde el formData original
    const file = formData.get('file');
    if (file) {
      newFormData.append('file', file);
    }
    
    // Usar post de apiUtils con los parámetros necesarios
    const data = await post<TutelaResponse>(
      `${endpoint}?id_caso=${caseId}&id_estudiante=${studentId}&tipo=Tutela`,
      newFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      }
    );

    return { success: true, data };
  } catch (error: any) {
    console.error("Error uploading tutela document:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Error desconocido";
    return { success: false, error: errorMessage };
  }
}

/**
 * Gets the latest tutela associated with a case using the documents service
 * @param caseId - The case ID
 * @returns A promise with the latest tutela document
 */
export async function getLatestTutelaFromDocuments(
  caseId: number
): Promise<{ success: boolean; data?: TutelaResponse; error?: string }> {
  try {
    // Endpoint para obtener el último documento de tutela generado
    const endpoint = `/documentos/caso/${caseId}/generados`;
    console.log(`📥 Obteniendo último documento de tutela: ${endpoint}`);
    
    const data = await get<any>(`${endpoint}?last=true`);

    if (!data) {
      return {
        success: false,
        error: "No hay documentos de tutela disponibles para este caso",
      };
    }

    // La respuesta puede ser un array o un objeto individual
    const doc = Array.isArray(data) ? data[0] : data;
    
    if (!doc) {
      return {
        success: false,
        error: "No se encontró ningún documento en la respuesta",
      };
    }
    
    // Mostrar el contenido de la respuesta para depuración
    console.log("Respuesta del servidor:", JSON.stringify(doc, null, 2));

    // Format the document as TutelaResponse
    const tutelaResponse: TutelaResponse = {
      nombre_documento: doc.nombre_documento || doc.nombre || doc.titulo || "documento",
      enlace: doc.enlace || "",
      contenido: doc.contenido || "", // Usar el contenido de la respuesta
      ext_documento: doc.ext_documento || doc.extension || "",
      id_caso: caseId,
      id_documento: doc.id_documento || doc.id_documento_generado,
      fecha_asigna: doc.fecha_asigna || doc.created_date || doc.fecha_creacion || new Date().toISOString(),
      id_documento_caso: doc.id_documento_caso || doc.id_documento || 0, // Agregar el campo faltante
    };
    
    console.log("TutelaResponse procesada:", tutelaResponse);

    return { success: true, data: tutelaResponse };
  } catch (error: any) {
    console.error("Error fetching tutela document:", error);
    // Si es un 404, manejarlo específicamente
    if (error.response?.status === 404) {
      return {
        success: false,
        error: "No se encontró ningún documento de tutela para este caso",
      };
    }
    const errorMessage = error.message || "Error desconocido al obtener la tutela";
    return { success: false, error: errorMessage };
  }
}

/**
 * Gets a specific tutela document by its ID
 * @param documentId
 * @returns
 */
/**
 * Radica un documento de tutela en el sistema
 * @param formData - El FormData con el archivo
 * @param caseId - ID del caso
 * @param uploadedBy - ID del usuario que sube el documento
 * @returns Promesa con el resultado de la radicación
 */
export async function radicateTutelaDocument(
  formData: FormData,
  caseId: number,
  uploadedBy: number
): Promise<{ success: boolean; data?: TutelaResponse; error?: string }> {
  try {
    // Endpoint para radicar documentos
    const endpoint = `/documentos/caso/${caseId}/upload`;
    console.log(`📤 Radicando documento en el endpoint: ${endpoint}`);
    
    // Crear un nuevo FormData para tener control total sobre los parámetros
    const newFormData = new FormData();
    
    // Transferir el archivo desde el formData original
    const file = formData.get('file');
    if (!file) {
      return { success: false, error: "No se proporcionó ningún archivo para radicar" };
    }
    newFormData.append('file', file);
    
    // Construir la URL con los parámetros de consulta
    const url = `${endpoint}?id_caso=${caseId}&tipo_documento=Radicado&subido_por=${uploadedBy}`;
    
    // Usar post de apiUtils
    const data = await post<TutelaResponse>(
      url,
      newFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      }
    );

    return { success: true, data };
  } catch (error: any) {
    console.error("Error radicando tutela document:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Error desconocido";
    return { success: false, error: errorMessage };
  }
}

/**
 * Obtiene el último documento radicado para un caso
 * @param caseId - ID del caso
 * @returns Promesa con el último documento radicado
 */
export async function getLatestRadicadoDocument(
  caseId: number
): Promise<{ success: boolean; data?: TutelaResponse; error?: string }> {
  try {
    // Endpoint para obtener el último documento radicado
    const endpoint = `/documentos/caso/${caseId}/radicados`;
    console.log(`📥 Obteniendo último documento radicado: ${endpoint}`);
    
    const data = await get<any>(`${endpoint}?last=true`);

    if (!data) {
      return {
        success: false,
        error: "No hay documentos radicados disponibles para este caso",
      };
    }

    // La respuesta puede ser un array o un objeto individual
    const doc = Array.isArray(data) ? data[0] : data;
    
    if (!doc) {
      return {
        success: false,
        error: "No se encontró ningún documento radicado",
      };
    }
    
    // Mostrar el contenido de la respuesta para depuración
    console.log("Respuesta del servidor (radicado):", JSON.stringify(doc, null, 2));

    // Format the document as TutelaResponse
    const tutelaResponse: TutelaResponse = {
      nombre_documento: doc.nombre_documento || doc.nombre || doc.titulo || "documento",
      enlace: doc.enlace || "",
      contenido: doc.contenido || "", // Asegurar que conservamos el contenido
      ext_documento: doc.ext_documento || doc.extension || "",
      id_caso: caseId,
      id_documento: doc.id_documento || doc.id_documento_generado,
      fecha_asigna: doc.fecha_asigna || doc.created_date || doc.fecha_creacion || new Date().toISOString(),
      id_documento_caso: doc.id_documento_caso || null, // Incluir el id_documento_caso para descargas
    };
    
    console.log("TutelaResponse procesada (radicado):", tutelaResponse);

    return { success: true, data: tutelaResponse };
  } catch (error: any) {
    console.error("Error fetching radicado document:", error);
    // Si es un 404, manejarlo específicamente
    if (error.response?.status === 404) {
      return {
        success: false,
        error: "No se encontró ningún documento radicado para este caso",
      };
    }
    const errorMessage = error.message || "Error desconocido al obtener el documento radicado";
    return { success: false, error: errorMessage };
  }
}
