"use server";

import { Reviewers } from "@/types/reviewers";
import { get, post, put, del } from "@/utils/apiUtils";
import { 
  getWithCache, 
  getCollectionWithCache,
  invalidateCacheItem,
  invalidateCache
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

// Nombre de la caché para reviewers
const REVIEWER_CACHE = 'reviewers';

// TTL para la caché de reviewers (15 minutos)
const REVIEWER_TTL = 15 * 60 * 1000;

/**
 * Obtiene los detalles de un revisor específico
 * @param id ID del revisor
 * @returns Detalles del revisor o null si no se encuentra
 */
export const fetchReviewerDetails = async (id: string): Promise<Reviewers | null> => {
  try {
    return await getWithCache<Reviewers>(
      REVIEWER_CACHE,
      id,
      async () => {
        logger.debug(`Obteniendo detalles del revisor ${id}`);
        return await get<Reviewers>(`reviewers/${id}`);
      },
      REVIEWER_TTL
    );
  } catch (error) {
    logger.error(`Error al obtener detalles del revisor ${id}:`, error);
    return null;
  }
};

/**
 * Obtiene todos los revisores registrados en el sistema
 */
export const fetchAllReviewers = async (): Promise<Reviewers[]> => {
  try {
    return await getCollectionWithCache<Reviewers>(
      REVIEWER_CACHE,
      async () => {
        logger.debug('Obteniendo todos los revisores');
        return await get<Reviewers[]>('reviewers');
      },
      reviewer => reviewer.id,
      REVIEWER_TTL
    );
  } catch (error) {
    logger.error("Error al obtener todos los revisores:", error);
    return [];
  }
};

/**
 * Crea un nuevo revisor en el sistema
 * @param reviewerData Datos del revisor a crear
 * @returns El revisor creado o null si ocurrió un error
 */
export const createReviewer = async (reviewerData: Omit<Reviewers, 'id'>): Promise<Reviewers | null> => {
  try {
    logger.info('Creando nuevo revisor');
    
    const createdReviewer = await post<Reviewers>('reviewers', reviewerData);
    
    // Invalidar la caché de revisores al crear uno nuevo
    invalidateCache(REVIEWER_CACHE);
    
    logger.info(`Revisor creado exitosamente: ID=${createdReviewer.id}`);
    return createdReviewer;
  } catch (error) {
    logger.error('Error al crear revisor:', error);
    return null;
  }
};

/**
 * Actualiza los datos de un revisor existente
 * @param id ID del revisor a actualizar
 * @param reviewerData Datos actualizados del revisor
 * @returns El revisor actualizado o null si ocurrió un error
 */
export const updateReviewer = async (
  id: string,
  reviewerData: Partial<Reviewers>
): Promise<Reviewers | null> => {
  try {
    logger.info(`Actualizando revisor ${id}`);
    
    const updatedReviewer = await put<Reviewers>(`reviewers/${id}`, reviewerData);
    
    // Invalidar solo este revisor en la caché
    invalidateCacheItem(REVIEWER_CACHE, id);
    
    logger.info(`Revisor ${id} actualizado exitosamente`);
    return updatedReviewer;
  } catch (error) {
    logger.error(`Error al actualizar revisor ${id}:`, error);
    return null;
  }
};

/**
 * Elimina un revisor del sistema
 * @param id ID del revisor a eliminar
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export const deleteReviewer = async (id: string): Promise<boolean> => {
  try {
    logger.info(`Eliminando revisor ${id}`);
    
    await del<any>(`reviewers/${id}`);
    
    // Invalidar este revisor en la caché
    invalidateCacheItem(REVIEWER_CACHE, id);
    
    logger.info(`Revisor ${id} eliminado exitosamente`);
    return true;
  } catch (error) {
    logger.error(`Error al eliminar revisor ${id}:`, error);
    return false;
  }
};