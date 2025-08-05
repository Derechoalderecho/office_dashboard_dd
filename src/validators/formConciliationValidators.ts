import { z } from "zod";

// Validador para el Step 1: Información básica del ciudadano solicitante
export const step1CiudadanoSolicitanteSchema = z.object({
  // Documento de identidad
  tipo_documento: z.string().min(1, "Debe seleccionar un tipo de documento"),
  
  num_documento: z.string().optional(),

  // Información personal básica
  primer_nombre: z.string().min(2, "El primer nombre debe tener al menos 2 caracteres")
    .max(50, "El primer nombre no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El primer nombre solo puede contener letras"),

  segundo_nombre: z.string().optional()
    .refine((val) => !val || val.length >= 2, "El segundo nombre debe tener al menos 2 caracteres")
    .refine((val) => !val || val.length <= 50, "El segundo nombre no puede exceder 50 caracteres")
    .refine((val) => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), "El segundo nombre solo puede contener letras"),

  primer_apellido: z.string().min(2, "El primer apellido debe tener al menos 2 caracteres")
    .max(50, "El primer apellido no puede exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El primer apellido solo puede contener letras"),

  segundo_apellido: z.string().optional()
    .refine((val) => !val || val.length >= 2, "El segundo apellido debe tener al menos 2 caracteres")
    .refine((val) => !val || val.length <= 50, "El segundo apellido no puede exceder 50 caracteres")
    .refine((val) => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), "El segundo apellido solo puede contener letras"),

  // Fechas
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es requerida")
    .refine((val) => {
      const date = new Date(val);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
      const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      return date >= minDate && date <= maxDate;
    }, "Debe ser mayor de 18 años y menor de 120 años"),

  fecha_expedicion: z.string().optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      return date <= today;
    }, "La fecha de expedición no puede ser futura"),

  // Información demográfica
  sexo: z.enum(["Hombre", "Mujer", "Intersexual", "Prefiere no decirlo", "Otro"]),

  genero: z.enum(["Masculino", "Femenino", "Transgénero", "No binario"]),

  orientacion_sexual: z.enum(["Heterosexual", "Homosexual", "Bisexual", "Asexual", "Pansexual"]),

  // Información de contacto
  num_movil: z.string().min(10, "El número móvil debe tener al menos 10 dígitos")
    .max(15, "El número móvil no puede exceder 15 dígitos")
    .regex(/^[0-9]+$/, "El número móvil solo puede contener números"),

  telefono_fijo: z.string().optional()
    .refine((val) => !val || (val.length >= 7 && val.length <= 15), "El teléfono fijo debe tener entre 7 y 15 dígitos")
    .refine((val) => !val || /^[0-9]+$/.test(val), "El teléfono fijo solo puede contener números"),

  email: z.string().optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, "Debe ser un email válido"),

  // Información adicional
  nacionalidad: z.string().min(1, "Debe seleccionar una nacionalidad"),

  otra_nacionalidad: z.string().optional(),

  estado_civil: z.enum(["Soltero/a", "Casado/a", "Unión libre", "Divorciado/a", "Viudo/a", "No informa"]),

  escolaridad: z.enum([
    "Ninguna", "Preescolar", "Primaria", "Secundaria", "Media", 
    "Técnica/Tecnológica", "Pregrado", "Maestría", "Doctorado"
  ] as const),

  ocupacion: z.string().optional()
    .refine((val) => !val || val.length <= 100, "La ocupación no puede exceder 100 caracteres"),

  etnia: z.enum([
    "Indígena", "Afrocolombiano", "Mestizo", "Raizal", "Rom/Gitano", 
    "Ninguna", "Otro", "Prefiero no decirlo"
  ] as const),

  // Información socioeconómica y geográfica
  estrato: z.union([z.string(), z.null()]).optional()
    .refine((val) => {
      if (!val) return true;
      const num = parseInt(val.toString());
      return num >= 1 && num <= 6;
    }, "El estrato debe estar entre 1 y 6"),

  zona_residencia: z.enum(["Urbana", "Rural"]).optional(),

  departamento: z.string().min(1, "Debe seleccionar un departamento"),

  municipio: z.string().min(1, "Debe seleccionar un municipio"),

  dane_municipio: z.string().optional(),

  // Información adicional
  discapacidad: z.union([z.boolean(), z.string()]).transform((val) => {
    if (typeof val === "string") {
      return val === "true";
    }
    return val;
  }),

  sabe_leer_escribir: z.union([z.boolean(), z.string()]).transform((val) => {
    if (typeof val === "string") {
      return val === "true";
    }
    return val;
  }),

  direccion_residencia: z.string().optional()
    .refine((val) => !val || val.length <= 200, "La dirección no puede exceder 200 caracteres"),
}).superRefine((data, ctx) => {
  // Validación personalizada para el número de documento
  if (data.tipo_documento !== "SD" && (!data.num_documento || data.num_documento.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El número de documento es requerido para el tipo de documento seleccionado",
      path: ["num_documento"],
    });
  }
});

// Validador para el Step 1 completo
export const step1Schema = z.object({
  ciudadano_solicitante: step1CiudadanoSolicitanteSchema,
});

