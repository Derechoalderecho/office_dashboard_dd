"use server";

import axios from "axios";
import { Citizen } from "@/types/citizens";

const API_BASE_URL = "http://127.0.0.1:8000";

export const fetchAllCitizens = async (): Promise<Citizen[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ciudadanos`);
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
    const response = await axios.get(`${API_BASE_URL}/ciudadanos/${id}`);
    return response.data as Citizen;
  } catch (error) {
    console.error("Error fetching citizen details:", error);
    return null;
  }
};
