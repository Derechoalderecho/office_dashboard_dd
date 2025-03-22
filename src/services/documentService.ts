"use server";

import { DocumentResponse } from "@/types/documents";
import { get, post, del, downloadFile } from "@/utils/apiUtils";
import { 
  getWithCache, 
  getCollectionWithCache,
  invalidateCacheItem,
  invalidateCache
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

// Nombre de la caché para documentos
const DOCUMENT_CACHE = 'documents';
const CASE_DOCUMENTS_CACHE = 'case_documents';

// TTL para la caché de documentos (10 minutos)
const DOCUMENT_TTL = 10 * 60 * 1000;

/**
 * Obtiene todos los documentos asociados a un caso específico
 * @param caseId ID del caso
 * @returns Lista de documentos o array vacío si ocurre un error
 */
export const getDocumentsByCaseId = async (caseId: number): Promise<DocumentResponse[]> => {
  try {
    return await getCollectionWithCache<DocumentResponse>(
      `${CASE_DOCUMENTS_CACHE}_${caseId}`,
      async () => {
        logger.debug(`Obteniendo documentos para el caso ${caseId}`);
        return await get<DocumentResponse[]>(`casos/${caseId}/documentos`);
      },
      doc => doc.id_documento.toString(),
      DOCUMENT_TTL
    );
  } catch (error) {
    logger.error(`Error al obtener documentos para el caso ${caseId}:`, error);
    return [];
  }
};

/**
 * Obtiene un documento específico por su ID
 * @param documentId ID del documento
 * @returns Información del documento o null si no se encuentra
 */
export const getDocumentById = async (documentId: number): Promise<DocumentResponse | null> => {
  try {
    return await getWithCache<DocumentResponse>(
      DOCUMENT_CACHE,
      documentId.toString(),
      async () => {
        logger.debug(`Obteniendo documento con ID ${documentId}`);
        return await get<DocumentResponse>(`documentos/${documentId}`);
      },
      DOCUMENT_TTL
    );
  } catch (error) {
    logger.error(`Error al obtener documento ${documentId}:`, error);
    return null;
  }
};

/**
 * Descarga un documento específico
 * @param documentId ID del documento a descargar
 * @returns URL del documento descargado o null si hay un error
 */
export const downloadDocument = async (documentId: number): Promise<string | null> => {
  try {
    logger.info(`Descargando documento ${documentId}`);
    const downloadUrl = await downloadFile(`documentos/${documentId}/descargar`);
    logger.debug(`URL de descarga obtenida: ${downloadUrl}`);
    return downloadUrl;
  } catch (error) {
    logger.error(`Error al descargar documento ${documentId}:`, error);
    return null;
  }
};

/**
 * Sube un nuevo documento asociado a un caso
 * @param caseId ID del caso
 * @param formData Datos del formulario con el documento a subir
 * @returns Información del documento subido o null si hay un error
 */
export const uploadDocument = async (
  caseId: number,
  formData: FormData
): Promise<DocumentResponse | null> => {
  try {
    logger.info(`Subiendo documento para el caso ${caseId}`);
    
    const uploadedDocument = await post<DocumentResponse>(
      `casos/${caseId}/documentos`, 
      formData,
      { 
        headers: { 'Content-Type': 'multipart/form-data' }
      }
    );
    
    // Invalidar la caché de documentos para este caso
    invalidateCache(`${CASE_DOCUMENTS_CACHE}_${caseId}`);
    
    logger.info(`Documento subido exitosamente para el caso ${caseId}`);
    return uploadedDocument;
  } catch (error) {
    logger.error(`Error al subir documento para el caso ${caseId}:`, error);
    return null;
  }
};

/**
 * Elimina un documento del sistema
 * @param documentId ID del documento a eliminar
 * @param caseId ID del caso asociado al documento
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export const deleteDocument = async (documentId: number, caseId: number): Promise<boolean> => {
  try {
    logger.info(`Eliminando documento ${documentId} del caso ${caseId}`);
    
    await del<void>(`documentos/${documentId}`);
    
    // Invalidar cachés afectadas
    invalidateCacheItem(DOCUMENT_CACHE, documentId.toString());
    invalidateCache(`${CASE_DOCUMENTS_CACHE}_${caseId}`);
    
    logger.info(`Documento ${documentId} eliminado exitosamente`);
    return true;
  } catch (error) {
    logger.error(`Error al eliminar documento ${documentId}:`, error);
    return false;
  }
}; 