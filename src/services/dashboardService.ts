"use server";

import { fetchAllUsers } from "@/services/userService";
import { fetchAllCasesDashboard } from "@/services/caseService";
import { fetchAllCitizens } from "@/services/citizenService";
import { getWithCache, getCollectionWithCache } from "@/utils/cacheUtils";
import { logger } from "@/utils/logUtils";
import { Cases } from "@/types/cases";
import { batchRequests } from "@/utils/apiUtils";

// Nombre de las cachés
const DASHBOARD_CACHE = 'dashboard';
const STATS_CACHE = 'statistics';

// TTL para las cachés (15 minutos)
const DASHBOARD_TTL = 15 * 60 * 1000;

/**
 * Tipo de datos para tarjetas de conteo en el dashboard
 */
export interface DashboardCounts {
  totalUsers: number;
  totalCases: number;
  totalCitizens: number;
}

/**
 * Tipo de datos para estadísticas de casos por procedimiento
 */
export interface CasesByProcedureType {
  procedure_type: string;
  count: number;
  fill: string;
}

/**
 * Tipo de datos para estadísticas de casos por resultado
 */
export interface CasesByOutcome {
  outcome: string;
  count: number;
  fill: string;
}

/**
 * Obtiene los conteos para las tarjetas del dashboard
 * @returns Objeto con los conteos de usuarios, casos y ciudadanos
 */
export const getDashboardCounts = async (): Promise<DashboardCounts> => {
  try {
    return await getWithCache<DashboardCounts>(
      DASHBOARD_CACHE,
      'counts',
      async () => {
        logger.debug("Obteniendo conteos para el dashboard");
        
        // Ejecutar las tres peticiones en paralelo
        const [users, cases, citizens] = await batchRequests([
          fetchAllUsers(),
          fetchAllCasesDashboard(),
          fetchAllCitizens(),
        ]);
        
        return {
          totalUsers: users.length,
          totalCases: cases.length,
          totalCitizens: citizens.length
        };
      },
      DASHBOARD_TTL
    );
  } catch (error) {
    logger.error("Error al obtener conteos para el dashboard:", error);
    return {
      totalUsers: 0,
      totalCases: 0,
      totalCitizens: 0
    };
  }
};

/**
 * Obtiene las estadísticas de casos por tipo de procedimiento
 * @returns Array con las estadísticas
 */
export const getCasesByProcedureType = async (): Promise<CasesByProcedureType[]> => {
  try {
    return await getWithCache<CasesByProcedureType[]>(
      STATS_CACHE,
      'procedure_types',
      async () => {
        logger.debug("Calculando estadísticas de casos por tipo de procedimiento");
        
        const cases = await fetchAllCasesDashboard();
        
        // Agrupar los casos por tipo de procedimiento
        const procedureMap = new Map<string, number>();
        
        cases.forEach(caseItem => {
          const procedureType = caseItem.tipo_procedimiento || 'Sin especificar';
          procedureMap.set(
            procedureType, 
            (procedureMap.get(procedureType) || 0) + 1
          );
        });
        
        // Colores para los diferentes tipos de procedimientos
        const colors = [
          "hsla(130, 67%, 54%, 1)",  // Verde
          "#4285F4",                  // Azul
          "#FF9900",                  // Naranja
          "hsla(261, 99%, 64%, 1)",   // Morado
          "hsla(233, 100%, 89%, 1)",  // Azul claro
          "#34A853"                   // Verde oscuro
        ];
        
        // Convertir a array para el gráfico
        let index = 0;
        return Array.from(procedureMap.entries()).map(([type, count]) => ({
          procedure_type: type,
          count,
          fill: colors[index++ % colors.length]
        }));
      },
      DASHBOARD_TTL
    );
  } catch (error) {
    logger.error("Error al obtener estadísticas por tipo de procedimiento:", error);
    return [];
  }
};

/**
 * Obtiene las estadísticas de casos por resultado (ganados/perdidos)
 * @returns Array con las estadísticas
 */
export const getCasesByOutcome = async (): Promise<CasesByOutcome[]> => {
  try {
    return await getWithCache<CasesByOutcome[]>(
      STATS_CACHE,
      'outcomes',
      async () => {
        logger.debug("Calculando estadísticas de casos por resultado");
        
        const cases = await fetchAllCasesDashboard();
        
        // Contar casos ganados y perdidos
        let ganados = 0;
        let perdidos = 0;
        
        cases.forEach(caseItem => {
          // Asumiendo que hay un campo estado o resultado que indica ganado/perdido
          // Adaptar esta lógica según la estructura real de los datos
          if (caseItem.estado === 'Ganado' || caseItem.resultado === 'Ganado') {
            ganados++;
          } else if (caseItem.estado === 'Perdido' || caseItem.resultado === 'Perdido') {
            perdidos++;
          }
        });
        
        return [
          { outcome: "Ganados", count: ganados, fill: "hsla(130, 67%, 54%, 1)" },
          { outcome: "Perdidos", count: perdidos, fill: "hsl(0, 70%, 50%)" }
        ];
      },
      DASHBOARD_TTL
    );
  } catch (error) {
    logger.error("Error al obtener estadísticas por resultado:", error);
    return [
      { outcome: "Ganados", count: 0, fill: "hsla(130, 67%, 54%, 1)" },
      { outcome: "Perdidos", count: 0, fill: "hsl(0, 70%, 50%)" }
    ];
  }
};

/**
 * Obtiene estadísticas de casos asignados por estudiante
 * @returns Datos para gráfico de casos por estudiante
 */
export const getCasesByStudent = async (): Promise<any[]> => {
  try {
    return await getWithCache<any[]>(
      STATS_CACHE,
      'student_cases',
      async () => {
        logger.debug("Calculando estadísticas de casos por estudiante");
        
        // Obtener usuarios y casos
        const [users, cases] = await batchRequests([
          fetchAllUsers(),
          fetchAllCasesDashboard()
        ]);
        
        // Filtrar solo usuarios que son estudiantes
        const students = users.filter(user => 
          user.tipo_usuario === 'estudiante' || 
          user.rol === 'estudiante');
        
        // Estructurar los datos para el gráfico
        return students.map(student => {
          // Contar casos asignados a este estudiante
          const studentCases = cases.filter(caseItem => {
            // Esta lógica depende de cómo se relacionan casos y estudiantes
            // Por ejemplo, podría ser a través de un campo id_usuario o usuarios_asignados
            return (
              (caseItem.id_usuario === student.id) || 
              (caseItem.usuarios_asignados && 
               caseItem.usuarios_asignados.includes(student.id))
            );
          });
          
          return {
            name: student.nombre || student.name,
            total: studentCases.length,
            // Agregar más métricas si son necesarias
          };
        });
      },
      DASHBOARD_TTL
    );
  } catch (error) {
    logger.error("Error al obtener estadísticas de casos por estudiante:", error);
    return [];
  }
};

/**
 * Refresca todas las cachés del dashboard
 * @returns true si se refrescaron correctamente, false en caso contrario
 */
export const refreshDashboardData = async (): Promise<boolean> => {
  try {
    logger.info("Refrescando datos del dashboard");
    
    // Ejecutar todas las funciones para actualizar los datos en caché
    await batchRequests([
      getDashboardCounts(),
      getCasesByProcedureType(),
      getCasesByOutcome(),
      getCasesByStudent()
    ], false);
    
    logger.info("Datos del dashboard refrescados correctamente");
    return true;
  } catch (error) {
    logger.error("Error al refrescar datos del dashboard:", error);
    return false;
  }
}; 