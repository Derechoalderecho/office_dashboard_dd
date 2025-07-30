//Servicio para actualizar el estado del caso

import { Cases, CompleteCaseData } from "@/types/cases";
import { put, post, get } from "@/utils/apiUtils";
import {
  invalidateCacheItem,
  invalidateCache,
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

// Constants for the caches
const CASES_CACHE = "cases";
const HISTORY_CACHE = "caseHistory";

/**
 * Updates the status of a specific case and records the change in history
 * @param id - Case ID
 * @param estado_actual - New status
 * @param userId - ID of the user making the change
 * @returns Promise<boolean> indicating success or failure
 */
export const updateCaseStatus = async (
  id: number,
  estado_actual: string,
  userId: number
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

    // Get the current case to know the previous status
    let currentCase;
    try {
      currentCase = await get<Cases | CompleteCaseData>(`casos/${id}`);
      logger.debug(`Caso obtenido para ID ${id}: ${JSON.stringify(currentCase)}`);
    } catch (fetchError) {
      logger.error(`Error al obtener el estado actual del caso ${id}:`, fetchError);
      return false;
    }

    if (!currentCase) {
      logger.error(`No se pudo obtener el caso ${id} para actualizar su estado`);
      return false;
    }

    // Determinar el estado anterior basado en la estructura del caso
    // Puede venir como 'estado' (Cases) o 'estado_actual' (CompleteCaseData)
    let estado_anterior: string | undefined;
    
    if ('estado' in currentCase && currentCase.estado) {
      estado_anterior = currentCase.estado;
      logger.debug(`Usando campo 'estado' para caso ${id}: '${estado_anterior}'`);
    } else if ('estado_actual' in currentCase && currentCase.estado_actual) {
      estado_anterior = currentCase.estado_actual;
      logger.debug(`Usando campo 'estado_actual' para caso ${id}: '${estado_anterior}'`);
    } else {
      logger.error(`No se pudo determinar el estado anterior para el caso ${id}. Propiedades disponibles: ${Object.keys(currentCase).join(', ')}`);
      return false;
    }
    
    logger.debug(`Estado anterior para caso ${id}: '${estado_anterior}'`);

    // Update the case status
    await put<Cases>(`casos/${id}`, { estado_actual });

    // Record the status change in history
    try {
      // Verificar que tenemos un estado anterior válido
      if (!estado_anterior) {
        logger.error(`No se pudo obtener el estado anterior para el caso ${id}. Estado obtenido: ${JSON.stringify(currentCase)}`);
        return false;
      }
      
      const historyData = {
        id_caso: id,
        id_usuario: userId,
        estado_actual,
        estado_anterior,
        observaciones: "string"
      };

      logger.debug(`Registrando cambio de estado en historial: ${JSON.stringify(historyData)}`);
      await post<any>("historial/", historyData);
      logger.info(`Cambio de estado registrado en historial para caso ${id}`);
    } catch (historyError) {
      logger.error(`Error al registrar historial para caso ${id}:`, historyError);
      // No devolvemos false aquí porque el estado ya se actualizó, pero registramos el error
      // para poder depurar el problema
    }

    // Invalidate caches more aggressively
    invalidateCacheItem(CASES_CACHE, id);
    invalidateCache(CASES_CACHE); // Invalidate entire collection
    invalidateCache(`${CASES_CACHE}_usuarios_${id}`);
    invalidateCache(HISTORY_CACHE); // Invalidate history cache

    logger.info(
      `Estado del caso ${id} actualizado correctamente a "${estado_actual}"`
    );
    return true;
  } catch (error) {
    logger.error(`Error al actualizar estado del caso ${id}:`, error);
    return false;
  }
};