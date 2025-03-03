"use server"

// src/services/caseService.ts
import axios from "axios";
import { Citizen } from "@/types/citizens";
import { Cases } from "@/types/cases";
import { API_BASE_URL } from "@/config/api";

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
        const ciudadano = citizenResponse.data as Citizen;
        return { ...caseItem, ciudadano };
      })
    );

    return casesWithCitizens;
  } catch (error) {
    console.error("Error fetching cases:", error);
    return [];
  }
};
