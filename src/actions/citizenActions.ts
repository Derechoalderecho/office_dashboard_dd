"use server";

import { API_BASE_URL } from "@/config/api";
import { assignUserToCase } from "@/services/caseService";

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
}

export async function submitFormData(
  formData: FormData,
  mockMode = false
): Promise<ApiResponse> {
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
          primer_nombre: formData.get("primer_nombre"),
          primer_apellido: formData.get("primer_apellido"),
        },
        case: {
          id_caso: 888,
          tipo_proceso: formData.get("tipo_proceso"),
          estado: formData.get("estado"),
        },
      },
    };
  }

  try {
    // Check if we're using an existing citizen
    const isExistingCitizen = formData.get("isExistingCitizen") === "true";
    let citizenId: number;

    if (isExistingCitizen && formData.get("citizenId")) {
      // Use the existing citizen ID
      citizenId = Number(formData.get("citizenId"));
      console.log("Using existing citizen with ID:", citizenId);
    } else {
      // Step 1: Create a new citizen to get the citizen ID
      const citizenData = {
        primer_nombre: formData.get("primer_nombre") || "",
        segundo_nombre: formData.get("segundo_nombre") || "",
        primer_apellido: formData.get("primer_apellido") || "",
        segundo_apellido: formData.get("segundo_apellido") || "",
        tipo_documento: formData.get("tipo_documento") || "",
        num_documento: formData.get("num_documento") || "",
        email: formData.get("email") || "",
        num_fijo: formData.get("num_fijo") || "",
        num_movil: formData.get("num_movil") || "",
        sexo: formData.get("sexo") || "",
        genero: formData.get("genero") || "",
        orient_sexual: formData.get("orient_sexual") || "",
        nacionalidad: formData.get("nacionalidad") || "",
        estado: formData.get("estado") || "Seguimiento",
        estado_civil: formData.get("estado_civil") || "",
        escolaridad: formData.get("escolaridad") || "",
        etnia: formData.get("etnia") || "",
        discapacidad: formData.get("discapacidad") || "",
        sabe_leer_escribir: formData.get("sabe_leer_escribir") || "",
        dane_municipio: formData.get("dane_municipio") || "05001",
        persona_modifica: formData.get("persona_modifica") || "",
        fecha_nacimiento: formData.get("fecha_nacimiento") || "",
        direccion: formData.get("direccion") || "",
        estrato: formData.get("estrato") || "",
        zona: formData.get("zona") || "",
        departamento: formData.get("departamento") || "",
        municipio: formData.get("municipio") || "",
      };

      console.log(
        "Sending citizen data:",
        JSON.stringify(citizenData, null, 2)
      );

      // Make a test request to see the API schema
      try {
        const schemaResponse = await fetch(`${API_BASE_URL}/ciudadanos`, {
          method: "GET",
        });
        if (schemaResponse.ok) {
          const schema = await schemaResponse.json();
          console.log("API Schema:", schema);
        }
      } catch (e) {
        console.log("Could not fetch schema, continuing with request");
      }

      const citizenResponse = await fetch(`${API_BASE_URL}/ciudadanos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(citizenData),
      });

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
        const errorDetail =
          typeof errorData.detail === "string"
            ? errorData.detail
            : JSON.stringify(errorData);
        let errorMessage = `Error al crear ciudadano (${citizenResponse.status})`;

        if (
          errorDetail.includes("permission denied") ||
          errorDetail.includes("InsufficientPrivilege")
        ) {
          errorMessage =
            "Error de permisos en la base de datos. Por favor, contacte al administrador del sistema.";
        } else if (errorDetail.includes("Field required")) {
          errorMessage = "Faltan campos requeridos en el formulario.";
        }

        return {
          success: false,
          error: errorMessage,
          details: errorData,
        };
      }

      const citizenResult = await citizenResponse.json();
      console.log("Citizen created successfully:", citizenResult);
      citizenId = citizenResult.id_ciudadano;
    }

    // Step 2: Create case with the citizen ID
    const profesorId = formData.get("profesor_id")?.toString() || "0";
    const caseData = {
      id_ciudadano: citizenId.toString(),
      tipo_proceso: formData.get("tipo_proceso")?.toString() || "Tutela",
      estado: "Viabilidad",
      tiempo_respuesta: formData.get("tiempo_respuesta")?.toString() || "48",
      notas: formData.get("notas")?.toString() || "",
      persona_modifica: profesorId,
      fecha_crea: new Date().toISOString(),
      fecha_actualiza: new Date().toISOString(),
      fecha_elimina: "",
      eliminado: "false",
      ganado: "false",
      usuarios: [],
      ciudadano: null,
      id_caso: "0",
      pretensiones: formData.get("pretensiones")?.toString() || "Pendiente de revisión",
      concepto_estudiante: "Pendiente de revisión",
      hechos: formData.get("hechos")?.toString() || "Pendiente de revisión",
      rama_derecho: "Derecho Constitucional",
      tramite: "En proceso",
      antecedentes: "Pendiente de revisión",
      tutela: "Pendiente de revisión",
      calificacion: "0.0",
      calificacion1: "0.0",
      calificacion2: "0.0",
      calificacion3: "0.0",
      calificacion4: "0.0",
      fundamentos: formData.get("fundamentos")?.toString() || "",
      entidad: formData.get("entidad")?.toString() || ""
    };

    console.log("Sending case data:", JSON.stringify(caseData, null, 2));

    const caseResponse = await fetch(`${API_BASE_URL}/casos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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

      // Print detailed error information
      if (errorData.detail && Array.isArray(errorData.detail)) {
        console.error("Missing fields:", errorData.detail.map((err: any) => ({
          field: err.loc[1],
          message: err.msg
        })));
      }

      // Check for specific error types
      const errorDetail =
        typeof errorData.detail === "string"
          ? errorData.detail
          : JSON.stringify(errorData);
      let errorMessage = `Error al crear caso (${caseResponse.status})`;

      if (
        errorDetail.includes("permission denied") ||
        errorDetail.includes("InsufficientPrivilege")
      ) {
        errorMessage =
          "Error de permisos en la base de datos. Por favor, contacte al administrador del sistema.";
      } else if (errorDetail.includes("Field required")) {
        errorMessage = "Faltan campos requeridos en el formulario de caso.";
      }

      return {
        success: false,
        error: errorMessage,
        details: errorData,
      };
    }

    const caseResult = await caseResponse.json();
    const caseId = caseResult.id_caso;

    // Step 3: Assign users to the case
    const userAssignments = [
      {
        userId: Number(formData.get("profesor_id")),
        role: "Docente"
      },
      {
        userId: Number(formData.get("monitor_id")),
        role: "Monitor"
      },
      {
        userId: Number(formData.get("alumno_id")),
        role: "Estudiante"
      }
    ];

    // Assign each user to the case
    const assignmentPromises = userAssignments.map(({ userId, role }) => 
      assignUserToCase(caseId, userId, role)
    );

    const assignmentResults = await Promise.all(assignmentPromises);
    const allAssignmentsSuccessful = assignmentResults.every(Boolean);

    if (!allAssignmentsSuccessful) {
      console.warn("Some user assignments failed");
    }

    return {
      success: true,
      data: {
        citizen: { id_ciudadano: citizenId },
        case: caseResult,
      },
    };
  } catch (error) {
    console.error("Error submitting form:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
