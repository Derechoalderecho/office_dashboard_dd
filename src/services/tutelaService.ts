"use server";

import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export interface TutelaResponse {
  nombre_documento: string;
  enlace: string;
  contenido: string;
  ext_documento: string;
  id_caso: number;
  id_documento: number;
  fecha_asigna: string;
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
    const endpoint = `${API_BASE_URL}/documentos/convert/docx-to-md`;
    console.log(`📤 Subiendo documento al endpoint: ${endpoint}`);
    
    // Crear un nuevo FormData para tener control total sobre los parámetros
    const newFormData = new FormData();
    
    // Primero, transferir el archivo desde el formData original
    const file = formData.get('file');
    if (file) {
      newFormData.append('file', file);
    }
    
    // Añadir los parámetros necesarios directamente como JSON en el query param
    const response = await axios.post(
      endpoint,
      newFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          // Enviar parámetros como valores numéricos en la URL
          id_caso: caseId,
          id_estudiante: studentId,
          tipo: "Tutela" 
        }
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
    const errorMessage =
      error.response?.data?.message || error.message || "Error desconocido";
    return { success: false, error: errorMessage };
  }
}

/**
 * Gets the latest tutela associated with a case
 * @param caseId
 * @returns
 */
export async function getLatestTutelaDocument(
  caseId: number
): Promise<{ success: boolean; data?: TutelaResponse; error?: string }> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/tutelas/${caseId}`
    );

    if (response.status === 200) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: `Error al obtener la tutela: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    console.error("Error fetching latest tutela document:", error);
    if (error.response?.status === 404) {
      return {
        success: false,
        error: "No hay documentos de tutela disponibles para este caso",
      };
    }
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
    const endpoint = `${API_BASE_URL}/documentos/caso/${caseId}/generados`;
    console.log(`📥 Obteniendo último documento de tutela: ${endpoint}`);
    
    const response = await axios.get(endpoint, {
      params: {
        // Parámetro last=true para obtener solo el último documento
        last: true
      }
    });

    if (!response.data) {
      return {
        success: false,
        error: "No hay documentos de tutela disponibles para este caso",
      };
    }

    // La respuesta puede ser un array o un objeto individual
    const doc = Array.isArray(response.data) ? response.data[0] : response.data;
    
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
      // Asegurarnos de capturar el contenido correctamente
      contenido: doc.contenido || "",
      ext_documento: doc.ext_documento || doc.extension || "",
      id_caso: caseId,
      id_documento: doc.id_documento || doc.id_documento_generado,
      fecha_asigna: doc.fecha_asigna || doc.created_date || doc.fecha_creacion || new Date().toISOString(),
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
    const endpoint = `${API_BASE_URL}/documentos/caso/${caseId}/upload`;
    console.log(`📤 Radicando documento en el endpoint: ${endpoint}`);
    
    // Crear un nuevo FormData para tener control total sobre los parámetros
    const newFormData = new FormData();
    
    // Transferir el archivo desde el formData original
    const file = formData.get('file');
    if (!file) {
      return { success: false, error: "No se proporcionó ningún archivo para radicar" };
    }
    newFormData.append('file', file);
    
    const response = await axios.post(
      endpoint,
      newFormData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          // Parámetros requeridos como query params
          id_caso: caseId,
          tipo_documento: "Radicado",  // Siempre será "Docx"
          subido_por: uploadedBy
        }
      }
    );

    if (response.status === 200 || response.status === 201) {
      return { success: true, data: response.data };
    } else {
      return {
        success: false,
        error: `Error al radicar la tutela: ${response.statusText}`,
      };
    }
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
    const endpoint = `${API_BASE_URL}/documentos/caso/${caseId}/radicados`;
    console.log(`📥 Obteniendo último documento radicado: ${endpoint}`);
    
    const response = await axios.get(endpoint, {
      params: {
        // Parámetro last=true para obtener solo el último documento
        last: true
      }
    });

    if (!response.data) {
      return {
        success: false,
        error: "No hay documentos radicados disponibles para este caso",
      };
    }

    // La respuesta puede ser un array o un objeto individual
    const doc = Array.isArray(response.data) ? response.data[0] : response.data;
    
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
      contenido: doc.contenido || "",
      ext_documento: doc.ext_documento || doc.extension || "",
      id_caso: caseId,
      id_documento: doc.id_documento || doc.id_documento_generado,
      fecha_asigna: doc.fecha_asigna || doc.created_date || doc.fecha_creacion || new Date().toISOString(),
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

export async function getTutelaDocumentById(
  documentId: number
): Promise<{ success: boolean; data?: TutelaResponse; error?: string }> {
  try {
    const { getDocumentById } = await import("./documentService");

    const document = await getDocumentById(documentId);

    if (!document) {
      return {
        success: false,
        error: `No se encontró el documento con ID ${documentId}`,
      };
    }

    if (!document.contenido && !document.contenido) {
      return {
        success: false,
        error: `El documento con ID ${documentId} no tiene contenido de tutela`,
      };
    }

    // Format the document as TutelaResponse
    const tutelaResponse: TutelaResponse = {
      nombre_documento: document.nombre_documento || "documento",
      enlace: document.enlace || "",
      contenido: document.contenido || "",
      ext_documento: document.ext_documento || "",
      id_caso: document.id_caso || 0,
      id_documento: document.id_documento,
      fecha_asigna:
        document.fecha_asigna ||
        document.fecha_crea ||
        new Date().toISOString(),
    };

    return { success: true, data: tutelaResponse };
  } catch (error: any) {
    console.error(
      `Error fetching tutela document with ID ${documentId}:`,
      error
    );
    const errorMessage =
      error.message || "Error desconocido al obtener la tutela";
    return { success: false, error: errorMessage };
  }
}
