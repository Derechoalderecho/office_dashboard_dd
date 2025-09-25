import { post } from "@/utils/apiUtils";

export async function submitFormData(formData: FormData) {
  try {
    // El FormData ya viene preparado desde StepperFormConciliation.tsx
    // con la estructura correcta: 'datos' (JSON string) y 'firma_digital' (File)
    
    console.log("=== INICIO DEBUG FORM DATA ===");
    console.log("FormData recibido:", formData);
    
    // Crear un nuevo FormData para asegurarnos de que se envía correctamente
    let newFormData = new FormData();
    
    // Listar todas las claves del FormData
    console.log("Claves en FormData original:");
    for (const [key, value] of formData.entries()) {
      console.log(`- ${key}:`, typeof value, value instanceof File ? 'File' : value);
      
      // Copiar al nuevo FormData
      newFormData.append(key, value);
    }
    
    // Verificar que el FormData contenga las claves necesarias
    let hasData = false;
    let hasSignature = false;
    let datosString = "";
    
    for (const [key, value] of newFormData.entries()) {
      if (key === 'datos') {
        hasData = true;
        datosString = value as string;
        console.log("✓ FormData contiene la clave 'datos':", datosString.substring(0, 100) + '...');
      }
      if (key === 'firma_digital') {
        hasSignature = true;
        console.log("✓ FormData contiene la clave 'firma_digital':", value);
      }
    }
    
    if (!hasData) {
      console.error("❌ ERROR: FormData no contiene la clave 'datos'");
      console.log("Todas las claves disponibles:");
      for (const [key] of newFormData.entries()) {
        console.log(`- ${key}`);
      }
    } else {
      // Procesar los datos para asegurar que tienen el formato correcto
      try {
        const datosObj = JSON.parse(datosString);
        const processedData = processFormData(datosObj);
        
        // Reemplazar los datos originales con los procesados
        const processedFormData = new FormData();
        processedFormData.append('datos', JSON.stringify(processedData));
        
        // Mantener la firma digital si existe
        if (hasSignature) {
          for (const [key, value] of newFormData.entries()) {
            if (key === 'firma_digital') {
              processedFormData.append('firma_digital', value);
            }
          }
        }
        
        newFormData = processedFormData;
        console.log("Datos procesados correctamente");
      } catch (e) {
        console.error("Error al procesar los datos JSON:", e);
      }
    }
    
    if (!hasSignature) {
      console.warn("⚠️ ADVERTENCIA: FormData no contiene la clave 'firma_digital'");
    }
    
    console.log("=== FormData final a enviar ===");
    for (const [key, value] of newFormData.entries()) {
      console.log(`${key}:`, typeof value, value instanceof File ? `File(${value.name})` : value);
    }
    console.log("=== FIN DEBUG FORM DATA ===");

    // Enviar al endpoint usando apiUtils con FormData
    // Asegurarnos de que se envía con el Content-Type correcto
    const response = await post("/casos/crear-caso-conciliacion/", newFormData, {
      headers: {
        // No establecer Content-Type para que el navegador lo haga automáticamente con el boundary correcto
        'Content-Type': undefined
      }
    });

    console.log("Respuesta del servidor:", response);

    return { success: true, data: response };
  } catch (error) {
    console.error("Error al enviar el formulario:", error);
    throw error;
  }
}

