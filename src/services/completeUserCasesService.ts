//Servicio para obtener todos los casos completos asignados a un usuario y de paso para obtener un caso especifico

"use server";

import { get } from '@/utils/apiUtils';
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
    } catch (apiError) {
      // Si falla el método get, intentar con fetch nativo como alternativa
      console.warn(`Primary API request failed. Trying with native fetch as fallback`, apiError);
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fullUrl = `${API_BASE_URL}${endpoint}`;
      
      console.log(`Fallback fetch request: ${fullUrl}`);
      const fetchResponse = await fetch(fullUrl);
      
      if (!fetchResponse.ok) {
        throw new Error(`Fallback fetch failed with status: ${fetchResponse.status}`);
      }
      
      response = await fetchResponse.json();
      console.log('Fallback API response successful:', response);
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
  
