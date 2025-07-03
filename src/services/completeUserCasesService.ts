//Servicio para obtener todos los casos completos asignados a un usuario y de paso para obtener un caso especifico

"use server";

import { get, post, del } from '@/utils/apiUtils';
import { CompleteCaseData } from '@/types/cases';
import { logger } from '@/utils/logUtils';

/**
 * Obtiene todos los casos completos asignados a un usuario específico
 * @param userId ID del usuario para el que se quieren obtener los casos
 * @returns Lista de casos completos con todos los datos relacionados
 */
export const fetchCompleteUserCases = async (userId: number): Promise<CompleteCaseData[]> => {
  try {
    const endpoint = `/usuarios/${userId}/casos/full/`;
    logger.info(`Fetching complete cases for user ${userId}`);
    
    const response = await get<CompleteCaseData[]>(endpoint);
    logger.info(`Retrieved ${response.length} complete cases for user ${userId}`);
    
    return response;
  } catch (error) {
    logger.error(`Error fetching complete cases for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los casos completos asignados a un caso específico
 * @param caseId ID del caso para el que se quieren obtener los datos
 * @returns Lista de casos completos con todos los datos relacionados
 */
export const fetchCompleteCaseById = async (caseId: number): Promise<CompleteCaseData[]> => {
  try {
    const endpoint = `/casos/full/${caseId}/`;
    logger.info(`Fetching complete case for case ${caseId} from endpoint ${endpoint}`);
    
    console.log(`API Request: GET ${endpoint}`);
    let response;
    
    try {
      response = await get<CompleteCaseData | CompleteCaseData[]>(endpoint);
      console.log('API Response successful:', response);
    } catch (apiError) {
      logger.error(`Error en la petición API para el caso ${caseId}:`, apiError);
      throw apiError;
    }
    
    console.log('API Response structure:', response);
    
    // Verificar la estructura de la respuesta
    if (!response) {
      logger.error(`Empty response received for case ${caseId}`);
      throw new Error(`No se recibieron datos para el caso ${caseId}`);
    }
    
    // Normalizamos la respuesta para que siempre sea un array
    // Si la respuesta es un objeto (no un array), lo convertimos en un array con un elemento
    const normalizedResponse = Array.isArray(response) ? response : [response];
    
    logger.info(`Retrieved ${normalizedResponse.length} complete cases for case ${caseId}`);
    
    // Verificar si cada caso tiene las propiedades esperadas
    if (normalizedResponse.length > 0) {
      const firstCase = normalizedResponse[0];
      
      if (firstCase) {
        console.log('Case data keys:', Object.keys(firstCase));
        
        const hasRequiredProperties = 'id_caso' in firstCase && 'ciudadano' in firstCase;
        logger.info(`Case data has required properties: ${hasRequiredProperties}`);
        
        // Verificar si hay notas
        const hasNotas = 'notas' in firstCase && Array.isArray(firstCase.notas);
        logger.info(`Case has notes array: ${hasNotas}, ${hasNotas ? firstCase.notas.length : 0} notes found`);
        
        // Si no hay campo notas, agregarlo como array vacío para evitar errores
        if (!hasNotas) {
          console.warn('Adding empty notas array to case data to avoid errors');
          firstCase.notas = [];
        }
      }
    }
    
    return normalizedResponse;
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';
    logger.error(`Error fetching complete cases for case ${caseId}: ${errorMessage}`);
    console.error(`API Error for case ${caseId}:`, error);
    
    // Re-throw with more context
    throw new Error(`Error al cargar datos del caso ${caseId}: ${errorMessage}`);
  }
};
  
/**
 * Asigna un usuario a un caso
 * @param caseId ID del caso
 * @param userId ID del usuario
 * @param role Rol del usuario en el caso
 * @returns Resultado de la asignación
 */
export const assignUserToCase = async (
  caseId: number,
  userId: number,
  role: string
): Promise<boolean> => {
  try {
    logger.info(`Asignando usuario ${userId} como ${role} al caso ${caseId}`);
    
    const requestBody = {
      id_caso: caseId,
      id_usuario: userId,
      rol_en_caso: role,
      status: true
    };
    
    await post('/casos-usuarios/', requestBody);
    
    return true;
  } catch (error) {
    logger.error(`Error al asignar usuario ${userId} al caso ${caseId}:`, error);
    return false;
  }
};

/**
 * Elimina la asignación de un usuario a un caso específico
 * @param caseId ID del caso
 * @param userId ID del usuario
 * @returns Verdadero si la eliminación fue exitosa, falso en caso contrario
 */
export const deleteUserCaseAssignment = async (
  caseId: number,
  userId: number
): Promise<boolean> => {
  try {
    logger.info(`Eliminando asignación del usuario ${userId} en el caso ${caseId}`);
    
    await del(`/caso-usuario/${caseId}/${userId}/`);
    
    return true;
  } catch (error) {
    logger.error(`Error al eliminar asignación del usuario ${userId} en el caso ${caseId}:`, error);
    return false;
  }
};

/**
 * Obtiene los usuarios asignados a un caso específico
 * @param caseId ID del caso para el que se quieren obtener los usuarios asignados
 * @returns Lista de usuarios asignados al caso con sus roles
 */
export const fetchCaseUsers = async (caseId: number): Promise<any[]> => {
  try {
    logger.info(`Obteniendo usuarios asignados al caso ${caseId}`);
    
    const response = await get<any[]>(`/casos/${caseId}/usuarios/`);
    logger.info(`Se encontraron ${response.length} usuarios asignados al caso ${caseId}`);
    
    return response;
  } catch (error) {
    logger.error(`Error al obtener usuarios del caso ${caseId}:`, error);
    return [];
  }
};
