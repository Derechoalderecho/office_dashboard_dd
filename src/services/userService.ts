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

// Cache name for users
const CACHE_NAME = 'users';
const USERS_CACHE_TTL = 30 * 60 * 1000; 

/**
 * Gets the details of a user by ID
 */
export const fetchUserDetails = async (id: string): Promise<Users | null> => {
  try {
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
 * Gets all users from the application
 */
export const fetchAllUsers = async (): Promise<Users[]> => {
  try {
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
 * Gets a user by their Firebase UID
 */
export async function fetchUserByFirebaseUid(firebaseUid: string): Promise<Users | null> {
  try {
    if (!firebaseUid) {
      logger.warn('fetchUserByFirebaseUid: Firebase UID no proporcionado');
      return null;
    }
    
    logger.debug(`Buscando usuario con Firebase UID: ${firebaseUid}`);
    
    const allUsers = await fetchAllUsers();
    
    if (allUsers.length === 0) {
      logger.warn('No se encontraron usuarios en el sistema');
      return null;
    }
    
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
 * Gets the internal ID of a user from their Firebase UID
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
 * Creates a new user with Firebase UID
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
    
    invalidateCache(CACHE_NAME);
    
    logger.info(`Usuario creado con éxito: ID=${user.id_usuario}`);
    return user;
  } catch (error) {
    logger.error('Error al crear usuario:', error);
    return null;
  }
}

/**
 * Updates the data of an existing user
 */
export async function updateUser(
  userId: number, 
  userData: Partial<Users>
): Promise<Users | null> {
  try {
    logger.info(`Actualizando usuario ${userId}`);
    
    const updatedUser = await put<Users>(`usuarios/${userId}/actualizar`, userData);
    
    invalidateCacheItem(CACHE_NAME, userId);
    
    logger.info(`Usuario ${userId} actualizado con éxito`);
    return updatedUser;
  } catch (error) {
    logger.error(`Error al actualizar usuario ${userId}:`, error);
    return null;
  }
}

/**
 * Gets the role of a user from their Firebase UID
 */
export async function getUserRoleFromFirebase(firebaseUid: string): Promise<string | null> {
  try {
    if (!firebaseUid) {
      logger.warn('getUserRoleFromFirebase: Firebase UID no proporcionado');
      return null;
    }
    
    logger.debug(`Obteniendo rol para Firebase UID: ${firebaseUid}`);
    const user = await fetchUserByFirebaseUid(firebaseUid);
    
    if (user && user.rol) {
      logger.debug(`Rol de usuario encontrado: ${user.rol}`);
      return user.rol;
    }
    
    logger.warn('No se pudo obtener el rol del usuario');
    return null;
  } catch (error) {
    logger.error('Error al obtener rol de usuario:', error);
    return null;
  }
}
