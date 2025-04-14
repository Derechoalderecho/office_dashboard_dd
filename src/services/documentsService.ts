"use server";

import { get, post, del, downloadFile, put } from "@/utils/apiUtils";
import { 
  getWithCache, 
  getCollectionWithCache,
  invalidateCacheItem,
  invalidateCache
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";
import { DocumentResponse } from "@/types/documents";

const DOCUMENT_CACHE = 'documents';
const CASE_DOCUMENTS_CACHE = 'case_documents';

const DOCUMENT_TTL = 10 * 60 * 1000;

/**
 * Gets all documents associated with a case
 * @param caseId
 * @returns
 */
export const getDocumentsByCaseId = async (caseId: number): Promise<DocumentResponse[]> => {
  try {
    return await getCollectionWithCache<DocumentResponse>(
      `${CASE_DOCUMENTS_CACHE}_${caseId}`,
      async () => {
        logger.debug(`Obteniendo documentos para el caso ${caseId}`);
        return await get<DocumentResponse[]>(`casos/${caseId}/documentos`);
      },
      document => document.id_documento.toString(),
      DOCUMENT_TTL
    );
  } catch (error) {
    logger.error(`Error al obtener documentos para el caso ${caseId}:`, error);
    return [];
  }
};

/**
 * Gets a specific document by its ID
 * @param documentId
 * @returns
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
 * Downloads a document
 * @param documentId
 * @returns
 */
export const downloadDocument = async (documentId: number): Promise<string | null> => {
  try {
    logger.info(`Descargando documento ${documentId}`);
    return await downloadFile(`documentos/${documentId}/descargar`);
  } catch (error) {
    logger.error(`Error al descargar documento ${documentId}:`, error);
    return null;
  }
};

/**
 * Uploads a new document for a case
 * @param caseId
 * @param fileData
 * @returns
 */
export const uploadDocument = async (
  caseId: number,
  fileData: FormData
): Promise<DocumentResponse | null> => {
  try {
    logger.info(`Subiendo documento para el caso ${caseId}`);
    
    // Realizar la carga del documento
    const uploadedDocument = await post<DocumentResponse>(
      `casos/${caseId}/documentos`,
      fileData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    invalidateCache(`${CASE_DOCUMENTS_CACHE}_${caseId}`);
    
    logger.info(`Documento subido exitosamente para el caso ${caseId}`);
    return uploadedDocument;
  } catch (error) {
    logger.error(`Error al subir documento para el caso ${caseId}:`, error);
    return null;
  }
};

/**
 * Updates the metadata of a document
 * @param documentId
 * @param caseId
 * @param metadata
 * @returns
 */
export const updateDocumentMetadata = async (
  documentId: number,
  caseId: number,
  metadata: Partial<DocumentResponse>
): Promise<DocumentResponse | null> => {
  try {
    logger.info(`Actualizando metadatos del documento ${documentId}`);
    
    const updatedDocument = await put<DocumentResponse>(
      `documentos/${documentId}`,
      metadata
    );
    
    invalidateCacheItem(DOCUMENT_CACHE, documentId.toString());
    invalidateCache(`${CASE_DOCUMENTS_CACHE}_${caseId}`);
    
    logger.info(`Metadatos del documento ${documentId} actualizados exitosamente`);
    return updatedDocument;
  } catch (error) {
    logger.error(`Error al actualizar metadatos del documento ${documentId}:`, error);
    return null;
  }
};

/**
 * Deletes a document
 * @param documentId
 * @param caseId
 * @returns
 */
export const deleteDocument = async (
  documentId: number,
  caseId: number
): Promise<boolean> => {
  try {
    logger.info(`Eliminando documento ${documentId} del caso ${caseId}`);
    
    await del<void>(`documentos/${documentId}`);

    invalidateCacheItem(DOCUMENT_CACHE, documentId.toString());
    invalidateCache(`${CASE_DOCUMENTS_CACHE}_${caseId}`);

    logger.info(`Documento ${documentId} eliminado exitosamente`);
    return true;
  } catch (error) {
    logger.error(`Error al eliminar documento ${documentId}:`, error);
    return false;
  }
}; 