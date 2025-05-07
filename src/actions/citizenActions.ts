"use server";

import { API_BASE_URL } from "@/config/api";
import { assignUserToCase } from "@/services/caseService";
import { invalidateCache } from "@/utils/cacheUtils";
import { convertZonaToCode } from "@/utils/citizenUtils";

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
        dane_municipio: formData.get("dane_municipio") || "05001",
        persona_modifica: formData.get("persona_modifica") || "",
        sexo: formData.get("sexo") || "",
        genero: formData.get("genero") || "",
        fecha_nacimiento: formData.get("fecha_nacimiento") || "",
        orient_sexual: formData.get("orient_sexual") || "",
        nacionalidad: formData.get("nacionalidad") || "",
        estado_civil: formData.get("estado_civil") || "",
        escolaridad: formData.get("escolaridad") || "",
        etnia: formData.get("etnia") || "",
        discapacidad: formData.get("discapacidad") || "",
        sabe_leer_escribir: formData.get("sabe_leer_escribir") || "",
        direccion: formData.get("direccion") || "",
        zona: convertZonaToCode(formData.get("zona")?.toString() || ""),
        estrato: formData.get("estrato") || "",
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

      // Handle different API response formats
      if (Array.isArray(citizenResult)) {
        if (citizenResult.length === 0) {
          // API returned empty array - we need to fetch the citizen by document
          console.log(
            "API returned empty array, fetching citizen by document..."
          );
          try {
            const existingCitizen = await fetch(
              `${API_BASE_URL}/ciudadanos/documento/${formData.get(
                "tipo_documento"
              )}/${formData.get("num_documento")}`
            );

            if (existingCitizen.ok) {
              const citizenData = await existingCitizen.json();
              if (citizenData && citizenData.id_ciudadano) {
                citizenId = citizenData.id_ciudadano;
                console.log("Found citizen by document with ID:", citizenId);
              } else {
                console.error(
                  "Could not find citizen by document after creation"
                );
                return {
                  success: false,
                  error:
                    "No se pudo recuperar el ID del ciudadano después de crearlo",
                };
              }
            } else {
              console.error("Error fetching citizen by document");
              return {
                success: false,
                error: "Error al buscar el ciudadano creado",
              };
            }
          } catch (error) {
            console.error("Error fetching citizen:", error);
            return {
              success: false,
              error: "No se pudo recuperar el ID del ciudadano",
            };
          }
        } else if (citizenResult.length > 0) {
          // Use first item in array
          citizenId = citizenResult[0].id_ciudadano;
          console.log("Using first citizen from array with ID:", citizenId);
        } else {
          console.error("Unexpected server response");
          return {
            success: false,
            error: "Respuesta inesperada del servidor",
          };
        }
      } else if (citizenResult && citizenResult.id_ciudadano) {
        citizenId = citizenResult.id_ciudadano;
        console.log("Using citizen with ID:", citizenId);
      } else {
        console.error(
          "Unrecognized response format:",
          JSON.stringify(citizenResult)
        );
        return {
          success: false,
          error: "Formato de respuesta no reconocido",
        };
      }

      // Double-check citizenId is valid at this point
      if (typeof citizenId !== "number" || isNaN(citizenId) || citizenId <= 0) {
        console.error(
          "Invalid citizenId after parsing citizen response:",
          citizenId
        );
        return {
          success: false,
          error:
            "Error interno: ID de ciudadano inválido o no generado correctamente",
        };
      }

      // Invalidate citizens cache after creating a new citizen
      invalidateCache("citizens");
    }

    // Step 2: Create case with the citizen ID
    const profesorId = formData.get("profesor_id")?.toString() || "0";

    // Validate citizenId before using it
    if (typeof citizenId !== "number" || isNaN(citizenId) || citizenId <= 0) {
      console.error("Invalid citizenId before case creation:", citizenId);
      return {
        success: false,
        error:
          "Error interno: ID de ciudadano inválido o no generado correctamente",
      };
    }

    const caseData = {
      id_ciudadano: String(citizenId || 0),
      tipo_proceso: formData.get("tipo_proceso")?.toString() || "Tutela",
      estado: "Viabilidad",
      tiempo_respuesta: formData.get("tiempo_respuesta")?.toString() || "48",
      notas: formData.get("notas")?.toString() || "",
      persona_modifica: profesorId,
      concepto_estudiante: "Pendiente de revisión",
      hechos: formData.get("hechos")?.toString() || "Pendiente de revisión",
      rama_derecho: "Derecho Constitucional",
      tramite: "En proceso",
      antecedentes: "Pendiente de revisión",
      tutela: "Pendiente de revisión",
      calificacion: "0.0",
      ganado: "false",
      pretensiones:
        formData.get("pretensiones")?.toString() || "Pendiente de revisión",
      entidad: formData.get("entidad")?.toString() || "",
      fundamentos: formData.get("fundamentos")?.toString() || "",
      calificacion1: "0.0",
      calificacion2: "0.0",
      calificacion3: "0.0",
      calificacion4: "0.0",
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
        console.error(
          "Missing fields:",
          errorData.detail.map((err: any) => ({
            field: err.loc[1],
            message: err.msg,
          }))
        );
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
    const caseId = caseResult[0].id_caso;
    console.log(caseResponse);
    console.log(caseResult);

    // Invalidate cases cache after creating a new case
    invalidateCache("cases");

    // Ensure we have a valid case ID before proceeding with user assignments
    if (!caseId || typeof caseId !== "number") {
      console.error("Invalid or missing case ID after case creation:", caseId);
      return {
        success: false,
        error: "Error: No se pudo obtener el ID del caso creado",
        data: { citizen: { id_ciudadano: citizenId }, case: caseResult },
      };
    }

    console.log(`Case created successfully with ID: ${caseId}`);

    // Step 3: Assign users to the case
    const userAssignments = [
      {
        userId: Number(formData.get("profesor_id")),
        role: "Docente",
      },
      // Only include monitor if one is selected
      ...(formData.get("monitor_id")
        ? [
            {
              userId: Number(formData.get("monitor_id")),
              role: "Monitor",
            },
          ]
        : []),
      {
        userId: Number(formData.get("alumno_id")),
        role: "Estudiante",
      },
    ].filter(
      (assignment) => !isNaN(assignment.userId) && assignment.userId > 0
    );

    // Verificar que tenemos asignaciones válidas
    if (userAssignments.length === 0) {
      console.warn("No valid user assignments found for case:", caseId);
      return {
        success: true,
        data: {
          citizen: { id_ciudadano: citizenId },
          case: caseResult,
          warning: "No se asignaron usuarios al caso",
        },
      };
    }

    // Implementar un mecanismo de reintento para las asignaciones de usuarios
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 segundo

    // Función para realizar un retraso
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    // Función para asignar un usuario con reintentos
    const assignUserWithRetry = async (
      caseId: number,
      userId: number,
      role: string
    ): Promise<boolean> => {
      let retries = 0;

      while (retries < MAX_RETRIES) {
        try {
          const result = await assignUserToCase(caseId, userId, role);
          if (result) {
            return true;
          }

          console.warn(
            `Assignment failed for user ${userId} to case ${caseId} as ${role}, retrying (${
              retries + 1
            }/${MAX_RETRIES})...`
          );
          retries++;
          await delay(RETRY_DELAY);
        } catch (error) {
          console.error(
            `Error assigning user ${userId} to case ${caseId}:`,
            error
          );
          retries++;
          await delay(RETRY_DELAY);
        }
      }

      return false;
    };

    // Asignar cada usuario al caso con reintentos
    const assignmentPromises = userAssignments.map(({ userId, role }) =>
      assignUserWithRetry(caseId, userId, role)
    );

    const assignmentResults = await Promise.all(assignmentPromises);
    const allAssignmentsSuccessful = assignmentResults.every(Boolean);

    if (!allAssignmentsSuccessful) {
      console.warn("Some user assignments failed after retries");
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
