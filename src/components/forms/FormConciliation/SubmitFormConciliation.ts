"use server"

import { post } from "@/utils/apiUtils";

export async function submitFormData(formData: FormData) {
  try {
    // Convertir FormData a objeto JSON
    const formObject: any = {};
    
    for (const [key, value] of formData.entries()) {
      // Manejar arrays y objetos anidados
      if (key.includes('[') && key.includes(']')) {
        // Manejar arrays como ciudadano_citado[0].nombre
        const arrayMatch = key.match(/^([^[]+)\[(\d+)\]\.(.+)$/);
        if (arrayMatch) {
          const [, arrayName, index, fieldName] = arrayMatch;
          if (!formObject[arrayName]) {
            formObject[arrayName] = [];
          }
          if (!formObject[arrayName][parseInt(index)]) {
            formObject[arrayName][parseInt(index)] = {};
          }
          formObject[arrayName][parseInt(index)][fieldName] = value;
        }
      } else if (key.includes('.')) {
        // Manejar objetos anidados como ciudadano_solicitante.nombre
        const parts = key.split('.');
        let current = formObject;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        // Campos simples
        formObject[key] = value;
      }
    }

    // Convertir strings a tipos apropiados
    const processedData = processFormData(formObject);

    console.log("Enviando datos al endpoint:", processedData);

    // Enviar al endpoint usando apiUtils
    const response = await post("v2/casos/crear-caso-conciliacion/", processedData);

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
    'sabe_leer_escribir'
  ];

  booleanFields.forEach(field => {
    if (processed[field] !== undefined) {
      processed[field] = processed[field] === 'true' || processed[field] === true;
    }
  });

  // Convertir strings numéricos a números
  const numericFields = ['estrato', 'cuantia'];
  numericFields.forEach(field => {
    if (processed[field] && !isNaN(Number(processed[field]))) {
      processed[field] = Number(processed[field]);
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
    processed.ciudadano_beneficiado = processed.ciudadano_beneficiado.map(processNestedObject);
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

  // Convertir estrato a número si existe
  if (processed.estrato && !isNaN(Number(processed.estrato))) {
    processed.estrato = Number(processed.estrato);
  }

  // Convertir campos booleanos
  if (processed.sabe_leer_escribir !== undefined) {
    processed.sabe_leer_escribir = processed.sabe_leer_escribir === 'true' || processed.sabe_leer_escribir === true;
  }

  return processed;
}
