"use server";

import { get } from "@/utils/apiUtils";
import { Cases } from "@/types/cases";
import { logger } from "@/utils/logUtils";

interface ChartDataPoint {
  date: string;
  count: number;
  fullDate?: string;
}

interface ChartDataPointByStatus {
  date: string;
  viable: number;
  noAprobado: number;
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
      logger.warn("No cases found for area chart");
      return [];
    }
    
    logger.info(`Fetched ${cases.length} cases for area chart`);
    
    // Group cases by day
    const groupedByDay = cases.reduce((acc, caseItem) => {
      // Skip invalid dates or missing fecha_crea
      if (!caseItem.fecha_crea) {
        return acc;
      }
      
      try {
        // Parse the creation date
        const date = new Date(caseItem.fecha_crea);
        
        // Validate date is valid
        if (isNaN(date.getTime())) {
          return acc;
        }
        
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
      } catch (err) {
        logger.error(`Error processing case ${caseItem.id_caso}:`, err);
        return acc;
      }
    }, {} as Record<string, ChartDataPoint>);
    
    // Convert the grouped data to an array and sort by date
    const chartData = Object.values(groupedByDay).sort((a, b) => 
      new Date(a.fullDate || a.date).getTime() - new Date(b.fullDate || b.date).getTime()
    );
    
    logger.info(`Processed ${chartData.length} data points for area chart`);
    
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

/**
 * Fetches cases data grouped by status (viable and not approved) for the dashboard chart
 * @returns Array of data points with date and case counts by status
 */
export async function fetchCasesByStatusForAreaChart(): Promise<ChartDataPointByStatus[]> {
  try {
    logger.debug("Fetching cases by status for area chart");
    
    // Fetch all cases
    const cases = await get<Cases[]>('casos');
    
    if (!cases || cases.length === 0) {
      logger.warn("No cases found for area chart by status");
      return [];
    }
    
    logger.info(`Fetched ${cases.length} cases for area chart by status`);
    
    // Group cases by day and status
    const groupedByDayAndStatus = cases.reduce((acc, caseItem) => {
      // Skip invalid dates or missing fecha_crea
      if (!caseItem.fecha_crea) {
        return acc;
      }
      
      try {
        // Parse the creation date
        const date = new Date(caseItem.fecha_crea);
        
        // Validate date is valid
        if (isNaN(date.getTime())) {
          return acc;
        }
        
        // Format as YYYY-MM-DD for grouping (one data point per day)
        const dayKey = date.toISOString().split('T')[0];
        
        // If this day doesn't exist in our accumulator yet, initialize it
        if (!acc[dayKey]) {
          acc[dayKey] = {
            date: dayKey,
            fullDate: date.toISOString(),
            viable: 0,
            noAprobado: 0
          };
        }
        
        // Increment the count for this day based on status
        if (caseItem.estado === "Viabilidad") {
          acc[dayKey].viable += 1;
        } else if (caseItem.estado === "No aprobado") {
          acc[dayKey].noAprobado += 1;
        }
        
        return acc;
      } catch (err) {
        logger.error(`Error processing case ${caseItem.id_caso} by status:`, err);
        return acc;
      }
    }, {} as Record<string, ChartDataPointByStatus>);
    
    // Convert the grouped data to an array and sort by date
    const chartData = Object.values(groupedByDayAndStatus).sort((a, b) => 
      new Date(a.fullDate || a.date).getTime() - new Date(b.fullDate || b.date).getTime()
    );
    
    logger.info(`Processed ${chartData.length} data points for area chart by status`);
    
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
        viable: point.viable,
        noAprobado: point.noAprobado,
        fullDate: point.fullDate || point.date
      };
    });
  } catch (error) {
    logger.error("Error fetching cases by status for area chart:", error);
    return [];
  }
}
