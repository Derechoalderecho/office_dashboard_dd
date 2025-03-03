"use server";

import axios from "axios";
import { Users } from "@/types/users";

const API_BASE_URL = "http://127.0.0.1:8000";

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
    const response = await fetch(`${API_BASE_URL}/usuarios/${firebaseUid}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found
      }
      throw new Error(`Error fetching user: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user by Firebase UID:', error);
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
