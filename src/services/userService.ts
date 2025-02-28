import axios from "axios";
import { Users } from "@/types/users";

const API_BASE_URL = "http://localhost:8080";

export const fetchUserDetails = async (id: string): Promise<Users | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${id}`);
    return response.data as Users;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
};

export const fetchAllUsers = async (): Promise<Users[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data as Users[];
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const fetchActiveUsers = async (): Promise<Users[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/active`);
    return response.data as Users[];
  } catch (error) {
    console.error("Error fetching active users:", error);
    return [];
  }
};

export const fetchInactiveUsers = async (): Promise<Users[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/inactive`);
    return response.data as Users[];
  } catch (error) {
    console.error("Error fetching inactive users:", error);
    return [];
  }
};
