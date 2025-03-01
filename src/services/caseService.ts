"use server"

import axios from "axios";
import { Citizen } from "@/types/citizens";
import { Cases } from "@/types/cases";

const API_BASE_URL = "http://127.0.0.1:8000";

export const fetchAllCases = async (): Promise<Cases[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/casos`);
    const cases = response.data as Cases[];

    // Fetch related citizen data for each case
    const casesWithCitizens = await Promise.all(
      cases.map(async (caseItem) => {
        const citizenResponse = await axios.get(
          `${API_BASE_URL}/ciudadanos/${caseItem.id_ciudadano}`
        );
        const citizen = citizenResponse.data as Citizen;
        return { ...caseItem, citizen };
      })
    );

    return casesWithCitizens;
  } catch (error) {
    console.error("Error fetching cases:", error);
    return [];
  }
};
 

