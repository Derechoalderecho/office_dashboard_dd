//Servicio para obtener TODOS los casos asignados a un usuario

"use server";

import { get } from '@/utils/apiUtils';
import { CompleteCaseData } from '@/types/cases';
import { logger } from '@/utils/logUtils';

/**
 * Obtiene todos los casos asignados a un usuario específico
 * @param userId ID del usuario
 * @returns Lista de casos asociados al usuario
 */
export const fetchUserCasesFull = async (userId: number | null): Promise<CompleteCaseData[]> => {
  try {
    if (!userId) {
      logger.warn('fetchUserCasesFull: ID de usuario no proporcionado');
      return [];
    }
    
    logger.debug(`Obteniendo todos los casos del usuario ${userId}`);
    return await get<CompleteCaseData[]>(`usuarios/${userId}/casos/full/`);
  } catch (error) {
    logger.error(`Error al obtener los casos del usuario ${userId}:`, error);
    return [];
  }
};
