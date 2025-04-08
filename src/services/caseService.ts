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
  setCachedItem
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

type CaseWithCitizen = Cases & { ciudadano: Citizen };
type CasesPromise = Promise<CaseWithCitizen[]>;

// Constantes para las cachés
const CASES_CACHE = 'cases';
const HISTORY_CACHE = 'caseHistory';
const CITIZEN_CACHE = 'citizens';

// Tiempo de vida para cada tipo de caché
const CASES_TTL = 5 * 60 * 1000; // 5 minutos
const HISTORY_TTL = 10 * 60 * 1000; // 10 minutos
const CITIZENS_TTL = 15 * 60 * 1000; // 15 minutos

/**
 * Obtiene todos los casos para el dashboard
 */
export const fetchAllCasesDashboard = async (): Promise<CaseWithCitizen[]> => {
  try {
    return await getCollectionWithCache<CaseWithCitizen>(
      CASES_CACHE,
      async () => {
        logger.debug("Obteniendo todos los casos del dashboard");
        return await get<Cases[]>('casos');
      },
      caseItem => caseItem.id_caso,
      CASES_TTL
    );
  } catch (error) {
    logger.error("Error al obtener todos los casos:", error);
    return [];
  }
};

/**
 * Obtiene todos los casos con datos de ciudadano y usuarios asignados
 */
