"use server";

import { Citizen } from "@/types/citizens";
import { Cases } from "@/types/cases";
import { get, del, batchRequests } from "@/utils/apiUtils";
import {
  getWithCache,
  invalidateCacheItem,
  invalidateCache,
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

type CaseWithCitizen = Cases & { ciudadano: Citizen };
type CasesPromise = Promise<CaseWithCitizen[]>;

// Constants for the caches
const CASES_CACHE = "cases";
const CITIZEN_CACHE = "citizens";

// Time to live for each type of cache
const CASES_TTL = 5 * 60 * 1000;
const CITIZENS_TTL = 15 * 60 * 1000;

/**
 * Gets all users assigned to a specific case
 * @param caseId
 * @returns
 */
export const fetchUsersByCaseId = async (caseId: number) => {
  try {
    return await getWithCache<any[]>(
      `${CASES_CACHE}_usuarios_${caseId}`,
      caseId,
      async () => {
        logger.debug(`Obteniendo usuarios asignados al caso ${caseId}`);
        return await get<any[]>(`casos/${caseId}/usuarios/`);
      },
      CASES_TTL
    );
  } catch (error) {
    logger.error(`Error al obtener usuarios para el caso ${caseId}:`, error);
    return [];
  }
};

/**
 * Gets all cases assigned to a specific user
 * @param userId
 * @returns
 */
export const fetchCasesByUserId = async (userId: number): CasesPromise => {
  try {
    const userCases = await get<Cases[]>(`usuarios/${userId}/casos/`);

    if (!userCases || userCases.length === 0) {
      return [];
    }

    const uniqueCitizenIds = new Set(userCases.map((c) => c.id_ciudadano));

    const citizensPromises = Array.from(uniqueCitizenIds).map((id) =>
      getWithCache<Citizen>(
        CITIZEN_CACHE,
        id,
        async () => {
          logger.debug(
            `Obteniendo ciudadano ${id} para casos de usuario ${userId}`
          );
          return await get<Citizen>(`ciudadanos/${id}`);
        },
        CITIZENS_TTL
      )
    );

    const citizens = await Promise.all(citizensPromises);

    const citizenMap = new Map();
    citizens.forEach((citizen) => {
      if (citizen) {
        citizenMap.set(citizen.id_ciudadano, citizen);
      }
    });

    const casesWithCitizens = userCases.map((caseItem) => {
      const ciudadano = citizenMap.get(caseItem.id_ciudadano);
      return { ...caseItem, ciudadano };
    });

    return casesWithCitizens;
  } catch (error) {
    logger.error(`Error al obtener casos para el usuario ${userId}:`, error);
    return [];
  }
};

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