// Función para validar el Step 1
// Validador flexible para ciudadanos existentes (maneja campos vacíos/null)
export const step1CiudadanoExistenteSchema = z.object({
  // Documento de identidad
  tipo_documento: z.string().min(1, "Debe seleccionar un tipo de documento"),
  
  num_documento: z.string().optional(),

  // Información personal básica (más flexible)
  primer_nombre: z.string().optional()
    .refine((val) => !val || (val.length >= 2 && val.length <= 50), "El primer nombre debe tener entre 2 y 50 caracteres")
    .refine((val) => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), "El primer nombre solo puede contener letras"),

  segundo_nombre: z.string().optional()
    .refine((val) => !val || (val.length >= 2 && val.length <= 50), "El segundo nombre debe tener entre 2 y 50 caracteres")
    .refine((val) => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), "El segundo nombre solo puede contener letras"),

  primer_apellido: z.string().optional()
    .refine((val) => !val || (val.length >= 2 && val.length <= 50), "El primer apellido debe tener entre 2 y 50 caracteres")
    .refine((val) => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), "El primer apellido solo puede contener letras"),

  segundo_apellido: z.string().optional()
    .refine((val) => !val || (val.length >= 2 && val.length <= 50), "El segundo apellido debe tener entre 2 y 50 caracteres")
    .refine((val) => !val || /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val), "El segundo apellido solo puede contener letras"),

  // Fechas (más flexibles)
  fecha_nacimiento: z.string().optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
      const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      return date >= minDate && date <= maxDate;
    }, "Debe ser mayor de 18 años y menor de 120 años"),

  fecha_expedicion: z.string().optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      const today = new Date();
      return date <= today;
    }, "La fecha de expedición no puede ser futura"),

  // Información demográfica (opcional)
  sexo: z.string().optional(),
  genero: z.string().optional(),
  orientacion_sexual: z.string().optional(),

  // Información de contacto (ultra flexible para ciudadanos existentes)
  num_movil: z.string().optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      // Extraer solo los números
      const numbersOnly = val.replace(/[^0-9]/g, '');
      // Si tiene menos de 7 dígitos, probablemente está incompleto - lo ignoramos
      if (numbersOnly.length < 7) return true;
      // Si tiene 7 o más, validamos que esté en rango razonable
      return numbersOnly.length >= 7 && numbersOnly.length <= 15;
    }, "El número móvil debe tener un formato válido")
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      // Permitir cualquier combinación de números y caracteres comunes de teléfono
      // Incluso si está incompleto
      return /^[0-9\s\(\)\-\+\.\#\*ext\w]*$/i.test(val);
    }, "El número móvil contiene caracteres no permitidos"),

  telefono_fijo: z.string().optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      // Extraer solo los números
      const numbersOnly = val.replace(/[^0-9]/g, '');
      // Si tiene menos de 6 dígitos, probablemente está incompleto - lo ignoramos
      if (numbersOnly.length < 6) return true;
      // Si tiene 6 o más, validamos que esté en rango razonable
      return numbersOnly.length >= 6 && numbersOnly.length <= 15;
    }, "El teléfono fijo debe tener un formato válido")
    .refine((val) => {
      if (!val || val.trim() === '') return true;
      // Permitir cualquier combinación de números y caracteres comunes de teléfono
      return /^[0-9\s\(\)\-\+\.\#\*ext\w]*$/i.test(val);
    }, "El teléfono fijo contiene caracteres no permitidos"),

  email: z.string().optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, "Debe ser un email válido"),

  // Información adicional (opcional)
  nacionalidad: z.string().optional(),
  otra_nacionalidad: z.string().optional(),
  estado_civil: z.string().optional(),
  escolaridad: z.string().optional(),
  ocupacion: z.string().optional(),
  etnia: z.string().optional(),

  // Información socioeconómica y geográfica (opcional)
  estrato: z.union([z.string(), z.number(), z.null()]).optional(),
  zona_residencia: z.string().optional(),
  departamento: z.string().optional(),
  municipio: z.string().optional(),
  dane_municipio: z.string().optional(),

  // Otros campos
  discapacidad: z.boolean().optional(),
  sabe_leer_escribir: z.boolean().optional(),
  direccion_residencia: z.string().optional()
    .refine((val) => !val || val.length <= 200, "La dirección no puede exceder 200 caracteres"),
}).superRefine((data, ctx) => {
  // Validación condicional del documento (solo si hay tipo de documento)
  if (data.tipo_documento && data.tipo_documento !== "SD" && (!data.num_documento || data.num_documento.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "El número de documento es requerido para el tipo de documento seleccionado",
      path: ["num_documento"],
    });
  }
});

// Función para determinar si un ciudadano es "existente" (tiene datos pre-llenados)
const isExistingCitizen = (data: any): boolean => {
  const ciudadano = data.ciudadano_solicitante || {};
  // Si tiene primer_nombre y primer_apellido pre-llenados, consideramos que es existente
  return !!(ciudadano.primer_nombre && ciudadano.primer_apellido);
};

export const validateStep1 = (data: any) => {
  try {
    // Usar validador flexible si es ciudadano existente, estricto si es nuevo
    const isExisting = isExistingCitizen(data);
    const schema = isExisting ? step1CiudadanoExistenteSchema : step1Schema;
    const dataToValidate = data.ciudadano_solicitante || data;
    
    schema.parse(dataToValidate);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string> = {};
      error.issues.forEach((err: z.ZodIssue) => {
        const path = err.path.join(".");
        formattedErrors[`ciudadano_solicitante.${path}`] = err.message;
      });
      return { success: false, errors: formattedErrors };
    }
    return { success: false, errors: { general: "Error de validación" } };
  }
};

// Tipo TypeScript derivado del schema
export type Step1FormData = z.infer<typeof step1Schema>;
export type CiudadanoSolicitanteData = z.infer<typeof step1CiudadanoSolicitanteSchema>;