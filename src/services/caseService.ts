"use server";

import { Citizen } from "@/types/citizens";
import { Cases, CaseHistoryLog } from "@/types/cases";
import { enrichNotesWithUserInfo } from "@/services/noteService";
import { get, del, batchRequests } from "@/utils/apiUtils";
import { 
  getWithCache, 
  getCollectionWithCache,
  invalidateCacheItem,
  invalidateCache
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
    // Primero obtenemos los casos
    const cases = await getCollectionWithCache<Cases>(
      CASES_CACHE,
      async () => {
        logger.debug("Obteniendo todos los casos");
        return await get<Cases[]>('casos');
      },
      caseItem => caseItem.id_caso,
      CASES_TTL
    );

    // Luego usamos Promise.all para obtener los datos relacionados en paralelo
    const casesWithData = await Promise.all(
      cases.map(async (caseItem) => {
        // Obtener datos del ciudadano con caché
        const ciudadano = await getWithCache<Citizen>(
          CITIZEN_CACHE,
          caseItem.id_ciudadano,
          async () => {
            logger.debug(`Obteniendo ciudadano ${caseItem.id_ciudadano}`);
            return await get<Citizen>(`ciudadanos/${caseItem.id_ciudadano}`);
          },
          CITIZENS_TTL
        );

        // Obtener usuarios asignados con caché
        const usuarios = await getWithCache<any[]>(
          `${CASES_CACHE}_usuarios_${caseItem.id_caso}`,
          caseItem.id_caso,
          async () => {
            logger.debug(`Obteniendo usuarios para caso ${caseItem.id_caso}`);
            return await get<any[]>(`casos/${caseItem.id_caso}/usuarios/`);
          },
          CASES_TTL
        );

        return { ...caseItem, ciudadano, usuarios };
      })
    );

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
    // Obtener casos por usuario (sin caché, ya que cambia con frecuencia)
    const userCases = await get<Cases[]>(`usuarios/${userId}/casos/`);

    // Obtener datos de ciudadano para cada caso en paralelo
    const casesWithCitizens = await Promise.all(
      userCases.map(async (caseItem) => {
        const ciudadano = await getWithCache<Citizen>(
          CITIZEN_CACHE,
          caseItem.id_ciudadano,
          async () => {
            logger.debug(`Obteniendo ciudadano ${caseItem.id_ciudadano} para caso ${caseItem.id_caso}`);
            return await get<Citizen>(`ciudadanos/${caseItem.id_ciudadano}`);
          },
          CITIZENS_TTL
        );
        return { ...caseItem, ciudadano };
      })
    );

    return casesWithCitizens;
  } catch (error) {
    logger.error(`Error al obtener casos para el usuario ${userId}:`, error);
    return [];
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
