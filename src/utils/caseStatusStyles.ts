/**
 * Utility to provide consistent styling for case status displays
 */

type StatusStyleTypes = "badge" | "indicator" | "historyIndicator";

interface StatusStyles {
  badge: string;
  indicator: string;
  historyIndicator: string;
}

const statusStyleMap: Record<string, StatusStyles> = {
  //docente
  "Aprobado": {
    badge: "bg-success text-[#12A150]",
    indicator: "bg-[#12A150]",
    historyIndicator: "bg-green-600",
  },
  "Seguimiento": {
    badge: "bg-followed text-[#006FEE]",
    indicator: "bg-[#006FEE]",
    historyIndicator: "bg-blue-600",
  },
  "Acción necesaria": {
    badge: "bg-warning text-[#C4841D]",
    indicator: "bg-[#C4841D]",
    historyIndicator: "bg-yellow-600",
  },
  "No aprobado": {
    badge: "bg-error text-[#F31260]",
    indicator: "bg-[#F31260]",
    historyIndicator: "bg-red-600",
  },
  "Viabilidad": {
    badge: "bg-purple-100 text-purple-600",
    indicator: "bg-purple-100",
    historyIndicator: "bg-purple-600",
  },
  "Pendiente": {
    badge: "bg-orange-100 text-orange-600",
    indicator: "bg-orange-100",
    historyIndicator: "bg-orange-600",
  },
  "Revisar tutela": {
    badge: "bg-amber-100 text-amber-600",
    indicator: "bg-amber-100",
    historyIndicator: "bg-amber-600",
  },
  "Radicar": {
    badge: "bg-emerald-100 text-emerald-600",
    indicator: "bg-emerald-100",
    historyIndicator: "bg-emerald-600",
  },
  "Espera del juez": {
    badge: "bg-sky-100 text-sky-600",
    indicator: "bg-sky-100",
    historyIndicator: "bg-sky-600",
  },
  "Valoración del asesor": {
    badge: "bg-teal-100 text-teal-600",
    indicator: "bg-teal-100",
    historyIndicator: "bg-teal-600",
  },
  //Estudiante
  "Revisión de viabilidad": {
    badge: "bg-amber-100 text-amber-600",
    indicator: "bg-amber-100",
    historyIndicator: "bg-amber-600",
  },
  "Elaboración tutela": {
    badge: "bg-indigo-100 text-indigo-600",
    indicator: "bg-indigo-100",
    historyIndicator: "bg-indigo-600",
  },
  "En revisión": {
    badge: "bg-amber-100 text-amber-600",
    indicator: "bg-amber-100",
    historyIndicator: "bg-amber-600",
  },
  "Pendiente de radicación": {
    badge: "bg-emerald-100 text-emerald-600",
    indicator: "bg-emerald-100",
    historyIndicator: "bg-emerald-600",
  },
};

// Default styles as fallback
const defaultStyles: StatusStyles = {
  badge: "bg-warning text-[#C4841D]",
  indicator: "bg-[#C4841D]",
  historyIndicator: "bg-gray-600",
};

/**
 * Get the CSS classes for a specific case status and style type
 * @param status The case status string
 * @param type The style type ('badge' or 'indicator')
 * @returns CSS class string
 */
export function getCaseStatusStyles(
  status: string,
  type: StatusStyleTypes
): string {
  const styles = statusStyleMap[status] || defaultStyles;
  return styles[type];
}
