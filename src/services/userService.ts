"use server";

import { Users } from "@/types/users";
import { API_BASE_URL } from "@/config/api";
import { get, post, put } from "@/utils/apiUtils";
import { 
  getWithCache, 
  getCollectionWithCache,
  invalidateCacheItem,
  invalidateCache
} from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";

// Nombre de la caché para usuarios
const CACHE_NAME = 'users';
// TTL más largo para usuarios (30 minutos) ya que cambian con poca frecuencia
const USERS_CACHE_TTL = 30 * 60 * 1000; 

/**
 * Obtiene los detalles de un usuario por ID
 */
export const fetchUserDetails = async (id: string): Promise<Users | null> => {
  try {
    // Usar caché para obtener usuarios
    return await getWithCache<Users | null>(
      CACHE_NAME,
      id,
      async () => {
        logger.debug(`Obteniendo detalles de usuario ${id} de la API`);
        return await get<Users>(`usuarios/${id}`);
      },
      USERS_CACHE_TTL
    );
  } catch (error) {
    logger.error(`Error al obtener detalles del usuario ${id}:`, error);
    return null;
  }
};

/**
 * Obtiene todos los usuarios de la aplicación
 */
export const fetchAllUsers = async (): Promise<Users[]> => {
  try {
    // Usar caché para la colección de usuarios
    return await getCollectionWithCache<Users>(
      CACHE_NAME,
      async () => {
        logger.debug('Obteniendo todos los usuarios de la API');
        return await get<Users[]>('usuarios');
      },
      user => user.id_usuario,
      USERS_CACHE_TTL
    );
  } catch (error) {
    logger.error('Error al obtener todos los usuarios:', error);
    return [];
  }
};

/**
 * Obtiene un usuario por su Firebase UID
 */
export async function fetchUserByFirebaseUid(firebaseUid: string): Promise<Users | null> {
  try {
    if (!firebaseUid) {
      logger.warn('fetchUserByFirebaseUid: Firebase UID no proporcionado');
      return null;
    }
    
    logger.debug(`Buscando usuario con Firebase UID: ${firebaseUid}`);
    
    // Obtener todos los usuarios (usando caché)
    const allUsers = await fetchAllUsers();
    
    if (allUsers.length === 0) {
      logger.warn('No se encontraron usuarios en el sistema');
      return null;
    }
    
    // Buscar el usuario con el id_usuario_firebase correspondiente
    const user = allUsers.find(user => user.id_usuario_firebase === firebaseUid);
    
    if (user) {
      logger.debug(`Usuario encontrado: ID=${user.id_usuario}, Nombre=${user.primer_nombre}`);
      return user;
    } 
    
    logger.warn(`No se encontró ningún usuario con Firebase UID: ${firebaseUid}`);
    return null;
  } catch (error) {
    logger.error('Error buscando usuario por Firebase UID:', error);
    return null;
  }
}

/**
 * Obtiene el ID interno de un usuario a partir de su Firebase UID
 */
export async function getUserIdFromFirebase(firebaseUid: string): Promise<number | null> {
  try {
    if (!firebaseUid) {
      logger.warn('getUserIdFromFirebase: Firebase UID no proporcionado');
      return null;
    }
    
    logger.debug(`Obteniendo ID interno para Firebase UID: ${firebaseUid}`);
    const user = await fetchUserByFirebaseUid(firebaseUid);
    
    if (user && user.id_usuario) {
      logger.debug(`ID interno de usuario encontrado: ${user.id_usuario}`);
      return user.id_usuario;
    }
    
    logger.warn('No se pudo obtener el ID interno del usuario');
    return null;
  } catch (error) {
    logger.error('Error al obtener ID interno de usuario:', error);
    return null;
  }
}

/**
 * Crea un nuevo usuario con Firebase UID
 */
export async function createUserWithFirebaseUid(userData: {
  id_usuario_firebase: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  email: string;
  rol: string;
  tipo_documento: string;
  num_documento: string;
}): Promise<Users | null> {
  try {
    logger.info(`Creando nuevo usuario: ${userData.primer_nombre} ${userData.primer_apellido}`);
    
    const user = await post<Users>('usuarios', userData);
    
    // Invalidar la caché de usuarios después de crear uno nuevo
    invalidateCache(CACHE_NAME);
    
    logger.info(`Usuario creado con éxito: ID=${user.id_usuario}`);
    return user;
  } catch (error) {
    logger.error('Error al crear usuario:', error);
    return null;
  }
}

/**
 * Actualiza los datos de un usuario existente
 */
export async function updateUser(
  userId: number, 
  userData: Partial<Users>
): Promise<Users | null> {
  try {
    logger.info(`Actualizando usuario ${userId}`);
    
    // Usar 'put' para actualizar el usuario
    const updatedUser = await put<Users>(`usuarios/${userId}/actualizar`, userData);
    
    // Invalidar solo este usuario en la caché
    invalidateCacheItem(CACHE_NAME, userId);
    
    logger.info(`Usuario ${userId} actualizado con éxito`);
    return updatedUser;
  } catch (error) {
    logger.error(`Error al actualizar usuario ${userId}:`, error);
    return null;
  }
}
