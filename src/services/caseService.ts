import { del, batchRequests } from "@/utils/apiUtils";
import {
  invalidateCacheItem,
  invalidateCache,
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

// Constants for the caches
const CASES_CACHE = "cases";

/**
 * Deletes a specific case by ID
 * @param id
 * @returns
 */
export const deleteCaseById = async (id: number): Promise<boolean> => {
  try {
    await del<any>(`casos/${id}`);

    invalidateCacheItem(CASES_CACHE, id);
    invalidateCache(`${CASES_CACHE}_usuarios_${id}`);

    logger.info(`Caso ${id} eliminado correctamente`);
    return true;
  } catch (error) {
    logger.error(`Error al eliminar caso ${id}:`, error);
    return false;
  }
};

/**
 * Deletes multiple cases by their IDs
 * @param ids
 * @returns
 */
export const deleteCasesByIds = async (ids: number[]): Promise<boolean> => {
  if (ids.length === 0) {
    logger.warn("No se proporcionaron IDs de casos para eliminar");
    return true;
  }

  try {
    const deletePromises = ids.map((id) => deleteCaseById(id));

    const results = await batchRequests(deletePromises, false);

    const success = results.length === ids.length && results.every(Boolean);

    if (!success) {
      logger.warn(
        `No se pudieron eliminar todos los casos: ${results.length} de ${ids.length} exitosos`
      );
    } else {
      logger.info(`${ids.length} casos eliminados correctamente`);
    }

    return success;
  } catch (error) {
    logger.error("Error inesperado al eliminar casos:", error);
    return false;
  }
};
