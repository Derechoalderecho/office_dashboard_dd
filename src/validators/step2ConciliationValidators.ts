import { z } from "zod";

// Validador para el Step 2: Tratamiento de datos y firma
export const step2Schema = z.object({
  // SubStep 1: Confirmación de datos
  confirma_datos: z.boolean().refine(
    (val) => val === true,
    "Debe confirmar que los datos son correctos para continuar"
  ),

  // SubStep 2: Firma digital y confirmación de tratamiento
  firma_digital: z.union([
    z.instanceof(File),
    z.null(),
    z.undefined()
  ]).refine(
    (val) => val instanceof File,
    "Debe proporcionar una firma digital para continuar"
  ),

  confirma_tratamiento_datos: z.boolean().refine(
    (val) => val === true,
    "Debe confirmar que acepta los términos contractuales para continuar"
  ),

  // Campos opcionales
  foto_usuario: z.union([
    z.instanceof(File),
    z.string(),
    z.null(),
    z.undefined()
  ]).optional(),

  // Campo interno para controlar sub-pasos (no se valida)
  step2SubStep: z.number().optional(),
});

// Validadores específicos por SubStep
export const step2SubStep1Schema = z.object({
  confirma_datos: z.boolean().refine(
    (val) => val === true,
    "Debe confirmar que los datos son correctos para continuar"
  ),
});

export const step2SubStep2Schema = z.object({
  firma_digital: z.union([
    z.instanceof(File),
    z.null(),
    z.undefined()
  ]).refine(
    (val) => val instanceof File,
    "Debe proporcionar una firma digital para continuar"
  ),

  confirma_tratamiento_datos: z.boolean().refine(
    (val) => val === true,
    "Debe confirmar que acepta los términos contractuales para continuar"
  ),
});

// Función para validar SubStep específico
export const validateStep2SubStep = (data: any, subStep: number) => {
  try {
    switch (subStep) {
      case 0:
        // SubStep 0 siempre es válido (solo información)
        return { success: true, errors: {} };
      
      case 1:
        // SubStep 1: Solo validar confirmación de datos
        step2SubStep1Schema.parse(data);
        return { success: true, errors: {} };
      
      case 2:
        // SubStep 2: Validar firma y confirmación de tratamiento
        step2SubStep2Schema.parse(data);
        return { success: true, errors: {} };
      
      default:
        return { success: false, errors: { general: "SubStep no válido" } };
    }
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

// Función para validar Step 2 completo
export const validateStep2 = (data: any) => {
  try {
    step2Schema.parse(data);
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

// Función helper para determinar si se puede avanzar al siguiente SubStep
export const canAdvanceFromSubStep = (data: any, currentSubStep: number): boolean => {
  switch (currentSubStep) {
    case 0:
      // Siempre se puede avanzar del SubStep 0 (solo información)
      return true;
    
    case 1:
      // Se puede avanzar del SubStep 1 si los datos están confirmados
      return !!data.confirma_datos;
    
    case 2:
      // Se puede avanzar del SubStep 2 si hay firma Y se confirma tratamiento
      return !!(data.firma_digital && data.confirma_tratamiento_datos);
    
    default:
      return false;
  }
};

// Función helper para obtener el mensaje de error específico del SubStep
export const getSubStepErrorMessage = (currentSubStep: number): string => {
  switch (currentSubStep) {
    case 1:
      return "Debe confirmar que los datos son correctos para continuar";
    
    case 2:
      return "Debe proporcionar una firma digital y confirmar que acepta los términos contractuales";
    
    default:
      return "Complete los campos requeridos para continuar";
  }
};

// Tipos TypeScript derivados de los schemas
export type Step2FormData = z.infer<typeof step2Schema>;
export type Step2SubStep1Data = z.infer<typeof step2SubStep1Schema>;
export type Step2SubStep2Data = z.infer<typeof step2SubStep2Schema>;
