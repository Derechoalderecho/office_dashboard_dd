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
 * @param nota Los datos de la nota a crear
 * @returns La nota creada o null si ocurrió un error
 */
export const createNote = async (
  nota: { id_caso: number; id_usuario: number; mensaje: string }
): Promise<Nota | null> => {
  try {
    // Validar datos
    if (!nota.id_caso || typeof nota.id_caso !== 'number') {
      throw new Error("id_caso es obligatorio y debe ser un número");
    }
    
    if (!nota.id_usuario || typeof nota.id_usuario !== 'number') {
      throw new Error("id_usuario es obligatorio y debe ser un número");
    }
    
    if (!nota.mensaje || typeof nota.mensaje !== 'string' || nota.mensaje.trim() === '') {
      throw new Error("mensaje es obligatorio y no puede estar vacío");
    }
    
    // Mapear al nombre de campo correcto para la API
    const noteData = {
      id_caso: nota.id_caso,
      id_usuario_crea: nota.id_usuario,
      mensaje: nota.mensaje
    };
    
    logger.debug('Enviando datos al endpoint /notas', { noteData });
    
    // Enviar la nota a la API
    const createdNote = await post<Nota>('notas', noteData);
    
    if (!createdNote) {
      throw new Error("No se recibió respuesta del servidor al crear la nota");
    }
    
    // Obtener detalles del usuario para incluir en la respuesta
    const userId = createdNote.id_usuario || createdNote.id_usuario_crea;
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