"use server";

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

/**
 * Obtiene la tutela más reciente asociada a un caso
 * @param caseId ID del caso
 * @returns Respuesta con la información del documento o error
 */
export async function getLatestTutelaDocument(
  caseId: number
): Promise<{success: boolean; data?: TutelaResponse; error?: string}> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/tutelas/${caseId}/latest`
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
    // Si el error es 404, significa que no hay tutela disponible, no es realmente un error
    if (error.response?.status === 404) {
      return { success: false, error: "No hay documentos de tutela disponibles para este caso" };
    }
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    return { success: false, error: errorMessage };
  }
}

/**
 * Obtiene la tutela más reciente asociada a un caso utilizando el servicio de documentos
 * @param caseId ID del caso
 * @returns Respuesta con la información del documento o error
 */
export async function getLatestTutelaFromDocuments(
  caseId: number
): Promise<{success: boolean; data?: TutelaResponse; error?: string}> {
  try {
    // Importar dinámicamente el servicio de documentos para evitar errores de importación circular
    const { getDocumentsByCaseId } = await import('./documentService');
    
    // Obtener todos los documentos del caso
    const documents = await getDocumentsByCaseId(caseId);
    
    if (!documents || documents.length === 0) {
      return { 
        success: false, 
        error: "No hay documentos disponibles para este caso" 
      };
    }
    
    // Para depuración: imprimir los documentos recibidos
    console.log("Documentos recibidos:", JSON.stringify(documents, null, 2));
    
    // Ordenar los documentos por fecha (más reciente primero)
    // Usamos cualquier campo de fecha disponible, con preferencia para fecha_crea o fecha_asigna
    const sortedDocs = [...documents].sort((a, b) => {
      const dateA = new Date(a.fecha_crea || a.fecha_asigna || 0).getTime();
      const dateB = new Date(b.fecha_crea || b.fecha_asigna || 0).getTime();
      return dateB - dateA;
    });
    
    // Buscar el primer documento que tenga la propiedad contenido_documento o sea una tutela
    // Algunos documentos podrían tener tipo "tutela" u otro indicador
    const tutelaDoc = sortedDocs.find(doc => 
      doc.contenido_documento || 
      doc.tipo === 'tutela' || 
      (doc.nombre && doc.nombre.toLowerCase().includes('tutela'))
    );
    
    if (!tutelaDoc) {
      return { 
        success: false, 
        error: "No se encontró ningún documento de tutela para este caso" 
      };
    }
    
    // Para depuración: imprimir el documento de tutela encontrado
    console.log("Documento de tutela encontrado:", JSON.stringify(tutelaDoc, null, 2));
    
    // Formatear el documento como TutelaResponse, manejando casos donde los campos pueden tener nombres diferentes
    const tutelaResponse: TutelaResponse = {
      nombre_documento: tutelaDoc.nombre_documento || tutelaDoc.nombre || 'documento',
      enlace: tutelaDoc.enlace || '',
      contenido_documento: tutelaDoc.contenido_documento || tutelaDoc.contenido || '',
      ext_documento: tutelaDoc.ext_documento || tutelaDoc.extension || '',
      id_caso: caseId,
      id_documento: tutelaDoc.id_documento,
      fecha_asigna: tutelaDoc.fecha_asigna || tutelaDoc.fecha_crea || new Date().toISOString()
    };
    
    return { success: true, data: tutelaResponse };
  } catch (error: any) {
    console.error("Error fetching tutela document from documents:", error);
    const errorMessage = error.message || "Error desconocido al obtener la tutela";
    return { success: false, error: errorMessage };
  }
}

/**
 * Obtiene un documento de tutela específico por su ID
 * @param documentId ID del documento de tutela
 * @returns Respuesta con la información del documento o error
 */
export async function getTutelaDocumentById(
  documentId: number
): Promise<{success: boolean; data?: TutelaResponse; error?: string}> {
  try {
    // Importar dinámicamente el servicio de documentos
    const { getDocumentById } = await import('./documentService');
    
    // Obtener el documento
    const document = await getDocumentById(documentId);
    
    if (!document) {
      return { 
        success: false, 
        error: `No se encontró el documento con ID ${documentId}` 
      };
    }
    
    // Verificar si el documento tiene contenido
    if (!document.contenido_documento && !document.contenido) {
      return { 
        success: false, 
        error: `El documento con ID ${documentId} no tiene contenido de tutela` 
      };
    }
    
    // Formatear el documento como TutelaResponse
    const tutelaResponse: TutelaResponse = {
      nombre_documento: document.nombre_documento || 'documento',
      enlace: document.enlace || '',
      contenido_documento: document.contenido_documento || '',
      ext_documento: document.ext_documento || '',
      id_caso: document.id_caso || 0,
      id_documento: document.id_documento,
      fecha_asigna: document.fecha_asigna || document.fecha_crea || new Date().toISOString()
    };
    
    return { success: true, data: tutelaResponse };
  } catch (error: any) {
    console.error(`Error fetching tutela document with ID ${documentId}:`, error);
    const errorMessage = error.message || "Error desconocido al obtener la tutela";
    return { success: false, error: errorMessage };
  }
} 