import axios from "axios";
import { Cases } from "@/types/cases";

const API_BASE_URL = "http://localhost:8080";

export const fetchAllCases = async (): Promise<Cases[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cases`);
    return response.data as Cases[];
  } catch (error) {
    console.error("Error fetching cases:", error);
    return [];
  }
};

export const fetchCaseDetails = async (id: string): Promise<Cases | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cases/${id}`);
    return response.data as Cases;
  } catch (error) {
    console.error("Error fetching case details:", error);
    return null;
  }
};
