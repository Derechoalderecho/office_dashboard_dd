//Servicio para obtener el rol del usuario que ha ingresado y posteriormente ser usado en el hook useUserRole

"use server";

import { logger } from '@/utils/logUtils';
import { fetchUserByFirebaseUid } from './userByFirebaseService';

/**
 * Obtiene el rol de un usuario a partir de su ID de Firebase
 * @param firebaseUid - ID de Firebase del usuario
 * @returns El rol del usuario o null si no se encuentra
 */
export async function getUserRoleFromFirebaseUid(firebaseUid: string): Promise<string | null> {
  try {
    if (!firebaseUid) {
      logger.warn('getUserRoleFromFirebaseUid: Firebase UID no proporcionado');
      console.log('userRoleService: Firebase UID no proporcionado');
      return null;
    }
    
    logger.debug(`Obteniendo rol para Firebase UID: ${firebaseUid}`);
    console.log(`userRoleService: Buscando rol para Firebase UID: ${firebaseUid}`);
    
    const user = await fetchUserByFirebaseUid(firebaseUid);
    console.log('userRoleService: Usuario obtenido:', user ? 'Encontrado' : 'No encontrado');
    
    if (user && user.rol) {
      logger.debug(`Rol de usuario encontrado: ${user.rol}`);
      console.log(`userRoleService: Rol encontrado: ${user.rol}`);
      return user.rol;
    }
    
    logger.warn('No se pudo obtener el rol del usuario');
    console.log('userRoleService: No se pudo obtener el rol del usuario');
    return null;
  } catch (error) {
    logger.error('Error al obtener rol de usuario:', error);
    return null;
  }
}
