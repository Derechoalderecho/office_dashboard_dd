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
 * Uploads a tutela document to the server
 * @param formData
 * @param caseId
 * @returns
 */
export async function uploadTutelaDocument(
  formData: FormData,
  caseId: number
): Promise<{ success: boolean; data?: TutelaResponse; error?: string }> {
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
 * @param caseId
 * @returns
 */
export async function getLatestTutelaFromDocuments(
  caseId: number
): Promise<{ success: boolean; data?: TutelaResponse; error?: string }> {
  try {
    const { getDocumentsByCaseId } = await import("./documentService");

    const documents = await getDocumentsByCaseId(caseId);

    if (!documents || documents.length === 0) {
      return {
        success: false,
        error: "No hay documentos disponibles para este caso",
      };
    }

    console.log("Documentos recibidos:", JSON.stringify(documents, null, 2));

    const sortedDocs = [...documents].sort((a, b) => {
      const dateA = new Date(a.fecha_crea || a.fecha_asigna || 0).getTime();
      const dateB = new Date(b.fecha_crea || b.fecha_asigna || 0).getTime();
      return dateB - dateA;
    });

    const tutelaDoc = sortedDocs.find(
      (doc) =>
        doc.contenido_documento ||
        doc.tipo === "tutela" ||
        (doc.nombre && doc.nombre.toLowerCase().includes("tutela"))
    );

    if (!tutelaDoc) {
      return {
        success: false,
        error: "No se encontró ningún documento de tutela para este caso",
      };
    }

    console.log(
      "Documento de tutela encontrado:",
      JSON.stringify(tutelaDoc, null, 2)
    );

    // Format the document as TutelaResponse, handling cases where the fields may have different names
    const tutelaResponse: TutelaResponse = {
      nombre_documento:
        tutelaDoc.nombre_documento || tutelaDoc.nombre || "documento",
      enlace: tutelaDoc.enlace || "",
      contenido_documento:
        tutelaDoc.contenido_documento || tutelaDoc.contenido || "",
      ext_documento: tutelaDoc.ext_documento || tutelaDoc.extension || "",
      id_caso: caseId,
      id_documento: tutelaDoc.id_documento,
      fecha_asigna:
        tutelaDoc.fecha_asigna ||
        tutelaDoc.fecha_crea ||
        new Date().toISOString(),
    };

    return { success: true, data: tutelaResponse };
  } catch (error: any) {
    console.error("Error fetching tutela document from documents:", error);
    const errorMessage =
      error.message || "Error desconocido al obtener la tutela";
    return { success: false, error: errorMessage };
  }
}

/**
 * Gets a specific tutela document by its ID
 * @param documentId
 * @returns
 */
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

    if (!document.contenido_documento && !document.contenido) {
      return {
        success: false,
        error: `El documento con ID ${documentId} no tiene contenido de tutela`,
      };
    }

    // Format the document as TutelaResponse
    const tutelaResponse: TutelaResponse = {
      nombre_documento: document.nombre_documento || "documento",
      enlace: document.enlace || "",
      contenido_documento: document.contenido_documento || "",
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
