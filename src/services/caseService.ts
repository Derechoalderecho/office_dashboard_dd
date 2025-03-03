"use server"

import axios from "axios";
import { Citizen } from "@/types/citizens";
import { Cases } from "@/types/cases";

const API_BASE_URL = "http://127.0.0.1:8000";

// Define a type that includes the citizen property
type CaseWithCitizen = Cases & { citizen: Citizen };

// Create a promise type for the cases
type CasesPromise = Promise<CaseWithCitizen[]>;

export const fetchAllCases = async (): Promise<CaseWithCitizen[]> => {
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

/**
 * Fetches a specific case by ID along with its related citizen data
 * @param id The ID of the case to fetch
 * @returns The case with citizen data or null if not found
 */
export const fetchCaseById = async (id: number): Promise<CaseWithCitizen | null> => {
  try {
    // Fetch the case data
    const caseResponse = await axios.get(`${API_BASE_URL}/casos/${id}`);
    const caseData = caseResponse.data as Cases;
    
    if (!caseData) {
      console.error(`Case with ID ${id} not found`);
      return null;
    }
    
    // Fetch the related citizen data
    const citizenResponse = await axios.get(
      `${API_BASE_URL}/ciudadanos/${caseData.id_ciudadano}`
    );
    const citizen = citizenResponse.data as Citizen;
    
    // Combine the case and citizen data
    return { ...caseData, citizen };
  } catch (error) {
    console.error(`Error fetching case with ID ${id}:`, error);
    return null;
  }
};

/**
 * Fetches all cases for a specific citizen
 * @param citizenId The ID of the citizen
 * @returns Promise of array of cases belonging to the citizen
 */
export const fetchCasesByCitizenId = async (citizenId: number): CasesPromise => {
  try {
    // Fetch all cases
    const response = await axios.get(`${API_BASE_URL}/casos`);
    const allCases = response.data as Cases[];
    
    // Filter cases by citizen ID
    const citizenCases = allCases.filter(
      (caseItem) => caseItem.id_ciudadano === citizenId
    );
    
    // Fetch the citizen data once
    const citizenResponse = await axios.get(
      `${API_BASE_URL}/ciudadanos/${citizenId}`
    );
    const citizen = citizenResponse.data as Citizen;
    
    // Add the citizen data to each case
    return citizenCases.map(caseItem => ({ ...caseItem, citizen }));
  } catch (error) {
    console.error(`Error fetching cases for citizen ${citizenId}:`, error);
    return [];
  }
};



