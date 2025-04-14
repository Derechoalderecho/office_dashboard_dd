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

const REVIEWER_CACHE = 'reviewers';

const REVIEWER_TTL = 15 * 60 * 1000;

/**
 * Gets the details of a specific reviewer
 * @param id
 * @returns
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
 * Gets all the registered reviewers in the system
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
 * Creates a new reviewer in the system
 * @param reviewerData
 * @returns
 */
export const createReviewer = async (reviewerData: Omit<Reviewers, 'id'>): Promise<Reviewers | null> => {
  try {
    logger.info('Creando nuevo revisor');
    
    const createdReviewer = await post<Reviewers>('reviewers', reviewerData);
    
    invalidateCache(REVIEWER_CACHE);
    
    logger.info(`Revisor creado exitosamente: ID=${createdReviewer.id}`);
    return createdReviewer;
  } catch (error) {
    logger.error('Error al crear revisor:', error);
    return null;
  }
};

/**
 * Updates the data of an existing reviewer
 * @param id
 * @param reviewerData
 * @returns
 */
export const updateReviewer = async (
  id: string,
  reviewerData: Partial<Reviewers>
): Promise<Reviewers | null> => {
  try {
    logger.info(`Actualizando revisor ${id}`);
    
    const updatedReviewer = await put<Reviewers>(`reviewers/${id}`, reviewerData);
    
    invalidateCacheItem(REVIEWER_CACHE, id);
    
    logger.info(`Revisor ${id} actualizado exitosamente`);
    return updatedReviewer;
  } catch (error) {
    logger.error(`Error al actualizar revisor ${id}:`, error);
    return null;
  }
};

/**
 * Deletes a reviewer from the system
 * @param id
 * @returns true if it was deleted correctly, false otherwise
 */
export const deleteReviewer = async (id: string): Promise<boolean> => {
  try {
    logger.info(`Eliminando revisor ${id}`);
    
    await del<any>(`reviewers/${id}`);
    
    invalidateCacheItem(REVIEWER_CACHE, id);
    
    logger.info(`Revisor ${id} eliminado exitosamente`);
    return true;
  } catch (error) {
    logger.error(`Error al eliminar revisor ${id}:`, error);
    return false;
  }
};