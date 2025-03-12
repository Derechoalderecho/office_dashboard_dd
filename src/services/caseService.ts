"use server"

import axios from "axios";
import { Citizen } from "@/types/citizens";
import { Cases } from "@/types/cases";
import { API_BASE_URL } from "@/config/api";

// Define a type for the history log entries
export interface CaseHistoryLog {
  id_caso: number;
  estado_anterior: string;
  estado_nuevo: string;
  id_historial: number;
  fecha_cambio: string;
}

type CaseWithCitizen = Cases & { ciudadano: Citizen };
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
    const ciudadano = citizenResponse.data as Citizen;
    
    // Combine the case and citizen data
    return { ...caseData, ciudadano };
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
    const ciudadano = citizenResponse.data as Citizen;
    
    // Add the citizen data to each case
    return citizenCases.map(caseItem => ({ ...caseItem, ciudadano }));
  } catch (error) {
    console.error(`Error fetching cases for citizen ${citizenId}:`, error);
    return [];
  }
};

/**
 * Fetches history logs for a specific case
 * @param caseId The ID of the case to fetch history for
 * @returns Promise of array of history logs
 */
export const fetchCaseHistory = async (caseId: number): Promise<CaseHistoryLog[]> => {
  try {
    // Fetch all history logs
    const response = await axios.get(`${API_BASE_URL}/historial`);
    const allHistoryLogs = response.data as CaseHistoryLog[];
    
    // Filter logs by case ID
    const caseHistoryLogs = allHistoryLogs.filter(
      (log) => log.id_caso === caseId
    );
    
    // Sort logs by date (newest first)
    return caseHistoryLogs.sort((a, b) => 
      new Date(b.fecha_cambio).getTime() - new Date(a.fecha_cambio).getTime()
    );
  } catch (error) {
    console.error(`Error fetching history for case ${caseId}:`, error);
    return [];
  }
};



