import { get } from '@/utils/apiUtils';
import { Divipola } from '@/types/divipola';

export interface Location {
  region: string;
  departamento: string;
  municipio: string;
}

export const fetchLocations = async (): Promise<Location[]> => {
  try {
    const data = await get<Divipola[]>('/divipola/');
    
    return data.map(item => ({
      region: '',
      departamento: item.nombre_departamento,
      municipio: item.nombre_municipio
    }));
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

export const getUniqueDepartments = (locations: Location[]): string[] => {
  return [...new Set(locations.map(loc => loc.departamento))].sort();
};

export const getMunicipalitiesByDepartment = (locations: Location[], department: string): string[] => {
  return locations
    .filter(loc => loc.departamento === department)
    .map(loc => loc.municipio)
    .sort();
}; 