// Función auxiliar para procesar y convertir tipos de datos
function processFormData(data: any): any {
  const processed = { ...data };

  // Convertir strings booleanos a booleanos reales
  const booleanFields = [
    'confirma_datos',
    'confirma_tratamiento_datos',
    'existen_persona_beneficiaria',
    'completado'
  ];

  booleanFields.forEach(field => {
    if (processed[field] !== undefined) {
      if (processed[field] === '' || processed[field] === 'false') {
        processed[field] = false;
      } else {
        processed[field] = processed[field] === 'true' || processed[field] === true;
      }
    }
  });

  // Convertir strings numéricos a números o null
  const numericFields = ['cuantia'];
  numericFields.forEach(field => {
    if (processed[field] !== undefined) {
      if (processed[field] === '' || processed[field] === null) {
        processed[field] = null;
      } else if (!isNaN(Number(processed[field]))) {
        processed[field] = Number(processed[field]);
      }
    }
  });

  // Convertir fechas vacías a null
  const dateFields = ['fecha_intervencion'];
  dateFields.forEach(field => {
    if (processed[field] !== undefined && processed[field] === '') {
      processed[field] = null;
    }
  });

  // Procesar objetos anidados
  if (processed.ciudadano_solicitante) {
    processed.ciudadano_solicitante = processNestedObject(processed.ciudadano_solicitante);
  }

  if (processed.ciudadano_citado && Array.isArray(processed.ciudadano_citado)) {
    processed.ciudadano_citado = processed.ciudadano_citado.map(processNestedObject);
  }

  if (processed.ciudadano_beneficiado && Array.isArray(processed.ciudadano_beneficiado)) {
    processed.ciudadano_beneficiado = processed.ciudadano_beneficiado.map((ciudadano: Record<string, any>) => {
      const processedCiudadano = processNestedObject(ciudadano);
      // Asegurarse de que fecha_expedicion existe
      if (!processedCiudadano.fecha_expedicion) {
        processedCiudadano.fecha_expedicion = null;
      }
      return processedCiudadano;
    });
  }
  
  // Asegurarse de que firma_solicitante tiene origen_firma
  if (processed.firma_solicitante) {
    if (typeof processed.firma_solicitante !== 'object' || processed.firma_solicitante === null) {
      processed.firma_solicitante = { origen_firma: "canvas" };
    } else if (!processed.firma_solicitante.origen_firma) {
      processed.firma_solicitante.origen_firma = "canvas";
    }
  } else {
    processed.firma_solicitante = { origen_firma: "canvas" };
  }

  // Procesar fechas de audiencia
  if (processed.fechas_audiencia && typeof processed.fechas_audiencia === 'string') {
    try {
      processed.fechas_audiencia = JSON.parse(processed.fechas_audiencia);
    } catch (e) {
      processed.fechas_audiencia = [];
    }
  }

  // Procesar anexos adicionales
  if (processed.anexos_adicionales && typeof processed.anexos_adicionales === 'string') {
    try {
      processed.anexos_adicionales = JSON.parse(processed.anexos_adicionales);
    } catch (e) {
      processed.anexos_adicionales = [];
    }
  }

  return processed;
}

// Función auxiliar para procesar objetos anidados
function processNestedObject(obj: any): any {
  const processed = { ...obj };

  // Convertir estrato a número o null
  if (processed.estrato !== undefined) {
    if (processed.estrato === '' || processed.estrato === null) {
      processed.estrato = null;
    } else if (!isNaN(Number(processed.estrato))) {
      processed.estrato = Number(processed.estrato);
    }
  }

  // Convertir campos booleanos
  const booleanFields = ['sabe_leer_escribir', 'discapacidad'];
  booleanFields.forEach(field => {
    if (processed[field] !== undefined) {
      if (processed[field] === '' || processed[field] === 'false') {
        processed[field] = false;
      } else {
        processed[field] = processed[field] === 'true' || processed[field] === true;
      }
    }
  });

  // Convertir fechas vacías a null
  const dateFields = ['fecha_nacimiento', 'fecha_expedicion'];
  dateFields.forEach(field => {
    if (processed[field] !== undefined && processed[field] === '') {
      processed[field] = null;
    }
  });

  // Asegurar que campos requeridos existan
  if (!processed.hasOwnProperty('otra_nacionalidad')) {
    processed.otra_nacionalidad = "";
  }
  
  // Para ciudadano_beneficiado, asegurar que num_movil existe
  if (!processed.hasOwnProperty('num_movil') && processed.hasOwnProperty('telefono_movil')) {
    processed.num_movil = processed.telefono_movil;
    delete processed.telefono_movil;
  }
  
  if (!processed.hasOwnProperty('num_movil')) {
    processed.num_movil = "";
  }

  return processed;
}
