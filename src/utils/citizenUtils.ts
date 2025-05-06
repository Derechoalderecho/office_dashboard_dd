/**
 * Maps a zona display value to its database code
 * @param zona The zona display value
 * @returns The zona database code
 */
export function convertZonaToCode(zona: string): string {
  switch (zona?.toLowerCase()) {
    case "urbana":
      return "UR";
    case "rural":
      return "RU";
    default:
      return zona?.length > 6 ? zona.substring(0, 6) : (zona || "");
  }
}

/**
 * Maps a zona database code to its display value
 * @param code The zona database code
 * @returns The zona display value
 */
export function convertZonaCodeToDisplay(code: string): string {
  switch (code) {
    case "UR":
      return "Urbana";
    case "RU":
      return "Rural";
    default:
      return code || "";
  }
}

/**
 * Creates a SelectItem keys set for the zona field
 * @param zona The zona value (either code or display)
 * @returns A Set of keys for the Select component
 */
export function mapZonaForSelect(zona: string): Set<string> {
  if (!zona) return new Set([]);
  
  switch (zona.toLowerCase()) {
    case "urbana":
      return new Set(["UR"]);
    case "rural":
      return new Set(["RU"]);
    case "ur":
    case "UR":
      return new Set(["UR"]);
    case "ru":
    case "RU":
      return new Set(["RU"]);
    default:
      return new Set([zona]);
  }
} 