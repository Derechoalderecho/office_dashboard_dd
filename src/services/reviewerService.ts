import axios from "axios";
import { Reviewers } from "@/types/reviewers";

const API_BASE_URL = "http://localhost:8080";

export const fetchReviewerDetails = async (id: string): Promise<Reviewers | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reviewers/${id}`);
    return response.data as Reviewers;
  } catch (error) {
    console.error("Error fetching reviewer details:", error);
    return null;
  }
};

export const fetchAllReviewers = async (): Promise<Reviewers[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/reviewers`);
    return response.data as Reviewers[];
  } catch (error) {
    console.error("Error fetching reviewers:", error);
    return [];
  }
};