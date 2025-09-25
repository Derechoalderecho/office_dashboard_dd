//Service para obtener los datos del usuario que está logeado

import { get } from "@/utils/apiUtils";
import { logger } from "@/utils/logUtils";
import { ApiUsuario } from "@/types/cases";

/**
 * Obtiene el usuario por su ID de Firebase
 * @param firebaseUid - ID de Firebase del usuario
 * @returns El usuario correspondiente al ID de Firebase o null si no existe
 */
export async function fetchCurrentUserAuthenticated(): Promise<ApiUsuario | null> {
  try {

    // El endpoint ahora es /usuarios/me y devuelve directamente el objeto del usuario.
    const endpoint = "/usuarios/me";
    console.log(`userAuthService: Llamando al endpoint optimizado: ${endpoint}`);

    const usuario = await get<ApiUsuario>(endpoint);

    if (!usuario) {
      logger.warn(`No se encontraron detalles para el usuario autenticado`);
      return null;
    }

    logger.info(
      `Usuario encontrado: ${usuario.primer_nombre} ${usuario.primer_apellido} (ID: ${usuario.id})`
    );
    return usuario;
    
  } catch (error: any) {
    if (error.response?.status === 404) {
        logger.warn(`El usuario autenticado actualmente no fue encontrado en la base de datos.`);
        return null;
    }
    logger.error(`Error al buscar el usuario autenticado:`, error);
    throw error;
  }
}

// Función getUserIdFromFirebaseUid eliminada - Ya no se usa el ID interno del usuario

/**
 * Obtiene el rol de un usuario a partir de su ID de Firebase
 * @param firebaseUid - ID de Firebase del usuario
 * @returns El rol del usuario o null si no se encuentra
 */
export async function getUserRoleForApiUser(
  user: ApiUsuario
): Promise<string | null> {
  try {

    logger.debug(`Obteniendo rol para el usuario autenticado`);
    console.log(
      `userAuthService: Buscando rol para el usuario autenticado`
    );

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
