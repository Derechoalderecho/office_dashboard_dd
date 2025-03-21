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

// Nombre de las cachés
const DOCUMENT_CACHE = 'documents';
const CASE_DOCUMENTS_CACHE = 'case_documents';

// TTL para las cachés (10 minutos para documentos)
const DOCUMENT_TTL = 10 * 60 * 1000;

/**
 * Obtiene todos los documentos asociados a un caso
 * @param caseId ID del caso
 * @returns Array de documentos o array vacío si hay error
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
 * Obtiene un documento específico por su ID
 * @param documentId ID del documento
 * @returns Datos del documento o null si hay error
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
 * Descarga un documento
 * @param documentId ID del documento a descargar
 * @returns URL del documento o null si hay error
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
 * Sube un nuevo documento para un caso
 * @param caseId ID del caso
 * @param fileData Datos del archivo (FormData)
 * @returns Datos del documento subido o null si hay error
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
    
    // Invalidar cachés afectadas
    invalidateCache(`${CASE_DOCUMENTS_CACHE}_${caseId}`);
    
    logger.info(`Documento subido exitosamente para el caso ${caseId}`);
    return uploadedDocument;
  } catch (error) {
    logger.error(`Error al subir documento para el caso ${caseId}:`, error);
    return null;
  }
};

/**
 * Actualiza metadatos de un documento
 * @param documentId ID del documento a actualizar
 * @param caseId ID del caso (para invalidar caché)
 * @param metadata Metadatos actualizados
 * @returns Documento actualizado o null si hay error
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
    
    // Invalidar cachés afectadas
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
 * Elimina un documento
 * @param documentId ID del documento a eliminar
 * @param caseId ID del caso (para invalidar caché)
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export const deleteDocument = async (
  documentId: number,
  caseId: number
): Promise<boolean> => {
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