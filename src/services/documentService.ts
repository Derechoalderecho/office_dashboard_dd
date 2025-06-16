"use server";

import { DocumentResponse } from "@/actions/uploadDocsActions";
import { get, post, del, downloadFile } from "@/utils/apiUtils";
import {
  getWithCache,
  getCollectionWithCache,
  invalidateCacheItem,
  invalidateCache,
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

const DOCUMENT_CACHE = "documents";
const CASE_DOCUMENTS_CACHE = "case_documents";

const DOCUMENT_TTL = 10 * 60 * 1000;

/**
 * Gets all documents associated with a specific case
 * @param caseId
 * @returns
 */
export const getDocumentsByCaseId = async (
  caseId: number
): Promise<DocumentResponse[]> => {
  try {
    return await getCollectionWithCache<DocumentResponse>(
      `${CASE_DOCUMENTS_CACHE}_${caseId}`,
      async () => {
        logger.debug(`Obteniendo documentos para el caso ${caseId}`);
        // Por defecto, usamos Docx como tipo
        return await get<DocumentResponse[]>(`documentos/caso/${caseId}/documentos/?tipo=Docx`);
      },
      (doc) => doc.id_documento.toString(),
      DOCUMENT_TTL
    );
  } catch (error) {
    logger.error(`Error al obtener documentos para el caso ${caseId}:`, error);
    return [];
  }
};

/**
 * Obtiene documentos por caso y tipo
 * @param caseId ID del caso
 * @param documentType Tipo de documento (Docx por defecto)
 * @returns Lista de documentos
 */
export const getDocumentsByCaseIdAndType = async (
  caseId: number,
  documentType: 'Docx' | 'MD' | 'Tutela' | 'Radicado' | 'Otro' = 'Docx'
): Promise<DocumentResponse[]> => {
  try {
    logger.info(`Obteniendo documentos para el caso ${caseId} de tipo ${documentType}`);
    
    const url = `documentos/caso/${caseId}/documentos/?tipo=${documentType}`;
    
    return await get<DocumentResponse[]>(url);
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
export const getDocumentById = async (
  documentId: number
): Promise<DocumentResponse | null> => {
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
 * Downloads a specific document
 * @param documentId
 * @returns
 */
export const downloadDocument = async (
  documentId: number
): Promise<string | null> => {
  try {
    logger.info(`Descargando documento ${documentId}`);
    const downloadUrl = await downloadFile(
      `documentos/${documentId}/download/?folder=documentos_casos`
    );
    logger.debug(`URL de descarga obtenida: ${downloadUrl}`);
    return downloadUrl;
  } catch (error) {
    logger.error(`Error al descargar documento ${documentId}:`, error);
    return null;
  }
};

/**
 * Uploads a new document associated with a case
 * @param caseId
 * @param formData
 * @returns
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
        headers: { "Content-Type": "multipart/form-data" },
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
 * Deletes a document from the system
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

/**
 * Obtiene el último documento radicado para un caso
 * @param caseId ID del caso
 * @returns Documento radicado o null si no existe
 */
export const getLatestRadicadoDocument = async (
  caseId: number
): Promise<DocumentResponse | null> => {
  try {
    logger.info(`Obteniendo último documento radicado para el caso ${caseId}`);
    // Usar el nuevo endpoint con tipo=Radicado
    const documents = await getDocumentsByCaseIdAndType(caseId, 'Radicado');
    
    // Retornar el documento más reciente
    if (documents && documents.length > 0) {
      // Ordenar por fecha y tomar el primero
      return documents.sort((a, b) => 
        new Date(b.fecha_subida || b.fecha_asigna).getTime() - 
        new Date(a.fecha_subida || a.fecha_asigna).getTime()
      )[0];
    }
    return null;
  } catch (error) {
    logger.error(`Error al obtener último documento radicado para el caso ${caseId}:`, error);
    return null;
  }
};
