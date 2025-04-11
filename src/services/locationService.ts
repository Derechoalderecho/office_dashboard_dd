import { get } from '@/utils/apiUtils';
import { 
  getCollectionWithCache,
  invalidateCache
} from '@/utils/cacheUtils';
import { Divipola } from '@/types/divipola';
import { logger } from '@/utils/logUtils';

export interface Location {
  region: string;
  departamento: string;
  municipio: string;
}

// Nombre de la caché para ubicaciones
const LOCATION_CACHE = 'locations';

// TTL para la caché de ubicaciones (30 minutos)
const LOCATION_TTL = 30 * 60 * 1000;

export const fetchLocations = async (): Promise<Location[]> => {
  try {
    return await getCollectionWithCache<Location>(
      LOCATION_CACHE,
      async () => {
        logger.debug('Obteniendo todas las ubicaciones');
        const data = await get<Divipola[]>('divipola');
        
        if (!data || !Array.isArray(data)) {
          logger.error('La API de divipola no retornó un array válido', data);
          return [];
        }
        
        logger.debug(`Recibidos ${data.length} registros de divipola`);
        
        // Limpiar y normalizar datos para evitar problemas con espacios o cases
        const locations = data
          .filter(item => item && item.nombre_departamento && item.nombre_municipio)
          .map(item => ({
            region: '',
            departamento: item.nombre_departamento.trim(),
            municipio: item.nombre_municipio.trim()
          }));
        
        logger.debug(`Procesados ${locations.length} registros válidos de ubicaciones`);
        
        return locations;
      },
      location => `${location.departamento.toLowerCase()}-${location.municipio.toLowerCase()}`,
      LOCATION_TTL
    );
  } catch (error) {
    logger.error("Error al obtener ubicaciones:", error);
    return [];
  }
};

export const getUniqueDepartments = (locations: Location[]): string[] => {
  return [...new Set(locations.map(loc => loc.departamento))].sort();
};

export const getMunicipalitiesByDepartment = (locations: Location[], department: string): string[] => {
  if (!department || !locations || locations.length === 0) {
    logger.debug('getMunicipalitiesByDepartment: No department or locations provided');
    return [];
  }
  
  const trimmedDepartment = department.trim();
  logger.debug(`Buscando municipios para departamento: "${trimmedDepartment}"`);
  
  // Usar comparación normalizada para evitar problemas de case
  const municipios = locations
    .filter(loc => loc.departamento && loc.departamento.trim().toLowerCase() === trimmedDepartment.toLowerCase())
    .map(loc => loc.municipio)
    .filter(Boolean) // Filtrar valores undefined o vacíos
    .sort();
  
  logger.debug(`Encontrados ${municipios.length} municipios para ${trimmedDepartment}`);
  
  return municipios;
};

/**
 * Invalida la caché de ubicaciones para forzar una recarga fresca
 */
export const invalidateLocationsCache = () => {
  invalidateCache(LOCATION_CACHE);
}; 