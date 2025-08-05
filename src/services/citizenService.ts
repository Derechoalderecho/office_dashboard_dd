//Servicio para obtener todos los ciudadanos

import { Citizen } from "@/types/citizens";
import { get, post, put, del } from "@/utils/apiUtils";
import {
  getWithCache,
  getCollectionWithCache,
  invalidateCacheItem,
  invalidateCache,
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";
import { convertZonaToCode } from "@/utils/citizenUtils";

// Tipo para la respuesta de la API de ciudadanos
interface CitizensApiResponse {
  total: number;
  items: Citizen[];
}

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
        const response = await get<CitizensApiResponse>("ciudadanos");
        return response.items || [];
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
 * Gets the details of a specific citizen and prepares the data for use in forms
 * @param id The ID of the citizen to fetch
 * @returns The citizen object with all fields formatted for UI display
 */
export const fetchCitizenDetails = async (
  id: string
): Promise<Citizen | null> => {
  try {
    const citizen = await getWithCache<Citizen>(
      CITIZEN_CACHE,
      id,
      async () => {
        logger.debug(`Obteniendo detalles del ciudadano ${id}`);
        return await get<Citizen>(`ciudadanos/${id}`);
      },
      CITIZENS_TTL
    );
    
    if (citizen) {
      // Asegurarse que todos los valores estén en formato correcto para los formularios
      // pero sin alterar los tipos definidos en la interfaz Citizen
      return {
        ...citizen,
        // Mantener los tipos originales
        id_ciudadano: citizen.id_ciudadano,
        estrato: citizen.estrato || 0,
        // Convertir campos booleanos si vienen como string
        discapacidad: typeof citizen.discapacidad === 'string' 
          ? citizen.discapacidad === 'true' || citizen.discapacidad === '1' 
          : Boolean(citizen.discapacidad),
        sabe_leer_escribir: typeof citizen.sabe_leer_escribir === 'string' 
          ? citizen.sabe_leer_escribir === 'true' || citizen.sabe_leer_escribir === '1' 
          : Boolean(citizen.sabe_leer_escribir),
        // Asegurar que campos de texto opcionales no sean null
        segundo_nombre: citizen.segundo_nombre || "",
        segundo_apellido: citizen.segundo_apellido || "",
        zona_residencia: citizen.zona_residencia || ""
      };
    }
    
    return null;
  } catch (error) {
    logger.error(`Error al obtener detalles del ciudadano ${id}:`, error);
    return null;
  }
};

/**
 * Updates an existing citizen with proper data type conversion
 * @param id The ID of the citizen to update
 * @param citizenData Partial citizen data to update
 * @returns The updated citizen or null if the update failed
 */
export const updateCitizen = async (
  id: string,
  citizenData: Partial<Citizen>
): Promise<Citizen | null> => {
  try {
    logger.info(`Actualizando ciudadano ${id}`);

    // Procesar los datos antes de enviarlos al servidor
    const processedData = {
      ...citizenData,
      // Convertir zona_residencia al formato necesario para la base de datos
      zona: citizenData.zona_residencia ? convertZonaToCode(citizenData.zona_residencia) : undefined,
      
      // Asegurar que el estrato sea un número
      estrato: citizenData.estrato !== undefined ? 
        (typeof citizenData.estrato === 'string' ? parseInt(citizenData.estrato) : citizenData.estrato) : 
        undefined,
      
      // Convertir campos booleanos si vienen como string
      discapacidad: citizenData.discapacidad !== undefined ? 
        (typeof citizenData.discapacidad === 'string' ? 
          citizenData.discapacidad === 'true' || citizenData.discapacidad === '1' : 
          Boolean(citizenData.discapacidad)) : 
        undefined,
      
      sabe_leer_escribir: citizenData.sabe_leer_escribir !== undefined ? 
        (typeof citizenData.sabe_leer_escribir === 'string' ? 
          citizenData.sabe_leer_escribir === 'true' || citizenData.sabe_leer_escribir === '1' : 
          Boolean(citizenData.sabe_leer_escribir)) : 
        undefined,
    };

    const updatedCitizen = await put<Citizen>(`ciudadanos/${id}`, processedData);

    // Invalidar caché para este ciudadano específico y la colección general
    invalidateCacheItem(CITIZEN_CACHE, id);
    invalidateCache(CITIZEN_CACHE);

    logger.info(`Ciudadano ${id} actualizado exitosamente`);
    return updatedCitizen;
  } catch (error) {
    logger.error(`Error al actualizar ciudadano ${id}:`, error);
    return null;
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
