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
export const fetchCompleteCaseById= async (caseId: number): Promise<CompleteCaseData[]> => {
  try {
    const endpoint = `/casos/full/${caseId}/`;
    logger.info(`Fetching complete case for case ${caseId}`);
    
    const response = await get<CompleteCaseData[]>(endpoint);
    logger.info(`Retrieved ${response.length} complete cases for case ${caseId}`);
    
    return response;
  } catch (error) {
    logger.error(`Error fetching complete cases for case ${caseId}:`, error);
    throw error;
  }
};
  
