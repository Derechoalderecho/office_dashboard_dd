import { z } from "zod";

// Validador para el Step 3: Contrapartes del caso
// Solo valida campos obligatorios, excluye ciudadano_citado, existen_ciudadano_beneficiado y ciudadano_beneficiado
export const step3Schema = z.object({
  // Campos obligatorios del Step 3
  tipo_proceso: z.string().min(1, "Debe seleccionar un tipo de proceso"),
  
  materia_del_caso: z.string().min(1, "Debe seleccionar el área o materia del caso"),

  // Campos opcionales que NO se validan (según instrucciones del usuario)
  ciudadano_citado: z.array(z.any()).optional(),
  existen_ciudadano_beneficiado: z.boolean().optional(),
  ciudadano_beneficiado: z.array(z.any()).optional(),
});

// Validador más estricto que solo incluye los campos obligatorios
export const step3RequiredFieldsSchema = z.object({
  tipo_proceso: z.string().min(1, "Debe seleccionar un tipo de proceso"),
  materia_del_caso: z.string().min(1, "Debe seleccionar el área o materia del caso"),
});

// Función para validar Step 3
export const validateStep3 = (data: any) => {
  try {
    // Solo validar campos obligatorios
    step3RequiredFieldsSchema.parse({
      tipo_proceso: data.tipo_proceso,
      materia_del_caso: data.materia_del_caso,
    });
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

// Función helper para verificar si el Step 3 está completo
export const isStep3Complete = (data: any): boolean => {
  const validation = validateStep3(data);
  return validation.success;
};

// Función helper para obtener campos faltantes
export const getMissingStep3Fields = (data: any): string[] => {
  const missingFields: string[] = [];
  
  if (!data.tipo_proceso || data.tipo_proceso.trim() === "") {
    missingFields.push("Tipo de proceso");
  }
  
  if (!data.materia_del_caso || data.materia_del_caso.trim() === "") {
    missingFields.push("Área o materia del caso");
  }
  
  return missingFields;
};

// Función helper para obtener mensaje de error personalizado
export const getStep3ErrorMessage = (data: any): string => {
  const missingFields = getMissingStep3Fields(data);
  
  if (missingFields.length === 0) {
    return "";
  }
  
  if (missingFields.length === 1) {
    return `Debe completar el campo: ${missingFields[0]}`;
  }
  
  return `Debe completar los siguientes campos: ${missingFields.join(", ")}`;
};

// Enums para los valores válidos (para referencia futura)
export const TipoProceso = {
  SOLICITUD_CONCILIACION: "Solicitud de conciliación",
  AUDIENCIA_CONCILIACION: "Audiencia de conciliación",
} as const;

export const MateriaCaso = {
  FAMILIAR: "Familiar",
  // Se pueden agregar más materias en el futuro
} as const;

// Tipos TypeScript derivados de los schemas
export type Step3FormData = z.infer<typeof step3Schema>;
export type Step3RequiredFields = z.infer<typeof step3RequiredFieldsSchema>;
export type TipoProcesoType = typeof TipoProceso[keyof typeof TipoProceso];
export type MateriaCasoType = typeof MateriaCaso[keyof typeof MateriaCaso];
