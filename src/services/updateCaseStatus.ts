"use server";

import { Cases } from "@/types/cases";
import { put } from "@/utils/apiUtils";
import {
  invalidateCacheItem,
  invalidateCache,
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

// Constants for the caches
const CASES_CACHE = "cases";

/**
 * Updates the status of a specific case
 * @param id
 * @param estado_actual
 * @returns
 */
export const updateCaseStatus = async (
  id: number,
  estado_actual: string
): Promise<boolean> => {
  try {
    logger.info(`Actualizando estado del caso ${id} a "${estado_actual}"`);

    // Validate that the status is valid
    const validStatuses = [
      "Acción necesaria",
      "No aprobado",
      "Viabilidad",
      "Seguimiento",
      "Pendiente",
      "Revisar tutela",
      "Radicar",
      "Espera del juez",
    ];

    if (!validStatuses.includes(estado_actual)) {
      logger.warn(`Estado "${estado_actual}" no válido para el caso ${id}`);
      return false;
    }

    await put<Cases>(`casos/${id}`, { estado_actual });

    // Invalidate caches more aggressively
    invalidateCacheItem(CASES_CACHE, id);
    invalidateCache(CASES_CACHE); // Invalidate entire collection
    invalidateCache(`${CASES_CACHE}_usuarios_${id}`);

    logger.info(
      `Estado del caso ${id} actualizado correctamente a "${estado_actual}"`
    );
    return true;
  } catch (error) {
    logger.error(`Error al actualizar estado del caso ${id}:`, error);
    return false;
  }
};