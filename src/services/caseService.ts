"use server";

import { Citizen } from "@/types/citizens";
import { Cases, CaseHistoryLog } from "@/types/cases";
import { enrichNotesWithUserInfo } from "@/services/noteService";
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
const HISTORY_TTL = 10 * 60 * 1000;
const CITIZENS_TTL = 15 * 60 * 1000;

/**
 * Gets all cases for the dashboard
 */
export const fetchAllCasesDashboard = async (): Promise<CaseWithCitizen[]> => {
  try {
    return await getCollectionWithCache<CaseWithCitizen>(
      CASES_CACHE,
      async () => {
        logger.debug("Obteniendo todos los casos del dashboard");
        return await get<Cases[]>("casos");
      },
      (caseItem) => caseItem.id_caso,
      CASES_TTL
    );
  } catch (error) {
    logger.error("Error al obtener todos los casos:", error);
    return [];
  }
};

/**
 * Gets all cases with citizen and assigned user data
 */
export const fetchAllCases = async (): Promise<CaseWithCitizen[]> => {
  try {
    const cases = await getCollectionWithCache<Cases>(
      CASES_CACHE,
      async () => {
        logger.debug("Obteniendo todos los casos");
        return await get<Cases[]>("casos");
      },
      (caseItem) => caseItem.id_caso,
      CASES_TTL
    );

    if (!cases || cases.length === 0) {
      return [];
    }

    const uniqueCitizenIds = new Set(cases.map((c) => c.id_ciudadano));

    const citizensPromises = Array.from(uniqueCitizenIds).map((id) =>
      getWithCache<Citizen>(
        CITIZEN_CACHE,
        id,
        async () => {
          logger.debug(`Obteniendo ciudadano ${id}`);
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

    const casesWithData = cases.map((caseItem) => {
      const ciudadano = citizenMap.get(caseItem.id_ciudadano);
      return { ...caseItem, ciudadano };
    });

    return casesWithData;
  } catch (error) {
    logger.error("Error al obtener los casos con datos completos:", error);
    return [];
  }
};

/**
 * Gets a specific case by ID along with its related data
 * @param id
 * @returns
 */
export const fetchCaseById = async (
  id: number
): Promise<CaseWithCitizen | null> => {
  try {
    const caseData = await getWithCache<Cases>(
      CASES_CACHE,
      id,
      async () => {
        logger.debug(`Obteniendo caso ${id}`);
        return await get<Cases>(`casos/${id}`);
      },
      CASES_TTL
    );

    if (!caseData) {
      logger.warn(`Caso con ID ${id} no encontrado`);
      return null;
    }

    const ciudadano = await getWithCache<Citizen>(
      CITIZEN_CACHE,
      caseData.id_ciudadano,
      async () => {
        logger.debug(
          `Obteniendo ciudadano ${caseData.id_ciudadano} para caso ${id}`
        );
        return await get<Citizen>(`ciudadanos/${caseData.id_ciudadano}`);
      },
      CITIZENS_TTL
    );

    if (!caseData.notas_list) {
      caseData.notas_list = [];
    } else if (caseData.notas_list.length > 0) {
      caseData.notas_list = await enrichNotesWithUserInfo(caseData.notas_list);
    }

    if (!caseData.documentos) {
      caseData.documentos = [];
    }

    return { ...caseData, ciudadano };
  } catch (error) {
    logger.error(`Error al obtener caso ${id}:`, error);
    return null;
  }
};

/**
 * Gets a specific case by ID directly from the API without using cache
 * @param id
 * @returns
 */
export const fetchCaseByIdFresh = async (
  id: number
): Promise<CaseWithCitizen | null> => {
  try {
    logger.debug(`Obteniendo caso ${id} (fresh)`);

    const caseData = await get<Cases>(`casos/${id}`);

    if (!caseData) {
      logger.warn(`Caso con ID ${id} no encontrado`);
      return null;
    }

    logger.debug(
      `Obteniendo ciudadano ${caseData.id_ciudadano} para caso ${id} (fresh)`
    );
    const ciudadano = await get<Citizen>(`ciudadanos/${caseData.id_ciudadano}`);

    if (!caseData.notas_list) {
      caseData.notas_list = [];
    } else if (caseData.notas_list.length > 0) {
      caseData.notas_list = await enrichNotesWithUserInfo(caseData.notas_list);
    }

    if (!caseData.documentos) {
      caseData.documentos = [];
    }

    setCachedItem(CASES_CACHE, id, caseData);

    return { ...caseData, ciudadano };
  } catch (error) {
    logger.error(`Error al obtener caso ${id} (fresh):`, error);
    return null;
  }
};

/**
 * Gets all cases for a specific citizen
 * @param citizenId
 * @returns
 */
export const fetchCasesByCitizenId = async (
  citizenId: number
): CasesPromise => {
  try {
    const allCases = await fetchAllCasesDashboard();

    const citizenCases = allCases.filter(
      (caseItem) => caseItem.id_ciudadano === citizenId
    );

    const ciudadano = await getWithCache<Citizen>(
      CITIZEN_CACHE,
      citizenId,
      async () => {
        logger.debug(`Obteniendo ciudadano ${citizenId}`);
        return await get<Citizen>(`ciudadanos/${citizenId}`);
      },
      CITIZENS_TTL
    );

    return citizenCases.map((caseItem) => ({ ...caseItem, ciudadano }));
  } catch (error) {
    logger.error(
      `Error al obtener casos para el ciudadano ${citizenId}:`,
      error
    );
    return [];
  }
};

/**
 * Gets the history records for a specific case
 * @param caseId
 * @returns
 */
export const fetchCaseHistory = async (
  caseId: number
): Promise<CaseHistoryLog[]> => {
  try {
    const allHistoryLogs = await getCollectionWithCache<CaseHistoryLog>(
      HISTORY_CACHE,
      async () => {
        logger.debug("Obteniendo todos los registros de historial");
        return await get<CaseHistoryLog[]>("historial");
      },
      (log) => log.id_historial,
      HISTORY_TTL
    );

    const caseHistoryLogs = allHistoryLogs.filter(
      (log) => log.id_caso === caseId
    );

    return caseHistoryLogs.sort(
      (a, b) =>
        new Date(b.fecha_cambio).getTime() - new Date(a.fecha_cambio).getTime()
    );
  } catch (error) {
    logger.error(`Error al obtener historial para el caso ${caseId}:`, error);
    return [];
  }
};

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

    // Obtener usuarios actuales asignados al caso
    let currentUsers = [];
    try {
      currentUsers = await fetchUsersByCaseId(caseId);
      console.log("currentUsers", currentUsers);
    } catch (fetchError) {
      logger.warn(
        `No se pudieron obtener usuarios actuales del caso ${caseId}: ${fetchError}`
      );
      // Continuamos con la asignación aunque no podamos obtener los usuarios actuales
    }

    logger.debug(`Buscando asignaciones existentes para rol ${role} en ${currentUsers.length} usuarios`);
    
    // Imprimir todos los roles para depuración
    currentUsers.forEach((user, index) => {
      logger.debug(`Usuario ${index}: id=${user.id_usuario}, rol=${user.rol}`);
    });
    
    // Buscar coincidencia de rol insensible a mayúsculas/minúsculas
    const existingAssignment = currentUsers.find(
      (user) => user.rol && user.rol.toLowerCase() === role.toLowerCase()
    );
    
    logger.debug(`Asignación existente encontrada para rol ${role}: ${JSON.stringify(existingAssignment || 'ninguna')}`);

    // Eliminar asignación existente si se encontró
    if (existingAssignment) {
      logger.info(
        `Eliminando asignación existente: caso ${caseId}, usuario ${existingAssignment.id_usuario}, rol ${existingAssignment.rol}`
      );

      try {
        // Asegurarnos de que la URL no tenga slash al final
        const deleteUrl = `casos-usuarios?id_caso=${caseId}&id_usuario=${existingAssignment.id_usuario}`;
        logger.debug(`URL para eliminar asignación: ${deleteUrl}`);
        
        const deleteResponse = await del(deleteUrl);
        logger.debug(`Respuesta al eliminar asignación: ${JSON.stringify(deleteResponse || 'sin respuesta')}`);
        
        // Esperar un momento para asegurar que la eliminación se complete
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (deleteError) {
        logger.error(`Error al eliminar asignación existente: ${deleteError}`);
        // Continuamos con la nueva asignación a pesar del error en la eliminación
      }
    }

    // Crear la nueva asignación
    const assignmentData = {
      id_caso: caseId,
      id_usuario: userId,
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
 * Updates the calification of a case
 * @param id
 * @param calification
 * @param criterio1
 * @param criterio2
 * @param criterio3
 * @param criterio4
 * @returns
 */
export const updateCaseCalification = async (
  id: number,
  calification: string,
  criterio1: string,
  criterio2: string,
  criterio3: string,
  criterio4: string
): Promise<boolean> => {
  try {
    logger.info(
      `Actualizando calificación del caso ${id} con criterios individuales`
    );

    // Validar calificación final
    const calificationNumber = parseFloat(calification);
    if (
      isNaN(calificationNumber) ||
      calificationNumber < 0 ||
      calificationNumber > 5
    ) {
      logger.warn(
        `Calificación "${calification}" no válida para el caso ${id}`
      );
      return false;
    }

    // Convertir calificación final a entero (multiplicado por 10)
    const calificationAsInteger = Math.round(calificationNumber * 10);

    // Validar y convertir cada criterio a su formato adecuado (decimal 0-5)
    const criterio1Number = parseFloat(criterio1);
    const criterio2Number = parseFloat(criterio2);
    const criterio3Number = parseFloat(criterio3);
    const criterio4Number = parseFloat(criterio4);

    // Validar que todos los criterios sean números válidos
    if (
      isNaN(criterio1Number) ||
      criterio1Number < 0 ||
      criterio1Number > 5 ||
      isNaN(criterio2Number) ||
      criterio2Number < 0 ||
      criterio2Number > 5 ||
      isNaN(criterio3Number) ||
      criterio3Number < 0 ||
      criterio3Number > 5 ||
      isNaN(criterio4Number) ||
      criterio4Number < 0 ||
      criterio4Number > 5
    ) {
      logger.warn(`Uno o más criterios no son válidos para el caso ${id}`);
      return false;
    }

    // Preparar los datos para actualizar
    // calificacion como entero (0-50) y los criterios como enteros (0-50)
    const updateData = {
      calificacion: calificationAsInteger,
      calificacion1: Math.round(criterio1Number * 10), // Convertir a entero (0-50)
      calificacion2: Math.round(criterio2Number * 10), // Convertir a entero (0-50)
      calificacion3: Math.round(criterio3Number * 10), // Convertir a entero (0-50)
      calificacion4: Math.round(criterio4Number * 10), // Convertir a entero (0-50)
    };

    logger.debug(
      `Datos de calificación a enviar para caso ${id}:`,
      JSON.stringify(updateData)
    );
    console.log(
      `Actualizando calificación del caso ${id} con datos:`,
      updateData
    );

    await put<Cases>(`casos/${id}`, updateData);

    // Invalidate caches
    invalidateCacheItem(CASES_CACHE, id);
    invalidateCache(CASES_CACHE);

    logger.info(
      `Calificación del caso ${id} actualizada correctamente a "${calification}" con criterios individuales`
    );
    return true;
  } catch (error) {
    logger.error(`Error al actualizar calificación del caso ${id}:`, error);
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
