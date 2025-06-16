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
  // Mock mode
  if (mockMode) {
    console.log("Running in mock mode - no API calls made");
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
    console.log("===== INICIO PROCESAMIENTO DE FORMULARIO =====");
    console.log("Datos recibidos:", Object.fromEntries(formData.entries()));
    
    // PASO 1: Crear o actualizar ciudadano
    console.log("===== CREANDO/ACTUALIZANDO CIUDADANO =====");
    let citizenId: number | null = null;
    
    // Verificar si se debe usar un ciudadano existente
    const isExistingCitizen = formData.get("isExistingCitizen") === "true";
    const existingCitizenId = formData.get("citizenId");
    
    if (isExistingCitizen && existingCitizenId && existingCitizenId !== "0" && existingCitizenId !== "") {
      // Usar el ciudadano existente
      citizenId = Number(existingCitizenId);
      console.log("Usando ciudadano existente con ID:", citizenId);
    } else {
      // Crear nuevo ciudadano
      console.log("Creando nuevo ciudadano");
      const ciudadanoData = {
        primer_nombre: formData.get("primer_nombre") || "",
        segundo_nombre: formData.get("segundo_nombre") || "",
        primer_apellido: formData.get("primer_apellido") || "",
        segundo_apellido: formData.get("segundo_apellido") || "",
        tipo_documento: formData.get("tipo_documento") || "",
        num_documento: formData.get("num_documento") || "",
        email: formData.get("email") || "",
        telefono_fijo: formData.get("telefono_fijo") || "",
        num_movil: formData.get("num_movil") || "",
        dane_municipio: formData.get("dane_municipio") || "05001",
        persona_modifica: Number(formData.get("persona_modifica")) || null,
        sexo: formData.get("sexo") || "",
        genero: formData.get("genero") || "",
        fecha_nacimiento: formData.get("fecha_nacimiento") 
          ? new Date(formData.get("fecha_nacimiento") as string).toISOString().split('T')[0] + "T00:00:00"
          : new Date().toISOString().split('T')[0] + "T00:00:00",
        orientacion_sexual: formData.get("orientacion_sexual") || "",
        nacionalidad: formData.get("nacionalidad") || "",
        estado_civil: formData.get("estado_civil") || "",
        escolaridad: formData.get("escolaridad") || "",
        etnia: formData.get("etnia") || "",
        discapacidad: formData.get("discapacidad") === "true",
        sabe_leer_escribir: formData.get("sabe_leer_escribir") === "true",
        direccion_residencia: formData.get("direccion_residencia") || "",
        zona_residencia: convertZonaToCode(formData.get("zona_residencia")?.toString() || ""),
        estrato: Number(formData.get("estrato")) || 0,
      };
      
      console.log("Datos del ciudadano a crear:", JSON.stringify(ciudadanoData, null, 2));
      
      try {
        // URL directa para asegurar el funcionamiento
        const ciudadanosUrl = `${API_BASE_URL}/ciudadanos/`;
        console.log("URL para creación de ciudadano:", ciudadanosUrl);
        
        // Hacer POST para crear ciudadano
        const ciudadanoResponse = await fetch(ciudadanosUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(ciudadanoData),
          cache: "no-store"
        });
        
        console.log("Respuesta status:", ciudadanoResponse.status);
        console.log("Respuesta status text:", ciudadanoResponse.statusText);
        
        if (ciudadanoResponse.ok) {
          const ciudadanoResult = await ciudadanoResponse.json();
          citizenId = ciudadanoResult.id_ciudadano;
          console.log("Ciudadano creado con ID:", citizenId);
        } else {
          const errorData = await ciudadanoResponse.json();
          console.log("Error al crear ciudadano:", JSON.stringify(errorData));
          
          // Si el error es por duplicado, intentamos buscar el ciudadano por número de documento
          if (errorData.detail && errorData.detail.includes("duplicate key value") && errorData.detail.includes("num_documento")) {
            console.log("Documento duplicado, buscando ciudadano existente");
            const numDocumento = formData.get("num_documento");
            if (numDocumento) {
              try {
                const searchUrl = `${API_BASE_URL}/ciudadanos/buscar?num_documento=${numDocumento}`;
                const searchResponse = await fetch(searchUrl);
                if (searchResponse.ok) {
                  const searchData = await searchResponse.json();
                  if (searchData && searchData.length > 0) {
                    citizenId = searchData[0].id_ciudadano;
                    console.log("Encontrado ciudadano existente con ID:", citizenId);
                  } else {
                    throw new Error(`No se encontró ciudadano con documento ${numDocumento}`);
                  }
                } else {
                  throw new Error(`Error al buscar ciudadano: ${searchResponse.statusText}`);
                }
              } catch (searchError) {
                console.error("Error al buscar ciudadano:", searchError);
                throw searchError;
              }
            } else {
              throw new Error("Número de documento no proporcionado");
            }
          } else {
            throw new Error(`Error al crear ciudadano: ${JSON.stringify(errorData)}`);
          }
        }
      } catch (error) {
        console.error("Error al crear ciudadano:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido al crear ciudadano",
        };
      }
    }
    
    // Validar el ID del ciudadano antes de continuar
    if (typeof citizenId !== "number" || isNaN(citizenId) || citizenId <= 0) {
      console.error("ID de ciudadano inválido:", citizenId);
      return {
        success: false,
        error: "No se pudo obtener un ID de ciudadano válido",
      };
    }
    
    // PASO 2: Crear caso asociado al ciudadano
    console.log("===== CREANDO CASO PARA CIUDADANO =====");
    
    // Crear objeto con los tipos de datos correctos
    const caseData = {
      id_ciudadano: citizenId, // Número en lugar de string
      id_tipo_caso: Number(formData.get("id_tipo_caso")) || 1, // Usando valor numérico (1=Tutela como default)
      estado_actual: "Viabilidad", // Estado inicial
      entidad: formData.get("entidad")?.toString() || "",
      
      // Solo agregamos tiempo_respuesta al caso principal
      tiempo_respuesta: Number(formData.get("tiempo_respuesta")) || 48,
      persona_modifica: Number(formData.get("persona_modifica")) || null,
      calificacion1: null, // Número en lugar de string
      calificacion2: null, // Número en lugar de string
      calificacion3: null, // Número en lugar de string
      calificacion4: null, // Número en lugar de string
      // Campos adicionales requeridos por el backend
      concepto_estudiante: formData.get("concepto_estudiante")?.toString() || "",
      rama_derecho: formData.get("rama_derecho")?.toString() || "Constitucional",
      tramite: formData.get("tramite")?.toString() || "Pendiente",
      antecedentes: formData.get("antecedentes")?.toString() || "",
      tutela: formData.get("tutela")?.toString() || "NO",
      calificacion: formData.get("calificacion")?.toString() || null,
      ganado: formData.get("ganado")?.toString() || false,
      fecha_elimina: null
    };
    
    console.log("Datos del caso a crear:", JSON.stringify(caseData, null, 2));
    
    try {
      // Verificar casos existentes antes de crear uno nuevo
      console.log("Verificando casos existentes antes de crear uno nuevo");
      
      // Obtener casos antes de crear el nuevo
      const casesBeforeResponse = await fetch(`${API_BASE_URL}/casos`);
      const casesBeforeData = await casesBeforeResponse.json();
      console.log(`Total de casos existentes antes: ${casesBeforeData.length}`);
      
      // Extraer los datos de tutela del formulario
      const datosTutela = {
        hechos: formData.get("hechos")?.toString() || "",
        pretensiones: formData.get("pretensiones")?.toString() || "",
        fundamentos_derecho: formData.get("fundamentos_derecho")?.toString() || ""
      };
      
      // Añadir una marca única para identificar el caso después
      const uniqueMark = `Test-${Date.now()}`;
      datosTutela.hechos = `${datosTutela.hechos} ${uniqueMark}`;
      datosTutela.pretensiones = `${datosTutela.pretensiones} ${uniqueMark}`;
      datosTutela.fundamentos_derecho = `${datosTutela.fundamentos_derecho} ${uniqueMark}`;
      
      // URL directa para asegurar el funcionamiento
      const casosUrl = `${API_BASE_URL}/casos/`;
      console.log("URL para creación de caso:", casosUrl);
      
      // Hacer POST para crear caso
      const caseResponse = await fetch(casosUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(caseData),
        cache: "no-store"
      });
      
      console.log("Respuesta status:", caseResponse.status);
      console.log("Respuesta status text:", caseResponse.statusText);
      
      // Imprimir los headers de la respuesta para debugging
      const headers: Record<string, string> = {};
      caseResponse.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log("Headers de respuesta:", headers);
      
      if (!caseResponse.ok) {
        const errorText = await caseResponse.text();
        console.error("Error al crear caso:", errorText);
        return {
          success: false,
          error: `Error al crear caso: ${caseResponse.status} ${caseResponse.statusText}`,
          details: errorText
        };
      }
      
      // Leer respuesta como JSON
      const caseResult = await caseResponse.json();
      console.log("Respuesta de creación de caso:", JSON.stringify(caseResult, null, 2));
      
      // Verificar casos después de crear el nuevo
      const casesAfterResponse = await fetch(`${API_BASE_URL}/casos`);
      const casesAfterData = await casesAfterResponse.json();
      console.log(`Total de casos existentes después: ${casesAfterData.length}`);
      
      // Buscar el nuevo caso comparando los arrays antes y después
      let newCases = [];
      if (Array.isArray(casesBeforeData) && Array.isArray(casesAfterData)) {
        // Verificar si hay más casos después que antes
        if (casesAfterData.length > casesBeforeData.length) {
          // Buscar casos que están en el segundo array pero no en el primero
          const beforeIds = new Set(casesBeforeData.map((c: any) => c.id_caso));
          newCases = casesAfterData.filter((c: any) => !beforeIds.has(c.id_caso));
          console.log(`Se encontraron ${newCases.length} casos nuevos`);
        } else {
          // Buscar por coincidencias básicas ya que ahora no buscamos en esos campos
          newCases = casesAfterData.filter((c: any) => 
            c.id_ciudadano === citizenId && 
            c.id_tipo_caso === caseData.id_tipo_caso
          );
          console.log(`Se encontraron ${newCases.length} casos con la marca única`);
        }
      }
      
      // Buscar el caso creado para nuestro ciudadano
      let createdCase = null;
      let caseId: number;
      
      // Primero intentar usar los casos nuevos identificados
      if (newCases.length > 0) {
        // Filtrar por nuestro ciudadano
        const citizenNewCases = newCases.filter((c: any) => 
          c.id_ciudadano === citizenId
        );
        
        if (citizenNewCases.length > 0) {
          // Ordenar por fecha de creación (más reciente primero)
          citizenNewCases.sort((a: any, b: any) => {
            const dateA = new Date(a.fecha_crea || 0).getTime();
            const dateB = new Date(b.fecha_crea || 0).getTime();
            return dateB - dateA;
          });
          
          createdCase = citizenNewCases[0];
          console.log("Caso nuevo identificado para nuestro ciudadano:", createdCase);
        } else {
          // Si no hay casos para nuestro ciudadano, usar el más reciente
          newCases.sort((a: any, b: any) => {
            const dateA = new Date(a.fecha_crea || 0).getTime();
            const dateB = new Date(b.fecha_crea || 0).getTime();
            return dateB - dateA;
          });
          
          createdCase = newCases[0];
          console.log("Caso nuevo más reciente:", createdCase);
        }
      }
      
      // Si no se encontró un caso nuevo, intentar el método original
      if (!createdCase) {
        if (Array.isArray(caseResult)) {
          // Buscar casos que coincidan con nuestro ciudadano y datos
          const matchingCases = caseResult.filter((c: any) => 
            Number(c.id_ciudadano) === citizenId && 
            (c.notas?.includes(uniqueMark) || 
             c.hechos?.includes(uniqueMark) || 
             c.pretensiones?.includes(uniqueMark) || 
             c.fundamentos?.includes(uniqueMark))
          );
          
          if (matchingCases.length > 0) {
            // Ordenar por fecha de creación (más reciente primero)
            matchingCases.sort((a: any, b: any) => {
              const dateA = new Date(a.fecha_crea || 0).getTime();
              const dateB = new Date(b.fecha_crea || 0).getTime();
              return dateB - dateA;
            });
            
            createdCase = matchingCases[0]; // El caso más reciente
            console.log("Caso identificado por coincidencia de datos:", createdCase);
          } else {
            // Si no encontramos coincidencias exactas, verificar por id_ciudadano
            const citizenCases = caseResult.filter((c: any) => 
              Number(c.id_ciudadano) === citizenId
            );
            
            if (citizenCases.length > 0) {
              // Ordenar por fecha de creación (más reciente primero)
              citizenCases.sort((a: any, b: any) => {
                const dateA = new Date(a.fecha_crea || 0).getTime();
                const dateB = new Date(b.fecha_crea || 0).getTime();
                return dateB - dateA;
              });
              
              createdCase = citizenCases[0]; // El caso más reciente
              console.log("Caso identificado por ciudadano:", createdCase);
            } else if (caseResult.length > 0) {
              // Como último recurso, usar el último caso creado
              console.warn("No se encontraron casos coincidentes, usando el último como respaldo");
              createdCase = caseResult[caseResult.length - 1];
            }
          }
        } else if (caseResult && caseResult.id_caso) {
          // Respuesta es un objeto directo
          createdCase = caseResult;
          console.log("Caso recibido como objeto directo:", createdCase);
        }
      }
      
      // Verificar que tenemos un caso válido
      if (!createdCase || !createdCase.id_caso) {
        console.error("No se pudo identificar el caso creado");
        return {
          success: false,
          error: "No se pudo identificar el caso creado",
        };
      }
      
      // Ahora que tenemos el ID del caso, enviamos los datos de tutela al endpoint /dt/
      try {
        const idCaso = createdCase.id_caso;
        const dtEndpoint = `${API_BASE_URL}/dt/`;
        const dtData = {
          id_caso: idCaso,
          hechos: datosTutela.hechos,
          pretensiones: datosTutela.pretensiones,
          fundamentos_derecho: datosTutela.fundamentos_derecho
        };
        
        console.log("Enviando datos de tutela:", dtData);
        
        const dtResponse = await fetch(dtEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dtData)
        });
        
        if (dtResponse.ok) {
          const dtResult = await dtResponse.json();
          console.log("Datos de tutela guardados exitosamente:", dtResult);
        } else {
          console.error("Error al guardar datos de tutela:", await dtResponse.text());
        }
      } catch (dtError) {
        console.error("Error al enviar datos de tutela:", dtError);
      }
      
      // Guardar el ID del caso
      caseId = createdCase.id_caso;
      console.log("Caso creado exitosamente con ID:", caseId);
      
      // Invalidar caché
      invalidateCache("cases");
      
      // PASO 3: Asignar usuarios al caso
      console.log("===== ASIGNANDO USUARIOS AL CASO =====");
      
      const userAssignments = [
        {
          userId: Number(formData.get("profesor_id")),
          role: "Docente",
        },
        // Incluir monitor solo si está seleccionado
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
      
      // Realizar las asignaciones directamente con fetch
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      let assignmentSuccess = true;
      
      // Verificar que hay asignaciones válidas
      if (userAssignments.length === 0) {
        console.warn("No se encontraron asignaciones válidas para el caso:", caseId);
        return {
          success: true,
          data: {
            citizen: { id_ciudadano: citizenId },
            case: createdCase,
            warning: "No se asignaron usuarios al caso",
          },
        };
      }
      
      // Mecanismo de reintento para asignaciones
      const MAX_RETRIES = 3;
      const RETRY_DELAY = 1000; // 1 segundo
      
      // Función para retraso
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      
      // Función para asignar usuarios con reintentos usando fetch directamente
      const assignUserWithRetry = async (
        caseId: number,
        userId: number,
        role: string
      ): Promise<boolean> => {
        let retries = 0;
        
        while (retries < MAX_RETRIES) {
          try {
            console.info(`Asignando usuario ${userId} como ${role} al caso ${caseId}`);
            
            const assignmentData = {
              id_caso: caseId,
              id_usuario: userId,
              rol_en_caso: role
            };
            
            console.debug(`Enviando datos de asignación: ${JSON.stringify(assignmentData)}`);
            
            const endpoint = `${apiBaseUrl}/casos-usuarios/`;
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(assignmentData)
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`Error ${response.status}: ${response.statusText}
${errorText}`);
              throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            return true;
          } catch (error) {
            console.error(
              `Error al asignar usuario ${userId} al caso ${caseId}:`,
              error
            );
            retries++;
            await delay(RETRY_DELAY);
          }
        }
        
        return false;
      };
      
      try {
        // Intentar asignar usuarios pero no bloquear el flujo si falla
        const assignmentPromises = userAssignments.map(({ userId, role }) =>
          assignUserWithRetry(caseId, userId, role)
        );
        
        const assignmentResults = await Promise.all(assignmentPromises);
        const allAssignmentsSuccessful = assignmentResults.every(Boolean);
        
        if (!allAssignmentsSuccessful) {
          console.warn("Algunas asignaciones fallaron después de los reintentos");
        }
      } catch (assignError) {
        console.error("Error en asignación de usuarios:", assignError);
        // Continuar el flujo incluso si las asignaciones fallan
      }
      
      // Devolver resultado de éxito independientemente de las asignaciones
      return {
        success: true,
        data: {
          citizen: { id_ciudadano: citizenId },
          case: createdCase,
          warning: "El caso se ha creado correctamente. La asignación de usuarios podría haber fallado."
        },
      };
      
    } catch (caseError) {
      console.error("Error en creación de caso:", caseError);
      return {
        success: false,
        error: caseError instanceof Error ? caseError.message : "Error desconocido en la creación del caso",
      };
    }
    
  } catch (error) {
    console.error("Error general en procesamiento de formulario:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  } finally {
    console.log("===== FIN PROCESAMIENTO DE FORMULARIO =====");
  }
}
