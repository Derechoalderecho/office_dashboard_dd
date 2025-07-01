//Servicio para obtener las ubicaciones de los municipios divipola

import { invalidateCache } from '@/utils/cacheUtils';
import { logger } from '@/utils/logUtils';
import locationData from '@/data/locations.json';

export interface Location {
  dane_departamento: string;
  nombre_departamento: string;
  dane_municipio: string;
  nombre_municipio: string;
  tipo: string;
  longitud: number;
  latitud: number;
}

const LOCATION_CACHE = 'locations';

export const fetchLocations = async (): Promise<Location[]> => {
  try {
    // Usar directamente los datos del archivo JSON
    return locationData as Location[];
  } catch (error) {
    logger.error("Error al obtener ubicaciones:", error);
    return [];
  }
};

export const getUniqueDepartments = (locations: Location[]): string[] => {
  return [...new Set(locations.map(loc => loc.nombre_departamento))].sort();
};

export const getMunicipalitiesByDepartment = (locations: Location[], department: string): string[] => {
  if (!department || !locations || locations.length === 0) {
    logger.debug('getMunicipalitiesByDepartment: No department or locations provided');
    return [];
  }
  
  const trimmedDepartment = department.trim();
  logger.debug(`Buscando municipios para departamento: "${trimmedDepartment}"`);
  
  const municipios = locations
    .filter(loc => loc.nombre_departamento && loc.nombre_departamento.trim().toLowerCase() === trimmedDepartment.toLowerCase())
    .map(loc => loc.nombre_municipio)
    .filter(Boolean)
    .sort();
  
  logger.debug(`Encontrados ${municipios.length} municipios para ${trimmedDepartment}`);
  
  return municipios;
};

/**
 * Obtiene el código DANE de un municipio por su nombre
 * @param locations Lista de ubicaciones
 * @param municipioNombre Nombre del municipio
 * @returns Código DANE del municipio o undefined si no se encuentra
 */
export const getDaneMunicipioByName = (locations: Location[], municipioNombre: string): string | undefined => {
  if (!municipioNombre || !locations || locations.length === 0) {
    logger.debug('getDaneMunicipioByName: No municipality name or locations provided');
    return undefined;
  }
  
  const trimmedMunicipio = municipioNombre.trim();
  
  const location = locations.find(
    loc => loc.nombre_municipio && 
    loc.nombre_municipio.trim().toLowerCase() === trimmedMunicipio.toLowerCase()
  );
  
  if (location) {
    logger.debug(`Encontrado código DANE ${location.dane_municipio} para municipio ${trimmedMunicipio}`);
    return location.dane_municipio;
  }
  
  logger.debug(`No se encontró código DANE para municipio ${trimmedMunicipio}`);
  return undefined;
};

/**
 * Invalidates the locations cache to force a fresh reload
 */
export const invalidateLocationsCache = () => {
  invalidateCache(LOCATION_CACHE);
}; 