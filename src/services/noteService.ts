"use server";

import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { Nota } from "@/types/cases";
import { fetchUserDetails } from "./userService";

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
      
      // Fetch user details for the note
      let userId: string | undefined = undefined;
      if (createdNote.id_usuario) {
        userId = createdNote.id_usuario.toString();
      } else if (createdNote.id_usuario_crea) {
        userId = createdNote.id_usuario_crea.toString();
      }
      
      let user = undefined;
      if (userId) {
        user = await fetchUserDetails(userId);
      }
      
      return {
        ...createdNote,
        usuario: user || undefined
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