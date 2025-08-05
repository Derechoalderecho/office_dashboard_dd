import { z } from "zod";

// Validador para el Step 4: Información del caso
// Incluye todos los campos con isRequired y anexos obligatorios
export const step4Schema = z.object({
  // Campos de texto obligatorios
  inicio_de_conflicto: z.string().min(1, "Debe describir cuándo se inició el conflicto"),
  
  escala_del_conflicto: z.string().min(1, "Debe describir la escala del conflicto"),
  
  ultima_intervencion: z.string().min(1, "Debe seleccionar el tipo de última intervención"),
  
  fecha_intervencion: z.string().min(1, "Debe seleccionar la fecha de intervención"),
  
  modalidad_audiencia: z.string().min(1, "Debe seleccionar la modalidad de audiencia"),
  
  hechos: z.string().min(1, "Debe describir los hechos de la controversia"),
  
  pretensiones: z.string().min(1, "Debe describir las pretensiones solicitadas"),
  
  cuantia: z.string().min(1, "Debe especificar la cuantía del conflicto"),
  
  pruebas_solicitante: z.string().min(1, "Debe describir las pruebas del solicitante"),
  
  pruebas_citado: z.string().min(1, "Debe describir las pruebas del citado"),

  // Anexos obligatorios
  anexo_registro_civil: z.union([
    z.instanceof(File),
    z.null(),
    z.undefined()
  ]).refine(
    (val) => val instanceof File,
    "Debe adjuntar el registro civil del menor"
  ),

  anexo_cedula_solicitante: z.union([
    z.instanceof(File),
    z.null(),
    z.undefined()
  ]).refine(
    (val) => val instanceof File,
    "Debe adjuntar la cédula del solicitante"
  ),

  // Campos opcionales que NO se validan
  documento_firmado: z.string().optional(),
  fundamentos_derecho: z.string().optional(),
  anexos_adicionales: z.array(z.any()).optional(),
});

// Función para validar Step 4
export const validateStep4 = (data: any) => {
  try {
    step4Schema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join(".");
        formattedErrors[path] = err.message;
      });
      return { success: false, errors: formattedErrors };
    }
    return { success: false, errors: { general: "Error de validación" } };
  }
};

// Función helper para verificar si el Step 4 está completo
export const isStep4Complete = (data: any): boolean => {
  const validation = validateStep4(data);
  return validation.success;
};

// Función helper para obtener campos faltantes
export const getMissingStep4Fields = (data: any): string[] => {
  const missingFields: string[] = [];
  
  if (!data.inicio_de_conflicto || data.inicio_de_conflicto.trim() === "") {
    missingFields.push("Inicio del conflicto");
  }
  
  if (!data.escala_del_conflicto || data.escala_del_conflicto.trim() === "") {
    missingFields.push("Escala del conflicto");
  }
  
  if (!data.ultima_intervencion || data.ultima_intervencion.trim() === "") {
    missingFields.push("Última intervención");
  }
  
  if (!data.fecha_intervencion || data.fecha_intervencion.trim() === "") {
    missingFields.push("Fecha de intervención");
  }
  
  if (!data.modalidad_audiencia || data.modalidad_audiencia.trim() === "") {
    missingFields.push("Modalidad de audiencia");
  }
  
  if (!data.hechos || data.hechos.trim() === "") {
    missingFields.push("Hechos");
  }
  
  if (!data.pretensiones || data.pretensiones.trim() === "") {
    missingFields.push("Pretensiones");
  }
  
  if (!data.cuantia || data.cuantia.trim() === "") {
    missingFields.push("Cuantía");
  }
  
  if (!data.pruebas_solicitante || data.pruebas_solicitante.trim() === "") {
    missingFields.push("Pruebas del solicitante");
  }
  
  if (!data.pruebas_citado || data.pruebas_citado.trim() === "") {
    missingFields.push("Pruebas del citado");
  }
  
  if (!(data.anexo_registro_civil instanceof File)) {
    missingFields.push("Registro civil del menor");
  }
  
  if (!(data.anexo_cedula_solicitante instanceof File)) {
    missingFields.push("Cédula del solicitante");
  }
  
  return missingFields;
};

// Función helper para obtener mensaje de error personalizado
export const getStep4ErrorMessage = (data: any): string => {
  const missingFields = getMissingStep4Fields(data);
  
  if (missingFields.length === 0) {
    return "";
  }
  
  if (missingFields.length === 1) {
    return `Debe completar: ${missingFields[0]}`;
  }
  
  if (missingFields.length <= 3) {
    return `Debe completar: ${missingFields.join(", ")}`;
  }
  
  return `Debe completar ${missingFields.length} campos obligatorios`;
};

// Enums para los valores válidos
export const UltimaIntervencion = {
  DIRECTA: "Directamente sin intervención de terceros",
  INSTITUCIONAL: "Con intervención de terceros institucionales",
  NO_INSTITUCIONAL: "Con intervención de terceros no institucionales",
} as const;

export const ModalidadAudiencia = {
  VIRTUAL: "Virtual",
  PRESENCIAL: "Presencial",
} as const;

// Función helper para validar solo campos de texto (sin archivos)
export const validateStep4TextFields = (data: any) => {
  const textFieldsSchema = z.object({
    inicio_de_conflicto: z.string().min(1, "Debe describir cuándo se inició el conflicto"),
    escala_del_conflicto: z.string().min(1, "Debe describir la escala del conflicto"),
    ultima_intervencion: z.string().min(1, "Debe seleccionar el tipo de última intervención"),
    fecha_intervencion: z.string().min(1, "Debe seleccionar la fecha de intervención"),
    modalidad_audiencia: z.string().min(1, "Debe seleccionar la modalidad de audiencia"),
    hechos: z.string().min(1, "Debe describir los hechos de la controversia"),
    pretensiones: z.string().min(1, "Debe describir las pretensiones solicitadas"),
    cuantia: z.string().min(1, "Debe especificar la cuantía del conflicto"),
    pruebas_solicitante: z.string().min(1, "Debe describir las pruebas del solicitante"),
    pruebas_citado: z.string().min(1, "Debe describir las pruebas del citado"),
  });

  try {
    textFieldsSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join(".");
        formattedErrors[path] = err.message;
      });
      return { success: false, errors: formattedErrors };
    }
    return { success: false, errors: { general: "Error de validación" } };
  }
};

// Función helper para validar solo archivos obligatorios
export const validateStep4RequiredFiles = (data: any) => {
  const filesSchema = z.object({
    anexo_registro_civil: z.union([
      z.instanceof(File),
      z.null(),
      z.undefined()
    ]).refine(
      (val) => val instanceof File,
      "Debe adjuntar el registro civil del menor"
    ),

    anexo_cedula_solicitante: z.union([
      z.instanceof(File),
      z.null(),
      z.undefined()
    ]).refine(
      (val) => val instanceof File,
      "Debe adjuntar la cédula del solicitante"
    ),
  });

  try {
    filesSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join(".");
        formattedErrors[path] = err.message;
      });
      return { success: false, errors: formattedErrors };
    }
    return { success: false, errors: { general: "Error de validación" } };
  }
};

// Tipos TypeScript derivados de los schemas
export type Step4FormData = z.infer<typeof step4Schema>;
export type UltimaIntervencionType = typeof UltimaIntervencion[keyof typeof UltimaIntervencion];
export type ModalidadAudienciaType = typeof ModalidadAudiencia[keyof typeof ModalidadAudiencia];
