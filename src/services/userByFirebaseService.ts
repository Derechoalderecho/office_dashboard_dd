"use server";

import { get } from '@/utils/apiUtils';
import { logger } from '@/utils/logUtils';
import { ApiUsuario } from '@/types/cases';

/**
 * Obtiene el usuario por su ID de Firebase
 * @param firebaseUid - ID de Firebase del usuario
 * @returns El usuario correspondiente al ID de Firebase o null si no existe
 */
export async function fetchUserByFirebaseUid(firebaseUid: string): Promise<ApiUsuario | null> {
  try {
    logger.info(`Buscando usuario con Firebase UID: ${firebaseUid}`);
    
    // Endpoint para obtener todos los usuarios
    const endpoint = '/usuarios/';
    
    // Obtenemos todos los usuarios
    const usuarios = await get<ApiUsuario[]>(endpoint);
    
    // Filtramos por el id de Firebase
    const usuario = usuarios.find(u => u.id_usuario_firebase === firebaseUid);
    
    if (!usuario) {
      logger.warn(`No se encontró ningún usuario con Firebase UID: ${firebaseUid}`);
      return null;
    }
    
    logger.info(`Usuario encontrado: ${usuario.primer_nombre} ${usuario.primer_apellido} (ID: ${usuario.id_usuario})`);
    return usuario;
  } catch (error) {
    logger.error(`Error al buscar usuario por Firebase UID ${firebaseUid}:`, error);
    throw error;
  }
};

/**
 * Función optimizada que solo devuelve el ID interno del usuario
 * @param firebaseUid - ID de Firebase del usuario
 * @returns El ID interno del usuario o null si no se encuentra
 */
export async function getUserIdFromFirebaseUid(firebaseUid: string): Promise<number | null> {
  try {
    const usuario = await fetchUserByFirebaseUid(firebaseUid);
    return usuario ? usuario.id_usuario : null;
  } catch (error) {
    logger.error(`Error al obtener ID interno del usuario con Firebase UID ${firebaseUid}:`, error);
    return null;
  }
}
