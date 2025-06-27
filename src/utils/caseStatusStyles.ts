/**
 * Utility to provide consistent styling for case status displays
 */

export type StatusStyleTypes = "badge" | "indicator" | "historyIndicator";

/**
 * Get the CSS classes for badge style based on case status
 * @param status The case status string
 * @returns CSS class string for badge
 */
export function getBadgeStyle(status: string): string {
  switch (status) {
    case "Aprobado":
      return "bg-success text-[#12A150]";
    case "Seguimiento":
      return "bg-followed text-[#006FEE]";
    case "Acción necesaria":
      return "bg-warning text-[#C4841D]";
    case "No aprobado":
      return "bg-error text-[#F31260]";
    case "Viabilidad":
      return "bg-purple-100 text-purple-600";
    case "Pendiente":
      return "bg-orange-100 text-orange-600";
    case "Revisar tutela":
      return "bg-amber-100 text-amber-600";
    case "Radicar":
      return "bg-emerald-100 text-emerald-600";
    case "Espera del juez":
      return "bg-sky-100 text-sky-600";
    case "Valoración del asesor":
      return "bg-teal-100 text-teal-600";
    case "Revisión de viabilidad":
      return "bg-amber-100 text-amber-600";
    case "Elaboración tutela":
      return "bg-indigo-100 text-indigo-600";
    case "En revisión":
      return "bg-amber-100 text-amber-600";
    case "Pendiente de radicación":
      return "bg-emerald-100 text-emerald-600";
    default:
      return "bg-warning text-[#C4841D]";
  }
}

/**
 * Get the CSS classes for indicator style based on case status
 * @param status The case status string
 * @returns CSS class string for indicator
 */
export function getIndicatorStyle(status: string): string {
  switch (status) {
    case "Aprobado":
      return "bg-[#12A150]";
    case "Seguimiento":
      return "bg-[#006FEE]";
    case "Acción necesaria":
      return "bg-[#C4841D]";
    case "No aprobado":
      return "bg-[#F31260]";
    case "Viabilidad":
      return "bg-purple-600";
    case "Pendiente":
      return "bg-orange-600";
    case "Revisar tutela":
      return "bg-amber-600";
    case "Radicar":
      return "bg-emerald-600";
    case "Espera del juez":
      return "bg-sky-600";
    case "Valoración del asesor":
      return "bg-teal-600";
    case "Revisión de viabilidad":
      return "bg-amber-600";
    case "Elaboración tutela":
      return "bg-indigo-600";
    case "En revisión":
      return "bg-amber-600";
    case "Pendiente de radicación":
      return "bg-emerald-600";
    default:
      return "bg-[#C4841D]";
  }
}

/**
 * Get the CSS classes for history indicator style based on case status
 * @param status The case status string
 * @returns CSS class string for history indicator
 */
export function getHistoryIndicatorStyle(status: string): string {
  switch (status) {
    case "Aprobado":
      return "bg-green-600";
    case "Seguimiento":
      return "bg-blue-600";
    case "Acción necesaria":
      return "bg-yellow-600";
    case "No aprobado":
      return "bg-red-600";
    case "Viabilidad":
      return "bg-purple-600";
    case "Pendiente":
      return "bg-orange-600";
    case "Revisar tutela":
      return "bg-amber-600";
    case "Radicar":
      return "bg-emerald-600";
    case "Espera del juez":
      return "bg-sky-600";
    case "Valoración del asesor":
      return "bg-teal-600";
    case "Revisión de viabilidad":
      return "bg-amber-600";
    case "Elaboración tutela":
      return "bg-indigo-600";
    case "En revisión":
      return "bg-amber-600";
    case "Pendiente de radicación":
      return "bg-emerald-600";
    default:
      return "bg-gray-600";
  }
}

/**
 * Get the CSS classes for a specific case status and style type
 * @param status The case status string
 * @param type The style type ('badge', 'indicator', or 'historyIndicator')
 * @returns CSS class string
 */
export function getCaseStatusStyles(
  status: string,
  type: StatusStyleTypes
): string {
  switch (type) {
    case "badge":
      return getBadgeStyle(status);
    case "indicator":
      return getIndicatorStyle(status);
    case "historyIndicator":
      return getHistoryIndicatorStyle(status);
    default:
      return "";
  }
}