export const fetchAllCases = async (): Promise<CaseWithCitizen[]> => {
  try {
    // Primero obtenemos los casos desde la caché o la API
    const cases = await getCollectionWithCache<Cases>(
      CASES_CACHE,
      async () => {
        logger.debug("Obteniendo todos los casos");
        return await get<Cases[]>('casos');
      },
      caseItem => caseItem.id_caso,
      CASES_TTL
    );

    // Si no hay casos, devolvemos un array vacío
    if (!cases || cases.length === 0) {
      return [];
    }

    // Creamos un Map para agrupar los IDs únicos de ciudadanos
    const uniqueCitizenIds = new Set(cases.map(c => c.id_ciudadano));
    
    // Obtenemos todos los ciudadanos únicos en una sola operación
    const citizensPromises = Array.from(uniqueCitizenIds).map(id => 
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
    
    // Obtenemos todos los ciudadanos en paralelo
    const citizens = await Promise.all(citizensPromises);
    
    // Creamos un Map de ciudadanos para acceso rápido
    const citizenMap = new Map();
    citizens.forEach(citizen => {
      if (citizen) {
        citizenMap.set(citizen.id_ciudadano, citizen);
      }
    });

    // Combinamos los casos con sus ciudadanos
    const casesWithData = cases.map(caseItem => {
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
 * Obtiene un caso específico por ID junto con sus datos relacionados
 * @param id ID del caso a obtener
 * @returns El caso con datos de ciudadano o null si no se encuentra
 */
export const fetchCaseById = async (
  id: number
): Promise<CaseWithCitizen | null> => {
  try {
    // Obtener el caso con caché
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

    // Obtener el ciudadano relacionado con caché
    const ciudadano = await getWithCache<Citizen>(
      CITIZEN_CACHE,
      caseData.id_ciudadano,
      async () => {
        logger.debug(`Obteniendo ciudadano ${caseData.id_ciudadano} para caso ${id}`);
        return await get<Citizen>(`ciudadanos/${caseData.id_ciudadano}`);
      },
      CITIZENS_TTL
    );
    
    // Inicializar notas_list si no existe
    if (!caseData.notas_list) {
      caseData.notas_list = [];
    } else if (caseData.notas_list.length > 0) {
      // Enriquecer las notas con información de usuario
      caseData.notas_list = await enrichNotesWithUserInfo(caseData.notas_list);
    }
    
    // Inicializar documentos si no existe
    if (!caseData.documentos) {
      caseData.documentos = [];
    }

    // Combinar el caso con los datos del ciudadano
    return { ...caseData, ciudadano };
  } catch (error) {
    logger.error(`Error al obtener caso ${id}:`, error);
    return null;
  }
};

/**
 * Obtiene un caso específico por ID directamente de la API sin usar caché
 * @param id ID del caso a obtener
 * @returns El caso con datos de ciudadano o null si no se encuentra
 */
export const fetchCaseByIdFresh = async (
  id: number
): Promise<CaseWithCitizen | null> => {
  try {
    logger.debug(`Obteniendo caso ${id} (fresh)`);
    
    // Obtener el caso directamente, sin usar caché
    const caseData = await get<Cases>(`casos/${id}`);
    
    if (!caseData) {
      logger.warn(`Caso con ID ${id} no encontrado`);
      return null;
    }
    
    // Obtener el ciudadano relacionado directamente
    logger.debug(`Obteniendo ciudadano ${caseData.id_ciudadano} para caso ${id} (fresh)`);
    const ciudadano = await get<Citizen>(`ciudadanos/${caseData.id_ciudadano}`);
    
    // Inicializar notas_list si no existe
    if (!caseData.notas_list) {
      caseData.notas_list = [];
    } else if (caseData.notas_list.length > 0) {
      // Enriquecer las notas con información de usuario
      caseData.notas_list = await enrichNotesWithUserInfo(caseData.notas_list);
    }
    
    // Inicializar documentos si no existe
    if (!caseData.documentos) {
      caseData.documentos = [];
    }
    
    // Actualizar la caché con los datos nuevos
    setCachedItem(CASES_CACHE, id, caseData);
    
    // Combinar el caso con los datos del ciudadano
    return { ...caseData, ciudadano };
  } catch (error) {
    logger.error(`Error al obtener caso ${id} (fresh):`, error);
    return null;
  }
};

/**
 * Obtiene todos los casos para un ciudadano específico
 * @param citizenId ID del ciudadano
 * @returns Promise con array de casos pertenecientes al ciudadano
 */
export const fetchCasesByCitizenId = async (
  citizenId: number
): CasesPromise => {
  try {
    // Obtener todos los casos (con caché)
    const allCases = await fetchAllCasesDashboard();

    // Filtrar casos por ID de ciudadano
    const citizenCases = allCases.filter(
      (caseItem) => caseItem.id_ciudadano === citizenId
    );

    // Obtener datos del ciudadano una sola vez (con caché)
    const ciudadano = await getWithCache<Citizen>(
      CITIZEN_CACHE,
      citizenId,
      async () => {
        logger.debug(`Obteniendo ciudadano ${citizenId}`);
        return await get<Citizen>(`ciudadanos/${citizenId}`);
      },
      CITIZENS_TTL
    );

    // Añadir los datos del ciudadano a cada caso
    return citizenCases.map((caseItem) => ({ ...caseItem, ciudadano }));
  } catch (error) {
    logger.error(`Error al obtener casos para el ciudadano ${citizenId}:`, error);
    return [];
  }
};

/**
 * Obtiene registros de historial para un caso específico
 * @param caseId ID del caso para obtener historial
 * @returns Promise con array de registros de historial relacionados con el caso
 */
export const fetchCaseHistory = async (
  caseId: number
): Promise<CaseHistoryLog[]> => {
  try {
    // Obtener todos los registros de historial (con caché)
    const allHistoryLogs = await getCollectionWithCache<CaseHistoryLog>(
      HISTORY_CACHE,
      async () => {
        logger.debug("Obteniendo todos los registros de historial");
        return await get<CaseHistoryLog[]>('historial');
      },
      log => log.id_historial,
      HISTORY_TTL
    );

    // Filtrar logs por ID de caso
    const caseHistoryLogs = allHistoryLogs.filter(
      (log) => log.id_caso === caseId
    );

    // Ordenar logs por fecha (más recientes primero)
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
 * Obtiene todos los usuarios asignados a un caso específico
 * @param caseId ID del caso
 * @returns Promise con array de usuarios asignados al caso
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
 * Obtiene todos los casos asignados a un usuario específico
 * @param userId ID del usuario
 * @returns Promise con array de casos asignados al usuario
 */
export const fetchCasesByUserId = async (userId: number): CasesPromise => {
  try {
    // Obtener casos por usuario
    const userCases = await get<Cases[]>(`usuarios/${userId}/casos/`);

    // Si no hay casos, devolvemos un array vacío
    if (!userCases || userCases.length === 0) {
      return [];
    }

    // Crear un Set con los IDs únicos de ciudadanos
    const uniqueCitizenIds = new Set(userCases.map(c => c.id_ciudadano));
    
    // Obtener todos los ciudadanos únicos en paralelo
    const citizensPromises = Array.from(uniqueCitizenIds).map(id => 
      getWithCache<Citizen>(
        CITIZEN_CACHE,
        id,
        async () => {
          logger.debug(`Obteniendo ciudadano ${id} para casos de usuario ${userId}`);
          return await get<Citizen>(`ciudadanos/${id}`);
        },
        CITIZENS_TTL
      )
    );
    
    // Esperar a que todas las solicitudes de ciudadanos se completen
    const citizens = await Promise.all(citizensPromises);
    
    // Crear un mapa de ciudadanos para acceso rápido
    const citizenMap = new Map();
    citizens.forEach(citizen => {
      if (citizen) {
        citizenMap.set(citizen.id_ciudadano, citizen);
      }
    });

    // Combinar los casos con sus ciudadanos
    const casesWithCitizens = userCases.map(caseItem => {
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
 * Actualiza el estado de un caso específico
 * @param id ID del caso a actualizar
 * @param estado Nuevo estado del caso
 * @returns true si el caso se actualizó correctamente, false en caso contrario
 */
export const updateCaseStatus = async (
  id: number,
  estado: string
): Promise<boolean> => {
  try {
    logger.info(`Actualizando estado del caso ${id} a "${estado}"`);
    
    // Validar que el estado sea válido
    const validStatuses = [
      "Acción necesaria", 
      "No aprobado", 
      "Seguimiento",
      "Pendiente",
      "Revisar tutela",
      "Radicar",
      "Espera del juez"
    ];
    
    if (!validStatuses.includes(estado)) {
      logger.warn(`Estado "${estado}" no válido para el caso ${id}`);
      return false;
    }
    
    // Realizar la solicitud PUT con solo el estado
    await put<Cases>(`casos/${id}`, { estado });
    
    // Invalidar cachés de forma más agresiva
    invalidateCacheItem(CASES_CACHE, id);
    invalidateCache(CASES_CACHE); // Invalidar colección completa
    invalidateCache(`${CASES_CACHE}_usuarios_${id}`);
    
    logger.info(`Estado del caso ${id} actualizado correctamente a "${estado}"`);
    return true;
  } catch (error) {
    logger.error(`Error al actualizar estado del caso ${id}:`, error);
    return false;
  }
};

/**
 * Elimina un caso específico por ID
 * @param id ID del caso a eliminar
 * @returns true si el caso se eliminó correctamente, false en caso contrario
 */
export const deleteCaseById = async (id: number): Promise<boolean> => {
  try {
    // Eliminar el caso
    await del<any>(`casos/${id}`);
    
    // Invalidar cachés relacionadas con el caso
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
 * Elimina múltiples casos por sus IDs
 * @param ids Array de IDs de casos a eliminar
 * @returns true si todos los casos se eliminaron correctamente, false en caso contrario
 */
export const deleteCasesByIds = async (ids: number[]): Promise<boolean> => {
  if (ids.length === 0) {
    logger.warn("No se proporcionaron IDs de casos para eliminar");
    return true;
  }

  try {
    // Crear un array de promesas para eliminar cada caso
    const deletePromises = ids.map(id => deleteCaseById(id));
    
    // Ejecutar todas las eliminaciones y obtener resultados
    const results = await batchRequests(deletePromises, false);
    
    // Verificar si hay errores
    const success = results.length === ids.length && results.every(Boolean);
    
    if (!success) {
      logger.warn(`No se pudieron eliminar todos los casos: ${results.length} de ${ids.length} exitosos`);
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
 * Asigna un usuario a un caso
 * @param caseId ID del caso
 * @param userId ID del usuario
 * @param role Rol del usuario (estudiante, docente, monitor)
 * @returns true si la asignación fue exitosa, false en caso contrario
 */
export const assignUserToCase = async (
  caseId: number,
  userId: number,
  role: string
): Promise<boolean> => {
  try {
    logger.info(`Asignando usuario ${userId} como ${role} al caso ${caseId}`);
    
    // Primero obtenemos las asignaciones actuales para verificar si ya existe alguien con este rol
    const currentUsers = await fetchUsersByCaseId(caseId);
    const existingAssignment = currentUsers.find(user => user.rol === role);
    
    // Si existe una asignación con el mismo rol, la eliminamos primero
    if (existingAssignment) {
      logger.info(`Eliminando asignación existente: caso ${caseId}, usuario ${existingAssignment.id_usuario}, rol ${role}`);
      
      try {
        await del(`casos-usuarios/${existingAssignment.id_usuario}/${caseId}`);
      } catch (deleteError) {
        logger.error(`Error al eliminar asignación existente: ${deleteError}`);
        // Continuamos con la nueva asignación incluso si la eliminación falla
      }
    }
    
    // Realizar la solicitud POST para la asignación
    await post<any>('casos-usuarios', { 
      id_caso: caseId, 
      id_usuario: userId,
      rol: role 
    });
    
    // Invalidar cachés relacionadas
    invalidateCacheItem(CASES_CACHE, caseId);
    invalidateCache(`${CASES_CACHE}_usuarios_${caseId}`);
    
    logger.info(`Usuario ${userId} asignado correctamente como ${role} al caso ${caseId}`);
    return true;
  } catch (error) {
    logger.error(`Error al asignar usuario ${userId} al caso ${caseId}:`, error);
    return false;
  }
};

/**
 * Updates the calification of a case
 * @param id ID of the case to update
 * @param calification The calification value to set
 * @returns true if the calification was updated successfully, false otherwise
 */
export const updateCaseCalification = async (
  id: number,
  calification: string
): Promise<boolean> => {
  try {
    logger.info(`Actualizando calificación del caso ${id} a "${calification}"`);
    
    // Validate the calification
    const calificationNumber = parseFloat(calification);
    if (isNaN(calificationNumber) || calificationNumber < 0 || calificationNumber > 5) {
      logger.warn(`Calificación "${calification}" no válida para el caso ${id}`);
      return false;
    }
    
    // Convert the floating-point number to an integer
    // API expects an integer, so we'll convert the 0-5 scale to 0-50 to preserve one decimal place
    const calificationAsInteger = Math.round(calificationNumber * 10);
    
    // Perform the PUT request with the integer calification
    await put<Cases>(`casos/${id}`, { calificacion: calificationAsInteger });
    
    // Invalidate caches
    invalidateCacheItem(CASES_CACHE, id);
    invalidateCache(CASES_CACHE); // Invalidate entire collection
    
    logger.info(`Calificación del caso ${id} actualizada correctamente a "${calification}" (valor entero: ${calificationAsInteger})`);
    return true;
  } catch (error) {
    logger.error(`Error al actualizar calificación del caso ${id}:`, error);
    return false;
  }
};
