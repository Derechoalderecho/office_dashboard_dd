import axios from "axios";
import { Citizen } from "@/types/citizens";

const API_BASE_URL = "http://localhost:8080";

export const fetchAllCitizens = async (): Promise<Citizen[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/citizens`);
    return response.data as Citizen[];
  } catch (error) {
    console.error("Error fetching citizens:", error);
    return [];
  }
};

export const fetchCitizenDetails = async (
  id: string
): Promise<Citizen | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/citizens/${id}`);
    return response.data as Citizen;
  } catch (error) {
    console.error("Error fetching citizen details:", error);
    return null;
  }
};
