"use server";

import { Nota } from "@/types/cases";
import { Users } from "@/types/users";
import { post } from "@/utils/apiUtils";
import { 
  getWithCache, 
  getCollectionWithCache,
  getCachedItem,
  invalidateCache,
  invalidateCacheItem
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";
import { fetchUserDetails, fetchAllUsers } from "./userService";

const NOTES_CACHE = 'notes';
const USERS_CACHE = 'users';
const CASES_CACHE = 'cases';

const NOTES_TTL = 5 * 60 * 1000;
const USERS_CACHE_TTL = 30 * 60 * 1000;
const CASES_CACHE_TTL = 5 * 60 * 1000;

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
    // Convertir los parámetros a números si son strings
    const numericCaseId: number = typeof caseId === 'string' ? parseInt(caseId, 10) : caseId;
    const numericUserId: number = typeof userIdParam === 'string' ? parseInt(userIdParam, 10) : userIdParam;
    
    logger.info('=== INICIO: Creación de Nota ===');
    logger.info(`Parámetros recibidos: caso=${caseId}, usuario=${userIdParam}, mensaje=${content.substring(0, 20)}...`);
    
    // Validar parámetros
    if (!numericCaseId || isNaN(numericCaseId)) {
      logger.error(`ERROR: ID de caso inválido: ${caseId}`);
      throw new Error("id_caso es obligatorio y debe ser un número");
    }
    
    if (!numericUserId || isNaN(numericUserId)) {
      logger.error(`ERROR: ID de usuario inválido: ${userIdParam}`);
      throw new Error("id_usuario es obligatorio y debe ser un número");
    }
    
    // Validar mensaje
    if (!content || typeof content !== 'string' || content.trim() === '') {
      logger.error('ERROR: Contenido de nota vacío o inválido');
      throw new Error("mensaje es obligatorio y no puede estar vacío");
    }
    
    // Preparar datos para enviar al API
    const noteData = {
      id_caso: numericCaseId,
      id_usuario_crea: numericUserId,
      mensaje: content.trim()
    };
    
    // Log detallado del body que se envía
    logger.info('=== ENVIANDO DATOS AL API ===');
    logger.info(`URL: POST /notas`);
    logger.info(`Body: ${JSON.stringify(noteData)}`);
    
    // Llamada a la API
    const response = await post<any>('notas/', noteData);
    
    // Log detallado de la respuesta
    logger.info('=== RESPUESTA DEL SERVIDOR ===');
    logger.info(`Respuesta completa: ${JSON.stringify(response)}`);
    
    if (!response) {
      logger.error('ERROR: No se recibió respuesta del servidor');
      throw new Error("No se recibió respuesta del servidor al crear la nota");
    }
    
    // Invalidar caché de notas para este caso
    const caseNotesCache = `case_${numericCaseId}_notes`;
    logger.info(`Invalidando caché: ${caseNotesCache}`);
    invalidateCache(caseNotesCache);
    invalidateCache(NOTES_CACHE);
    invalidateCacheItem(CASES_CACHE, numericCaseId);
    
    // Construir objeto de nota con la respuesta
    // Usar los campos que vienen en la respuesta o valores por defecto
    const nota: Nota = {
      id_nota: response.id_nota || response.id || 0,
      id_caso: numericCaseId,
      id_usuario: numericUserId,
      id_usuario_crea: numericUserId,
      mensaje: content.trim(),
      fecha_crea: new Date().toISOString(),
      fecha_actualiza: new Date().toISOString()
    };
    
    logger.info(`Nota construida con ID=${nota.id_nota || 'desconocido'}`);
    logger.info(`Nota creada exitosamente para caso ID=${numericCaseId}`);
    
    // Obtener información del usuario para enriquecer la nota
    let user = undefined;
    
    logger.debug(`Obteniendo información de usuario ID=${numericUserId} para la nueva nota`);
    user = await getWithCache<Users | null>(
      USERS_CACHE,
      numericUserId,
      async () => {
        logger.debug(`Obteniendo detalles de usuario ${numericUserId} para la nueva nota`);
        return await fetchUserDetails(numericUserId.toString());
      },
      USERS_CACHE_TTL
    );
    
    // Enriquecer la nota con la información del usuario
    const enrichedNote = {
      ...nota,
      usuario: user || undefined
    };
    
    logger.info(`Nota enriquecida con información de usuario: ${user ? 'Sí' : 'No'}`);
    logger.info('=== FIN: Creación de Nota ===');
    
    return enrichedNote;
  } catch (error: any) {
    logger.error("=== ERROR al crear nota ===");
    logger.error(`Mensaje de error: ${error.message || 'Desconocido'}`);
    
    if (error.response) {
      logger.error('Error en respuesta del servidor:', {
        status: error.response.status,
        data: JSON.stringify(error.response.data)
      });
    }
    
    throw error;
  }
};