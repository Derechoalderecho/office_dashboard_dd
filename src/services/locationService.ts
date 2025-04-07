import axios from 'axios';

export interface Location {
  region: string;
  c_digo_dane_del_departamento: string;
  departamento: string;
  c_digo_dane_del_municipio: string;
  municipio: string;
}

export const fetchLocations = async (): Promise<Location[]> => {
  try {
    const { data } = await axios.get<Location[]>('https://www.datos.gov.co/resource/xdk5-pm3f.json', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    
    return data;
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