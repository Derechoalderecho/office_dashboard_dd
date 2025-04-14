"use server";

import { Nota } from "@/types/cases";
import { Users } from "@/types/users";
import { post } from "@/utils/apiUtils";
import { 
  getWithCache, 
  getCollectionWithCache,
  getCachedItem
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";
import { fetchUserDetails, fetchAllUsers } from "./userService";

const NOTES_CACHE = 'notes';
const USERS_CACHE = 'users';

const NOTES_TTL = 5 * 60 * 1000;
const USERS_CACHE_TTL = 30 * 60 * 1000;

/**
 * Enrich notes with user information efficiently
 * using the centralized cache to avoid unnecessary requests
 */
export async function enrichNotesWithUserInfo(notes: Nota[]): Promise<Nota[]> {
  if (!notes || notes.length === 0) {
    return [];
  }
  
  const userIds = Array.from(new Set(
    notes
      .map(nota => nota.id_usuario || nota.id_usuario_crea)
      .filter(Boolean) as number[]
  ));
  
  const uncachedUserIds = userIds.filter(userId => 
    !getCachedItem(USERS_CACHE, userId, USERS_CACHE_TTL)
  );
  
  if (uncachedUserIds.length > 0) {
    logger.debug(`Cargando información de ${uncachedUserIds.length} usuarios para notas`);
    
    await fetchAllUsers();
  }
  
  return await Promise.all(notes.map(async nota => {
    const userId = nota.id_usuario || nota.id_usuario_crea;
    
    if (!userId) return nota;
    
    const user = await getWithCache<Users | null>(
      USERS_CACHE,
      userId,
      async () => {
        logger.debug(`Obteniendo detalles de usuario ${userId} para nota ${nota.id_nota}`);
        return await fetchUserDetails(userId.toString());
      },
      USERS_CACHE_TTL
    );
    
    if (user) {
      return { ...nota, usuario: user };
    }
    
    return nota;
  }));
}

/**
 * Creates a new note for a case
 * @param caseId
 * @param content
 * @param userIdParam
 * @returns
 */
export const createNote = async (
  caseId: number | string,
  content: string,
  userIdParam: number | string
): Promise<Nota | null> => {
  try {
    const numericCaseId: number = typeof caseId === 'string' ? parseInt(caseId, 10) : caseId;
    const numericUserId: number = typeof userIdParam === 'string' ? parseInt(userIdParam, 10) : userIdParam;
    
    if (!numericCaseId || isNaN(numericCaseId)) {
      throw new Error("id_caso es obligatorio y debe ser un número");
    }
    
    if (!numericUserId || isNaN(numericUserId)) {
      throw new Error("id_usuario es obligatorio y debe ser un número");
    }
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw new Error("mensaje es obligatorio y no puede estar vacío");
    }
    
    const noteData: {
      id_caso: number;
      id_usuario_crea: number;
      mensaje: string;
    } = {
      id_caso: numericCaseId,
      id_usuario_crea: numericUserId,
      mensaje: content.trim()
    };
    
    logger.debug('Enviando datos al endpoint /notas', { noteData });
    
    const createdNote: Nota = await post<Nota>('notas', noteData);
    
    if (!createdNote) {
      throw new Error("No se recibió respuesta del servidor al crear la nota");
    }
    
    const userId: number | undefined = createdNote.id_usuario || createdNote.id_usuario_crea;
    let user = undefined;
    
    if (userId) {
      user = await getWithCache<Users | null>(
        USERS_CACHE,
        userId,
        async () => {
          logger.debug(`Obteniendo detalles de usuario ${userId} para la nueva nota`);
          return await fetchUserDetails(userId.toString());
        },
        USERS_CACHE_TTL
      );
    }
    
    logger.info(`Nota creada exitosamente: ID=${createdNote.id_nota}`);
    
    return {
      ...createdNote,
      usuario: user || undefined
    };
  } catch (error: any) {
    logger.error("Error al crear nota:", error);
    
    if (error.response) {
      logger.error('Error en respuesta del servidor:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw error;
  }
}; 