//Service para obtener los datos del usuario que está logeado

import { get } from "@/utils/apiUtils";
import { logger } from "@/utils/logUtils";
import { ApiUsuario } from "@/types/cases";

/**
 * Obtiene el usuario por su ID de Firebase
 * @param firebaseUid - ID de Firebase del usuario
 * @returns El usuario correspondiente al ID de Firebase o null si no existe
 */
export async function fetchUserByFirebaseUid(
  firebaseUid: string
): Promise<ApiUsuario | null> {
  try {
    // El UID ya no es necesario en la petición, pero lo logueamos para consistencia.
    logger.info(`Buscando detalles para el usuario autenticado (UID: ${firebaseUid})`);

    // El endpoint ahora es /usuarios/me y devuelve directamente el objeto del usuario.
    const endpoint = "/usuarios/me";
    console.log(`userAuthService: Llamando al endpoint optimizado: ${endpoint}`);

    const usuario = await get<ApiUsuario>(endpoint);

    if (!usuario) {
      logger.warn(`No se encontraron detalles para el usuario autenticado (UID: ${firebaseUid})`);
      return null;
    }

    logger.info(
      `Usuario encontrado: ${usuario.primer_nombre} ${usuario.primer_apellido} (ID: ${usuario.id})`
    );
    return usuario;
    
  } catch (error: any) {
    // Si el error es un 404, significa que el usuario de Firebase no existe en la BD.
    if (error.response?.status === 404) {
        logger.warn(`El usuario con UID ${firebaseUid} no fue encontrado en la base de datos.`);
        return null;
    }
    logger.error(`Error al buscar usuario por Firebase UID ${firebaseUid}:`, error);
    throw error;
  }
}

// Función getUserIdFromFirebaseUid eliminada - Ya no se usa el ID interno del usuario

/**
 * Obtiene el rol de un usuario a partir de su ID de Firebase
 * @param firebaseUid - ID de Firebase del usuario
 * @returns El rol del usuario o null si no se encuentra
 */
export async function getUserRoleFromFirebaseUid(
  firebaseUid: string
): Promise<string | null> {
  try {
    if (!firebaseUid) {
      logger.warn("getUserRoleFromFirebaseUid: Firebase UID no proporcionado");
      console.log("userAuthService: Firebase UID no proporcionado");
      return null;
    }

    logger.debug(`Obteniendo rol para Firebase UID: ${firebaseUid}`);
    console.log(
      `userAuthService: Buscando rol para Firebase UID: ${firebaseUid}`
    );

    const user = await fetchUserByFirebaseUid(firebaseUid);
    console.log(
      "userAuthService: Usuario obtenido:",
      user ? "Encontrado" : "No encontrado"
    );

    if (user && user.rol) {
      logger.debug(`Rol de usuario encontrado: ${user.rol}`);
      console.log(`userAuthService: Rol encontrado: ${user.rol}`);
      return user.rol.nombre;
    }

    logger.warn("No se pudo obtener el rol del usuario");
    console.log("userAuthService: No se pudo obtener el rol del usuario");
    return null;
  } catch (error) {
    logger.error("Error al obtener rol de usuario:", error);
    return null;
  }
}
