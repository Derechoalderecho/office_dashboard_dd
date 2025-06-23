/**
 * Utility to provide consistent styling for case status displays
 */

type StatusStyleTypes = "badge" | "indicator";

interface StatusStyles {
  badge: string;
  indicator: string;
}

const statusStyleMap: Record<string, StatusStyles> = {
  //docente
  "Aprobado": {
    badge: "bg-success text-[#12A150]",
    indicator: "bg-[#12A150]",
  },
  "Seguimiento": {
    badge: "bg-followed text-[#006FEE]",
    indicator: "bg-[#006FEE]",
  },
  "Acción necesaria": {
    badge: "bg-warning text-[#C4841D]",
    indicator: "bg-[#C4841D]",
  },
  "No aprobado": {
    badge: "bg-error text-[#F31260]",
    indicator: "bg-[#F31260]",
  },
  "Viabilidad": {
    badge: "bg-purple-100 text-purple-600",
    indicator: "bg-purple-100",
  },
  "Pendiente": {
    badge: "bg-rose-100 text-rose-600",
    indicator: "bg-rose-100",
  },
  "Revisar tutela": {
    badge: "bg-amber-100 text-amber-600",
    indicator: "bg-amber-100",
  },
  "Radicar": {
    badge: "bg-emerald-100 text-emerald-600",
    indicator: "bg-emerald-100",
  },
  "Espera del juez": {
    badge: "bg-sky-100 text-sky-600",
    indicator: "bg-sky-100",
  },
  "Valoración del asesor": {
    badge: "bg-teal-100 text-teal-600",
    indicator: "bg-teal-100",
  },
  //Estudiante
  "Revisión de viabilidad": {
    badge: "bg-amber-100 text-amber-600",
    indicator: "bg-amber-100",
  },
  "Elaboración tutela": {
    badge: "bg-indigo-100 text-indigo-600",
    indicator: "bg-indigo-100",
  },
  "En revisión": {
    badge: "bg-amber-100 text-amber-600",
    indicator: "bg-amber-100",
  },
  "Pendiente de radicación": {
    badge: "bg-emerald-100 text-emerald-600",
    indicator: "bg-emerald-100",
  },
};

// Default styles as fallback
const defaultStyles: StatusStyles = {
  badge: "bg-warning text-[#C4841D]",
  indicator: "bg-[#C4841D]",
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
