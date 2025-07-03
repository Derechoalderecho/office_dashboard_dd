"use server";

import axios from "axios";
import { API_BASE_URL } from "@/config/api";

import { DocumentResponse } from '@/types/documents';

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
