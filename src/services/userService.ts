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
