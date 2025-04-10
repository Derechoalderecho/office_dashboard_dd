"use server";

import { get } from "@/utils/apiUtils";
import { Cases } from "@/types/cases";
import { logger } from "@/utils/logUtils";

interface ChartDataPoint {
  date: string;
  count: number;
  fullDate?: string;
}

/**
 * Fetches total cases data for the dashboard chart, grouped by day
 * @returns Array of data points with date and case count
 */
export async function fetchCasesForAreaChart(): Promise<ChartDataPoint[]> {
  try {
    logger.debug("Fetching cases for area chart");
    
    // Fetch all cases
    const cases = await get<Cases[]>('casos');
    
    if (!cases || cases.length === 0) {
      return [];
    }
    
    // Group cases by day
    const groupedByDay = cases.reduce((acc, caseItem) => {
      // Parse the creation date
      const date = new Date(caseItem.fecha_crea);
      
      // Format as YYYY-MM-DD for grouping (one data point per day)
      const dayKey = date.toISOString().split('T')[0];
      
      // If this day doesn't exist in our accumulator yet, initialize it
      if (!acc[dayKey]) {
        acc[dayKey] = {
          date: dayKey,
          fullDate: date.toISOString(),
          count: 0
        };
      }
      
      // Increment the count for this day
      acc[dayKey].count += 1;
      
      return acc;
    }, {} as Record<string, ChartDataPoint>);
    
    // Convert the grouped data to an array and sort by date
    const chartData = Object.values(groupedByDay).sort((a, b) => 
      new Date(a.fullDate || a.date).getTime() - new Date(b.fullDate || b.date).getTime()
    );
    
    // Format dates for display
    return chartData.map(point => {
      const date = new Date(point.fullDate || point.date);
      
      // Format date as "DD MMM" (e.g., "15 ene")
      const formattedDate = date.toLocaleDateString('es-ES', { 
        day: 'numeric',
        month: 'short'
      });
      
      return {
        date: formattedDate,
        count: point.count,
        fullDate: point.fullDate || point.date
      };
    });
  } catch (error) {
    logger.error("Error fetching cases for area chart:", error);
    return [];
  }
}
