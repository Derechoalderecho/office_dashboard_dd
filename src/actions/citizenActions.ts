"use server"

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
}

export async function submitFormData(formData: FormData, mockMode = false): Promise<ApiResponse> {
  // For testing when database permissions are an issue
  if (mockMode) {
    console.log("Running in mock mode - no actual API calls will be made");
    console.log("Form data received:", Object.fromEntries(formData.entries()));
    
    // Simulate a successful response
    return {
      success: true,
      data: {
        citizen: { 
          id_ciudadano: 999,
          primer_nombre: formData.get('primer_nombre'),
          primer_apellido: formData.get('primer_apellido')
        },
        case: { 
          id_caso: 888,
          tipo_proceso: formData.get('tipo_proceso'),
          estado: formData.get('estado')
        }
      }
    };
  }
  
  try {
    // Step 1: Create citizen first to get the citizen ID
    const citizenData = {
      // Only include required fields with proper types
      primer_nombre: formData.get('primer_nombre') || "",
      segundo_nombre: formData.get('segundo_nombre') || "",
      primer_apellido: formData.get('primer_apellido') || "",
      segundo_apellido: formData.get('segundo_apellido') || "",
      tipo_documento: formData.get('tipo_documento') || "",
      num_documento: formData.get('num_documento') || "",
      email: formData.get('email') || "",
      num_fijo: formData.get('num_fijo') || "",
      num_movil: formData.get('num_movil') || "",
      sexo: formData.get('sexo') || "",
      genero: formData.get('genero') || "",
      orient_sexual: formData.get('orient_sexual') || "",
      nacionalidad: formData.get('nacionalidad') || "",
      estado_civil: formData.get('estado_civil') || "",
      escolaridad: formData.get('escolaridad') || "",
      etnia: formData.get('etnia') || "",
      discapacidad: formData.get('discapacidad') || "",
      sabe_leer_escribir: formData.get('sabe_leer_escribir') || "",
      dane_municipio: formData.get('dane_municipio') || "05001",
      persona_modifica: 1,
      // Don't include fields that aren't in the citizen table
    };

    // Log the exact data we're sending
    console.log("Sending citizen data:", JSON.stringify(citizenData, null, 2));

    // Make a test request to see the API schema
    try {
      const schemaResponse = await fetch('http://127.0.0.1:8000/ciudadanos', {
        method: 'GET',
      });
      if (schemaResponse.ok) {
        const schema = await schemaResponse.json();
        console.log("API Schema:", schema);
      }
    } catch (e) {
      console.log("Could not fetch schema, continuing with request");
    }

    const citizenResponse = await fetch('http://127.0.0.1:8000/ciudadanos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(citizenData),
    });

    // Get the full error details
    if (!citizenResponse.ok) {
      const errorText = await citizenResponse.text();
      console.error("Raw error response:", errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      console.error("Citizen API error response:", errorData);
      
      // Check for specific error types
      const errorDetail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData);
      let errorMessage = `Error al crear ciudadano (${citizenResponse.status})`;
      
      if (errorDetail.includes("permission denied") || errorDetail.includes("InsufficientPrivilege")) {
        errorMessage = "Error de permisos en la base de datos. Por favor, contacte al administrador del sistema.";
      } else if (errorDetail.includes("Field required")) {
        errorMessage = "Faltan campos requeridos en el formulario.";
      }
      
      // Return detailed error information
      return { 
        success: false, 
        error: errorMessage,
        details: errorData
      };
    }

    const citizenResult = await citizenResponse.json();
    console.log("Citizen created successfully:", citizenResult);
    const citizenId = citizenResult.id_ciudadano;

    // Step 2: Create case with the citizen ID
    const caseData = {
      id_ciudadano: citizenId,
      tipo_proceso: formData.get('tipo_proceso') || "Tutela",
      estado: formData.get('estado') || "Nuevo",
      tiempo_respuesta: parseInt(formData.get('tiempo_respuesta')?.toString() || "48"),
      notas: formData.get('notas')?.toString() || "",
      // Only include fields that are in the case table
    };

    console.log("Sending case data:", JSON.stringify(caseData, null, 2));

    const caseResponse = await fetch('http://127.0.0.1:8000/casos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(caseData),
    });

    if (!caseResponse.ok) {
      const errorText = await caseResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      
      console.error("Case API error response:", errorData);
      
      // Check for specific error types
      const errorDetail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData);
      let errorMessage = `Error al crear caso (${caseResponse.status})`;
      
      if (errorDetail.includes("permission denied") || errorDetail.includes("InsufficientPrivilege")) {
        errorMessage = "Error de permisos en la base de datos. Por favor, contacte al administrador del sistema.";
      } else if (errorDetail.includes("Field required")) {
        errorMessage = "Faltan campos requeridos en el formulario de caso.";
      }
      
      return { 
        success: false, 
        error: errorMessage,
        details: errorData
      };
    }

    const caseResult = await caseResponse.json();

    // Step 3: Create or update user assignments if needed
    if (formData.get('profesor_id') || formData.get('monitor_id') || formData.get('alumno_id')) {
      const userAssignmentData = {
        id_caso: caseResult.id_caso,
        profesor_id: formData.get('profesor_id') ? Number(formData.get('profesor_id')) : null,
        monitor_id: formData.get('monitor_id') ? Number(formData.get('monitor_id')) : null,
        alumno_id: formData.get('alumno_id') ? Number(formData.get('alumno_id')) : null,
      };

      console.log("Sending user assignment data:", JSON.stringify(userAssignmentData, null, 2));

      const userAssignmentResponse = await fetch('http://127.0.0.1:8000/usuarios/asignacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userAssignmentData),
      });

      if (!userAssignmentResponse.ok) {
        const errorText = await userAssignmentResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        console.error("User assignment API error response:", errorData);
        
        // Check for specific error types
        const errorDetail = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData);
        let errorMessage = `Error al asignar usuarios (${userAssignmentResponse.status})`;
        
        if (errorDetail.includes("permission denied") || errorDetail.includes("InsufficientPrivilege")) {
          errorMessage = "Error de permisos en la base de datos. Por favor, contacte al administrador del sistema.";
        } else if (errorDetail.includes("Field required")) {
          errorMessage = "Faltan campos requeridos en la asignación de usuarios.";
        }
        
        return { 
          success: false, 
          error: errorMessage,
          details: errorData
        };
      }
    }

    return { 
      success: true, 
      data: {
        citizen: citizenResult,
        case: caseResult
      }
    };
  } catch (error) {
    console.error('Error submitting form:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}