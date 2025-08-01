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
    logger.info(`Buscando usuario con Firebase UID: ${firebaseUid}`);
    console.log(
      `userAuthService: Buscando usuario con Firebase UID: ${firebaseUid}`
    );

    // Endpoint para obtener todos los usuarios
    const endpoint = "/usuarios";
    console.log(`userAuthService: Llamando al endpoint: ${endpoint}`);

    // Obtenemos todos los usuarios
    const usuarios = await get<ApiUsuario[]>(endpoint);
    console.log(
      `userAuthService: Usuarios obtenidos: ${usuarios ? usuarios.length : 0}`
    );

    if (usuarios && usuarios.length > 0) {
      console.log(
        "userAuthService: Primer usuario en la lista:",
        usuarios[0].id_usuario_firebase
      );
      console.log("userAuthService: Buscando coincidencia con:", firebaseUid);
    }

    // Filtramos por el id de Firebase
    const usuario = usuarios.find((u) => u.id_usuario_firebase === firebaseUid);

    if (!usuario) {
      logger.warn(
        `No se encontró ningún usuario con Firebase UID: ${firebaseUid}`
      );
      console.log(
        `userAuthService: No se encontró ningún usuario con Firebase UID: ${firebaseUid}`
      );
      return null;
    }

    logger.info(
      `Usuario encontrado: ${usuario.primer_nombre} ${usuario.primer_apellido} (ID: ${usuario.id_usuario})`
    );
    console.log(
      `userAuthService: Usuario encontrado: ${usuario.primer_nombre} ${usuario.primer_apellido}, Rol: ${usuario.rol}`
    );
    return usuario;
  } catch (error) {
    logger.error(
      `Error al buscar usuario por Firebase UID ${firebaseUid}:`,
      error
    );
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
      return user.rol;
    }

    logger.warn("No se pudo obtener el rol del usuario");
    console.log("userAuthService: No se pudo obtener el rol del usuario");
    return null;
  } catch (error) {
    logger.error("Error al obtener rol de usuario:", error);
    return null;
  }
}
