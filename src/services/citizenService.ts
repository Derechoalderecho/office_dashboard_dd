"use server";

import { Citizen } from "@/types/citizens";
import { get, post, put, del } from "@/utils/apiUtils";
import { 
  getWithCache, 
  getCollectionWithCache,
  invalidateCacheItem,
  invalidateCache
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

// Nombre de la caché para ciudadanos
const CITIZEN_CACHE = 'citizens';

// TTL para la caché de ciudadanos (15 minutos)
const CITIZENS_TTL = 15 * 60 * 1000;

/**
 * Obtiene todos los ciudadanos registrados en el sistema
 */
export const fetchAllCitizens = async (): Promise<Citizen[]> => {
  try {
    return await getCollectionWithCache<Citizen>(
      CITIZEN_CACHE,
      async () => {
        logger.debug('Obteniendo todos los ciudadanos');
        return await get<Citizen[]>('ciudadanos');
      },
      citizen => citizen.id_ciudadano,
      CITIZENS_TTL
    );
  } catch (error) {
    logger.error("Error al obtener todos los ciudadanos:", error);
    return [];
  }
};

/**
 * Obtiene los detalles de un ciudadano específico
 * @param id ID del ciudadano
 * @returns Detalles del ciudadano o null si no se encuentra
 */
export const fetchCitizenDetails = async (
  id: string
): Promise<Citizen | null> => {
  try {
    return await getWithCache<Citizen>(
      CITIZEN_CACHE,
      id,
      async () => {
        logger.debug(`Obteniendo detalles del ciudadano ${id}`);
        return await get<Citizen>(`ciudadanos/${id}`);
      },
      CITIZENS_TTL
    );
  } catch (error) {
    logger.error(`Error al obtener detalles del ciudadano ${id}:`, error);
    return null;
  }
};

/**
 * Crea un nuevo ciudadano en el sistema
 * @param citizenData Datos del ciudadano a crear
 * @returns El ciudadano creado o null si ocurrió un error
 */
export const createCitizen = async (citizenData: Omit<Citizen, 'id_ciudadano'>): Promise<Citizen | null> => {
  try {
    logger.info('Creando nuevo ciudadano');
    
    const createdCitizen = await post<Citizen>('ciudadanos', citizenData);
    
    // Invalidar la caché de ciudadanos al crear uno nuevo
    invalidateCache(CITIZEN_CACHE);
    
    logger.info(`Ciudadano creado exitosamente: ID=${createdCitizen.id_ciudadano}`);
    return createdCitizen;
  } catch (error) {
    logger.error('Error al crear ciudadano:', error);
    return null;
  }
};

/**
 * Actualiza los datos de un ciudadano existente
 * @param id ID del ciudadano a actualizar
 * @param citizenData Datos actualizados del ciudadano
 * @returns El ciudadano actualizado o null si ocurrió un error
 */
export const updateCitizen = async (
  id: number,
  citizenData: Partial<Citizen>
): Promise<Citizen | null> => {
  try {
    logger.info(`Actualizando ciudadano ${id}`);
    
    const updatedCitizen = await put<Citizen>(`ciudadanos/${id}`, citizenData);
    
    // Invalidar solo este ciudadano en la caché
    invalidateCacheItem(CITIZEN_CACHE, id);
    
    logger.info(`Ciudadano ${id} actualizado exitosamente`);
    return updatedCitizen;
  } catch (error) {
    logger.error(`Error al actualizar ciudadano ${id}:`, error);
    return null;
  }
};

/**
 * Elimina un ciudadano del sistema
 * @param id ID del ciudadano a eliminar
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export const deleteCitizen = async (id: number): Promise<boolean> => {
  try {
    logger.info(`Eliminando ciudadano ${id}`);
    
    await del<any>(`ciudadanos/${id}`);
    
    // Invalidar este ciudadano en la caché
    invalidateCacheItem(CITIZEN_CACHE, id);
    
    logger.info(`Ciudadano ${id} eliminado exitosamente`);
    return true;
  } catch (error) {
    logger.error(`Error al eliminar ciudadano ${id}:`, error);
    return false;
  }
};
