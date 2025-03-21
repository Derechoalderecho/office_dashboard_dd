"use server";

import axios from "axios";
import { Users } from "@/types/users";
import { API_BASE_URL } from "@/config/api";

export const fetchUserDetails = async (id: string): Promise<Users | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/usuarios/${id}`);
    return response.data as Users;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};

export const fetchAllUsers = async (): Promise<Users[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/usuarios`);
    return response.data as Users[];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Fetch user by Firebase UID
export async function fetchUserByFirebaseUid(firebaseUid: string): Promise<Users | null> {
  try {
    // Obtener todos los usuarios
    const allUsers = await fetchAllUsers();
    console.log(`Buscando usuario con Firebase UID: ${firebaseUid}`);
    
    if (allUsers.length === 0) {
      console.warn("No se encontraron usuarios en el sistema");
      return null;
    }
    
    // Buscar el usuario con el id_usuario_firebase correspondiente
    const user = allUsers.find(user => user.id_usuario_firebase === firebaseUid);
    
    if (user) {
      console.log(`Usuario encontrado: ID=${user.id_usuario}, Nombre=${user.primer_nombre}`);
      return user;
    } else {
      console.warn(`No se encontró ningún usuario con Firebase UID: ${firebaseUid}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user by Firebase UID:', error);
    return null;
  }
}

// Get internal user ID from Firebase user
export async function getUserIdFromFirebase(firebaseUid: string): Promise<number | null> {
  try {
    if (!firebaseUid) {
      console.error("Firebase UID no proporcionado");
      return null;
    }
    
    console.log(`Obteniendo ID interno para Firebase UID: ${firebaseUid}`);
    const user = await fetchUserByFirebaseUid(firebaseUid);
    
    if (user && user.id_usuario) {
      console.log(`ID interno de usuario encontrado: ${user.id_usuario}`);
      return user.id_usuario;
    }
    
    console.warn("No se pudo obtener el ID interno del usuario");
    return null;
  } catch (error) {
    console.error("Error al obtener ID interno de usuario:", error);
    return null;
  }
}

// Create a new user with Firebase UID
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
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`Error creating user: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}
