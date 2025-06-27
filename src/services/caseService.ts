"use server";

import { Citizen } from "@/types/citizens";
import { Cases } from "@/types/cases";
import { get, del, batchRequests, put, post } from "@/utils/apiUtils";
import {
  getWithCache,
  getCollectionWithCache,
  invalidateCacheItem,
  invalidateCache,
  setCachedItem,
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

type CaseWithCitizen = Cases & { ciudadano: Citizen };
type CasesPromise = Promise<CaseWithCitizen[]>;

// Constants for the caches
const CASES_CACHE = "cases";
const HISTORY_CACHE = "caseHistory";
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

/**
 * Assigns a user to a case
 * @param caseId
 * @param userId
 * @param role
 * @returns
 */
export const assignUserToCase = async (
  caseId: number,
  userId: number,
  role: string
): Promise<boolean> => {
  // Validar parámetros de entrada
  if (!caseId || !userId || !role) {
    logger.error(
      `Parámetros inválidos para asignación: caseId=${caseId}, userId=${userId}, role=${role}`
    );
    return false;
  }

  // Verificar que el caso exista antes de intentar asignar usuarios
  try {
    const caseExists = await getWithCache(
      CASES_CACHE,
      caseId,
      async () => {
        try {
          const caseData = await get(`casos/${caseId}`);
          return caseData ? true : false;
        } catch (error) {
          return false;
        }
      },
      CASES_TTL
    );

    if (!caseExists) {
      logger.error(
        `No se puede asignar usuario ${userId} al caso ${caseId} porque el caso no existe`
      );
      return false;
    }
  } catch (error) {
    logger.error(`Error al verificar existencia del caso ${caseId}:`, error);
    // Continuamos con la asignación a pesar del error en la verificación
  }

  try {
    logger.info(`Asignando usuario ${userId} como ${role} al caso ${caseId}`);

    // PASO 1: Siempre intentar eliminar asignaciones existentes primero
    try {
      // Buscar todos los casos-usuarios para este caso
      const allCaseUsers = await get<any[]>(`casos-usuarios?id_caso=${caseId}`);
      logger.debug(`Asignaciones encontradas para caso ${caseId}: ${JSON.stringify(allCaseUsers || [])}`);
      
      // Buscar cualquier asignación que coincida con el rol (sin importar el usuario)
      const matchingRoleAssignments = allCaseUsers?.filter(cu => 
        (cu.rol_en_caso?.toLowerCase() === role.toLowerCase()) || 
        (cu.rol?.toLowerCase() === role.toLowerCase())
      );
      
      // Eliminar todas las asignaciones encontradas para este rol
      if (matchingRoleAssignments && matchingRoleAssignments.length > 0) {
        logger.info(`Encontradas ${matchingRoleAssignments.length} asignaciones para el rol ${role} en caso ${caseId}. Eliminando todas.`);
        
        for (const assignment of matchingRoleAssignments) {
          if (assignment.id_caso_usuario) {
            // Usar el formato de endpoint para eliminar: /caso-usuario/{id_caso_usuario}
            const deleteUrl = `caso-usuario/${assignment.id_caso_usuario}`;
            logger.debug(`Eliminando asignación: ${deleteUrl}`);
            
            try {
              await del(deleteUrl);
              logger.debug(`Asignación eliminada correctamente: ${assignment.id_caso_usuario}`);
            } catch (deleteError) {
              logger.error(`Error al eliminar asignación ${assignment.id_caso_usuario}: ${deleteError}`);
              // Continuamos con las siguientes eliminaciones a pesar del error
            }
          }
        }
      } else {
        logger.info(`No se encontraron asignaciones existentes para el rol ${role} en caso ${caseId}`);
      }
    } catch (fetchError) {
      logger.warn(`Error al buscar asignaciones existentes para el caso ${caseId}: ${fetchError}`);
      // Continuamos con la nueva asignación a pesar del error
    }

    // Crear la nueva asignación con los campos requeridos
    const assignmentData = {
      id_caso: caseId,
      id_usuario: userId,
      rol_en_caso: role.charAt(0).toUpperCase() + role.slice(1), // Primera letra en mayúscula
      status: true
    };

    logger.debug(
      `Enviando datos de asignación: ${JSON.stringify(assignmentData)}`
    );

    const response = await post<any>("casos-usuarios/", assignmentData);

    // Verificar respuesta
    if (!response) {
      logger.warn(
        `No se recibió respuesta al asignar usuario ${userId} al caso ${caseId}`
      );
    }

    // Invalidar caché para reflejar los cambios
    // 1. Invalidar el caso específico
    invalidateCacheItem(CASES_CACHE, caseId);
    
    // 2. Invalidar la caché de usuarios del caso
    invalidateCache(`${CASES_CACHE}_usuarios_${caseId}`);
    
    // 3. Invalidar la colección completa de casos para asegurar que los listados se actualicen
    invalidateCache(CASES_CACHE);
    
    // 4. Invalidar cualquier caché relacionada con el usuario
    invalidateCache(`user_cases_${userId}`);

    logger.info(
      `Usuario ${userId} asignado correctamente como ${role} al caso ${caseId}`
    );
    return true;
  } catch (error) {
    logger.error(
      `Error al asignar usuario ${userId} al caso ${caseId}:`,
      error
    );
    return false;
  }
};

/**
 * Updates the details of a specific case (pretensiones, hechos, fundamentos, entidad)
 * @param id
 * @param data
 * @returns
 */
export const updateCaseDetails = async (
  id: number,
  data: {
    pretensiones?: string;
    hechos?: string;
    fundamentos?: string;
    entidad?: string;
  }
): Promise<boolean> => {
  try {
    logger.info(`Actualizando detalles del caso ${id}`);

    await put<Cases>(`casos/${id}`, data);

    invalidateCacheItem(CASES_CACHE, id);
    invalidateCache(CASES_CACHE);

    logger.info(`Detalles del caso ${id} actualizados correctamente`);
    return true;
  } catch (error) {
    logger.error(`Error al actualizar detalles del caso ${id}:`, error);
    return false;
  }
};
