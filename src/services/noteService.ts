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

// Nombre de la caché para notas y usuarios
const NOTES_CACHE = 'notes';
const USERS_CACHE = 'users';

// TTL por tipo de caché
const NOTES_TTL = 5 * 60 * 1000; // 5 minutos para notas
const USERS_CACHE_TTL = 30 * 60 * 1000; // 30 minutos para usuarios

/**
 * Enriquece las notas con información de usuarios de manera eficiente
 * usando la caché centralizada para evitar solicitudes innecesarias
 */
export async function enrichNotesWithUserInfo(notes: Nota[]): Promise<Nota[]> {
  if (!notes || notes.length === 0) {
    return [];
  }
  
  // Obtener IDs únicos de usuarios para buscar
  const userIds = Array.from(new Set(
    notes
      .map(nota => nota.id_usuario || nota.id_usuario_crea)
      .filter(Boolean) as number[]
  ));
  
  // Verificar si todos los usuarios ya existen en caché
  const uncachedUserIds = userIds.filter(userId => 
    !getCachedItem(USERS_CACHE, userId, USERS_CACHE_TTL)
  );
  
  // Si hay usuarios que no están en caché, buscarlos todos de una vez
  if (uncachedUserIds.length > 0) {
    logger.debug(`Cargando información de ${uncachedUserIds.length} usuarios para notas`);
    
    // Obtener todos los usuarios (esto actualiza la caché interna)
    await fetchAllUsers();
  }
  
  // Mapear las notas con la información de usuario desde la caché
  return await Promise.all(notes.map(async nota => {
    const userId = nota.id_usuario || nota.id_usuario_crea;
    
    if (!userId) return nota;
    
    // Obtener el usuario de la caché
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
 * Crea una nueva nota para un caso
 * @param caseId ID del caso
 * @param content Mensaje de la nota
 * @param userIdParam ID del usuario
 * @returns La nota creada o null si ocurrió un error
 */
export const createNote = async (
  caseId: number | string,
  content: string,
  userIdParam: number | string
): Promise<Nota | null> => {
  try {
    // Convertir a números si son strings
    const numericCaseId: number = typeof caseId === 'string' ? parseInt(caseId, 10) : caseId;
    const numericUserId: number = typeof userIdParam === 'string' ? parseInt(userIdParam, 10) : userIdParam;
    
    // Validar datos
    if (!numericCaseId || isNaN(numericCaseId)) {
      throw new Error("id_caso es obligatorio y debe ser un número");
    }
    
    if (!numericUserId || isNaN(numericUserId)) {
      throw new Error("id_usuario es obligatorio y debe ser un número");
    }
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      throw new Error("mensaje es obligatorio y no puede estar vacío");
    }
    
    // Mapear al nombre de campo correcto para la API
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
    
    // Enviar la nota a la API
    const createdNote: Nota = await post<Nota>('notas', noteData);
    
    if (!createdNote) {
      throw new Error("No se recibió respuesta del servidor al crear la nota");
    }
    
    // Obtener detalles del usuario para incluir en la respuesta
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
    
    // Devolver la nota con información de usuario
    return {
      ...createdNote,
      usuario: user || undefined
    };
  } catch (error: any) {
    logger.error("Error al crear nota:", error);
    
    // Logs detallados del error para diagnóstico
    if (error.response) {
      logger.error('Error en respuesta del servidor:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    throw error;
  }
}; 