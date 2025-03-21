"use server";

import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { Nota } from "@/types/cases";
import { fetchUserDetails, fetchAllUsers } from "./userService";
import { Users } from "@/types/users";

// Caché en memoria para usuarios (solo durante la sesión del servidor)
let userCache: Map<number, Users> | null = null;
let lastCacheTime: number = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutos en milisegundos

/**
 * Obtiene todos los usuarios y los almacena en caché
 */
async function refreshUserCache(): Promise<Map<number, Users>> {
  try {
    console.log("Actualizando caché de usuarios...");
    const users = await fetchAllUsers();
    const newCache = new Map<number, Users>();
    
    users.forEach(user => {
      if (user.id_usuario) {
        newCache.set(user.id_usuario, user);
      }
    });
    
    userCache = newCache;
    lastCacheTime = Date.now();
    console.log(`Caché actualizada con ${newCache.size} usuarios`);
    return newCache;
  } catch (error) {
    console.error("Error al actualizar caché de usuarios:", error);
    // Si hay un error, devolver un caché vacío o el caché existente
    return userCache || new Map<number, Users>();
  }
}

/**
 * Obtiene un usuario por ID, utilizando caché para mejorar rendimiento
 */
export async function getUserDetails(userId: number): Promise<Users | undefined> {
  // Verificar si la caché está expirada o no existe
  if (!userCache || Date.now() - lastCacheTime > CACHE_TTL) {
    await refreshUserCache();
  }
  
  // Intentar obtener el usuario de la caché
  let user = userCache?.get(userId);
  
  // Si no está en caché, intentar obtenerlo directamente
  if (!user) {
    try {
      const fetchedUser = await fetchUserDetails(userId.toString());
      if (fetchedUser && userCache) {
        userCache.set(userId, fetchedUser);
        user = fetchedUser;
      }
    } catch (error) {
      console.error(`Error al obtener usuario ${userId}:`, error);
    }
  }
  
  return user;
}

/**
 * Enriquece las notas con información de usuarios de manera eficiente
 * Esta función es mucho más eficiente que hacer requests individuales
 */
export async function enrichNotesWithUserInfo(notes: Nota[]): Promise<Nota[]> {
  if (!notes || notes.length === 0) {
    return [];
  }
  
  // Asegurarse de que la caché esté actualizada
  if (!userCache || Date.now() - lastCacheTime > CACHE_TTL) {
    await refreshUserCache();
  }
  
  // Mapear las notas con la información de usuario
  return notes.map(nota => {
    const userId = nota.id_usuario || nota.id_usuario_crea;
    if (userId && userCache) {
      const user = userCache.get(userId);
      if (user) {
        return { ...nota, usuario: user };
      }
    }
    return nota;
  });
}

/**
 * Creates a new note for a case
 * @param nota The note data to create
 * @returns The created note or null if there was an error
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
    
    // Map to the correct field name for the API
    const noteData = {
      id_caso: nota.id_caso,
      id_usuario_crea: nota.id_usuario, // Rename field for API
      mensaje: nota.mensaje
    };
    
    // Debug log - mostrar datos que se envían
    console.log('Enviando datos al endpoint /notas:', JSON.stringify(noteData, null, 2));
    console.log('URL completa:', `${API_BASE_URL}/notas`);
    
    const response = await axios.post(`${API_BASE_URL}/notas`, noteData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Debug log - mostrar respuesta
    console.log('Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    
    if (response.status === 201 || response.status === 200) {
      const createdNote = response.data as Nota;
      
      // Obtener detalles del usuario de la caché
      const userId = createdNote.id_usuario || createdNote.id_usuario_crea;
      let user = undefined;
      
      if (userId) {
        user = await getUserDetails(userId);
      }
      
      return {
        ...createdNote,
        usuario: user
      };
    }
    
    console.log('Respuesta sin error pero no se creó la nota:', response);
    return null;
  } catch (error: any) {
    console.error("Error creating note:", error);
    
    // Logs detallados del error
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error en respuesta del servidor:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Error al configurar la solicitud
      console.error('Error al configurar la solicitud:', error.message);
    }
    
    throw error;
  }
}; 