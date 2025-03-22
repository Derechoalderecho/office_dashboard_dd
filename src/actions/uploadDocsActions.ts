"use server";

import axios from "axios";
import { API_BASE_URL } from "@/config/api";

export type DocumentResponse = {
  id_caso: number;
  nombre_documento: string;
  ext_documento: string;
  enlace: string;
  id_documento: number;
  fecha_asigna: string;
};

export async function uploadDocument(
  formData: FormData,
  caseId: number
): Promise<{ success: boolean; data?: DocumentResponse; error?: string }> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/upload/${caseId}/`,
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
        error: `Error al subir archivo: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    console.error("Error uploading document:", error);
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
  documentId: number
): Promise<{ success: boolean; data?: Blob; fileName?: string; error?: string }> {
  try {
    const response = await axios.get(`${API_BASE_URL}/documentos/${documentId}/download`, {
      responseType: 'blob'
    });

    // First, get document details to get the name and extension
    const docResponse = await axios.get(`${API_BASE_URL}/documentos/${documentId}`);
    const documentData = docResponse.data as DocumentResponse;
    const fileName = `${documentData.nombre_documento}${documentData.ext_documento}`;
    
    if (response.status === 200) {
      return { 
        success: true, 
        data: response.data,
        fileName: fileName
      };
    } else {
      return {
        success: false,
        error: `Error al descargar documento: ${response.statusText}`,
      };
    }
  } catch (error: any) {
    console.error("Error downloading document:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido al descargar el documento";
    return { success: false, error: errorMessage };
  }
}
