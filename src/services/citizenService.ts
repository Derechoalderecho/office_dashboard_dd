"use server";

import { Citizen } from "@/types/citizens";
import { get, post, put, del } from "@/utils/apiUtils";
import {
  getWithCache,
  getCollectionWithCache,
  invalidateCacheItem,
  invalidateCache,
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

const CITIZEN_CACHE = "citizens";

const CITIZENS_TTL = 15 * 60 * 1000;

/**
 * Gets all registered citizens in the system
 */
export const fetchAllCitizens = async (): Promise<Citizen[]> => {
  try {
    return await getCollectionWithCache<Citizen>(
      CITIZEN_CACHE,
      async () => {
        logger.debug("Obteniendo todos los ciudadanos");
        return await get<Citizen[]>("ciudadanos");
      },
      (citizen) => citizen.id_ciudadano,
      CITIZENS_TTL
    );
  } catch (error) {
    logger.error("Error al obtener todos los ciudadanos:", error);
    return [];
  }
};

/**
 * Gets the details of a specific citizen
 * @param id
 * @returns
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
 * Creates a new citizen in the system
 * @param citizenData
 * @returns
 */
export const createCitizen = async (
  citizenData: Omit<Citizen, "id_ciudadano">
): Promise<Citizen | null> => {
  try {
    logger.info("Creando nuevo ciudadano");

    const createdCitizen = await post<Citizen>("ciudadanos", citizenData);

    invalidateCache(CITIZEN_CACHE);

    logger.info(
      `Ciudadano creado exitosamente: ID=${createdCitizen.id_ciudadano}`
    );
    return createdCitizen;
  } catch (error) {
    logger.error("Error al crear ciudadano:", error);
    return null;
  }
};

/**
 * Updates the data of an existing citizen
 * @param id
 * @param citizenData
 * @returns
 */
export const updateCitizen = async (
  id: number,
  citizenData: Partial<Citizen>
): Promise<Citizen | null> => {
  try {
    logger.info(`Actualizando ciudadano ${id}`);

    const updatedCitizen = await put<Citizen>(`ciudadanos/${id}`, citizenData);

    invalidateCacheItem(CITIZEN_CACHE, id);

    logger.info(`Ciudadano ${id} actualizado exitosamente`);
    return updatedCitizen;
  } catch (error) {
    logger.error(`Error al actualizar ciudadano ${id}:`, error);
    return null;
  }
};

/**
 * Deletes a citizen from the system
 * @param id
 * @returns
 */
export const deleteCitizen = async (id: number): Promise<boolean> => {
  try {
    logger.info(`Eliminando ciudadano ${id}`);

    await del<any>(`ciudadanos/${id}`);

    invalidateCacheItem(CITIZEN_CACHE, id);

    logger.info(`Ciudadano ${id} eliminado exitosamente`);
    return true;
  } catch (error) {
    logger.error(`Error al eliminar ciudadano ${id}:`, error);
    return false;
  }
};

/**
 * Finds a citizen by document type and number
 * @param tipo_documento 
 * @param num_documento 
 * @returns The citizen if found, null otherwise
 */
export const findCitizenByDocument = async (
  tipo_documento: string,
  num_documento: string
): Promise<Citizen | null> => {
  try {
    logger.debug(`Buscando ciudadano con documento ${tipo_documento} ${num_documento}`);
    
    // Get all citizens first (this uses cache if available)
    const allCitizens = await fetchAllCitizens();
    
    // Find the citizen with matching document type and number
    const citizen = allCitizens.find(
      (c) => c.tipo_documento === tipo_documento && c.num_documento === num_documento
    );
    
    return citizen || null;
  } catch (error) {
    logger.error(`Error al buscar ciudadano por documento ${tipo_documento} ${num_documento}:`, error);
    return null;
  }
};
