"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  Input,
  Select,
  SelectItem,
  DateInput,
  DateValue,
  NumberInput,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
} from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { parseDate } from "@internationalized/date";
import {
  fetchLocations,
  getUniqueDepartments,
  getMunicipalitiesByDepartment,
  getDaneMunicipioByName,
  Location,
} from "@/services/locationService";
import {
  findCitizenByDocument,
} from "@/services/citizenService";
import {
  XIcon,
  SearchIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react";

export default function Step1BasicInformationConciliation() {
  const { register, watch, setValue } = useFormContext();
  
  // Obtener datos del formulario
  const formData = watch();
  const ciudadanoData = formData.ciudadano_solicitante || {};
  
  const [fechaNacimiento, setFechaNacimiento] = useState<DateValue | null>(
    null
  );
  const [fechaExpedicion, setFechaExpedicion] = useState<DateValue | null>(
    null
  );
  const [showNacionalidadInput, setShowNacionalidadInput] = useState(false);
  const [nacionalidadPersonalizada, setNacionalidadPersonalizada] =
    useState("");
  const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);
  
  // Estados para búsqueda de ciudadanos
  const [isLoading, setIsLoading] = useState(false);
  const [showFullForm, setShowFullForm] = useState<boolean>(
    Boolean(
      ciudadanoData.primer_nombre || 
      ciudadanoData.primer_apellido
    )
  );
  const [isExistingCitizen, setIsExistingCitizen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "info" | "warning" | "error";
    message: string;
  } | null>(null);

  // Estados para locaciones
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);

  // Estado para la dirección de residencia
  const [tipoVia, setTipoVia] = useState<string>("");
  const [numeroVia, setNumeroVia] = useState<string>("");
  const [letraVia, setLetraVia] = useState<string>("");
  const [isBis, setIsBis] = useState<boolean>(false);
  const [letraBis, setLetraBis] = useState<string>("");
  const [orientacion, setOrientacion] = useState<string>("");
  const [numeroCruce, setNumeroCruce] = useState<string>("");
  const [letraCruce, setLetraCruce] = useState<string>("");
  const [numeroPlaca, setNumeroPlaca] = useState<string>("");
  const [complemento, setComplemento] = useState<string>("");

  // Nota: No necesitamos cargar todos los ciudadanos al inicio
  // Solo usamos la búsqueda individual por documento

  // Fetch datos de ubicación
  useEffect(() => {
    const loadLocations = async () => {
      try {
        console.log("Fetching locations data...");
        const data = await fetchLocations();
        console.log(`Locations data fetched: ${data.length} items`);
        setLocations(data);

        if (data.length > 0) {
          const depts = getUniqueDepartments(data);
          console.log(`Unique departments: ${depts.length}`, depts);
          setDepartments(depts);
        } else {
          console.error("No location data available");
        }
      } catch (error) {
        console.error("Error loading locations:", error);
      }
    };
    loadLocations();
  }, []);

  // actualiza los municipios cuando el departamento cambia
  useEffect(() => {
    if (ciudadanoData.departamento) {
      console.log(`Selected department: "${ciudadanoData.departamento}"`);
      console.log(`Available locations:`, locations.length);

      const filteredMunicipalities = getMunicipalitiesByDepartment(
        locations,
        ciudadanoData.departamento
      );

      console.log(
        `Filtered municipalities: ${filteredMunicipalities.length}`,
        filteredMunicipalities
      );

      setMunicipalities(filteredMunicipalities);
      // Reinicia el municipio si no está en la lista filtrada
      if (!filteredMunicipalities.includes(ciudadanoData.municipio)) {
        console.log(
          `Current municipio "${ciudadanoData.municipio}" not found in filtered list, resetting`
        );
        setValue("ciudadano_solicitante.municipio", "");
      }
    } else {
      setMunicipalities([]);
      setValue("ciudadano_solicitante.municipio", "");
    }
  }, [ciudadanoData.departamento, locations, setValue]);

  // Efecto para establecer fechas si ya existen en formData
  useEffect(() => {
    if (ciudadanoData.fecha_nacimiento && !fechaNacimiento) {
      try {
        const datePart = ciudadanoData.fecha_nacimiento.split("T")[0];
        const parsedDate = parseDate(datePart);
        setFechaNacimiento(parsedDate);
      } catch (error) {
        console.error("Error parsing birth date from formData:", error);
      }
    }
    
    if (ciudadanoData.fecha_expedicion && !fechaExpedicion) {
      try {
        const datePart = ciudadanoData.fecha_expedicion.split("T")[0];
        const parsedDate = parseDate(datePart);
        setFechaExpedicion(parsedDate);
      } catch (error) {
        console.error("Error parsing expedition date from formData:", error);
      }
    }
  }, [ciudadanoData.fecha_nacimiento, ciudadanoData.fecha_expedicion, fechaNacimiento, fechaExpedicion]);

  const handleNacionalidadChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    if (value === "Otro") {
      setShowNacionalidadInput(true);
      setValue("ciudadano_solicitante.nacionalidad", nacionalidadPersonalizada || "");
    } else {
      setShowNacionalidadInput(false);
      setNacionalidadPersonalizada("");
      setValue("ciudadano_solicitante.nacionalidad", value);
    }
  };

  const handleNacionalidadPersonalizadaChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setNacionalidadPersonalizada(value);
    setValue("ciudadano_solicitante.nacionalidad", value);
  };

  const handleTipoDocumentoChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setValue("ciudadano_solicitante.tipo_documento", value);
    if (value === "SD") {
      setValue("ciudadano_solicitante.num_documento", "");
    }
  };

  // Función para buscar ciudadano existente
  const searchCitizen = async () => {
    if (!ciudadanoData.tipo_documento || !ciudadanoData.num_documento) {
      setNotification({
        type: "warning",
        message: "Por favor ingrese el tipo y número de documento",
      });
      return;
    }

    setIsLoading(true);
    try {
      const citizen = await findCitizenByDocument(
        ciudadanoData.tipo_documento,
        ciudadanoData.num_documento
      );

      if (citizen) {
        // Ciudadano encontrado - llenar formulario con sus datos
        setValue("ciudadano_solicitante.primer_nombre", citizen.primer_nombre || "");
        setValue("ciudadano_solicitante.segundo_nombre", citizen.segundo_nombre || "");
        setValue("ciudadano_solicitante.primer_apellido", citizen.primer_apellido || "");
        setValue("ciudadano_solicitante.segundo_apellido", citizen.segundo_apellido || "");
        setValue("ciudadano_solicitante.email", citizen.email || "");
        setValue("ciudadano_solicitante.num_movil", citizen.num_movil || "");
        setValue("ciudadano_solicitante.telefono_fijo", citizen.telefono_fijo || "");
        setValue("ciudadano_solicitante.fecha_nacimiento", citizen.fecha_nacimiento || "");
        setValue("ciudadano_solicitante.sexo", citizen.sexo || "");
        setValue("ciudadano_solicitante.genero", citizen.genero || "");
        setValue("ciudadano_solicitante.orientacion_sexual", citizen.orientacion_sexual || "");
        setValue("ciudadano_solicitante.nacionalidad", citizen.nacionalidad || "");
        setValue("ciudadano_solicitante.estado_civil", citizen.estado_civil || "");
        setValue("ciudadano_solicitante.escolaridad", citizen.escolaridad || "");
        setValue("ciudadano_solicitante.etnia", citizen.etnia || "");
        setValue("ciudadano_solicitante.discapacidad", typeof citizen.discapacidad === "boolean" ? citizen.discapacidad : false);
        setValue("ciudadano_solicitante.sabe_leer_escribir", typeof citizen.sabe_leer_escribir === "boolean" ? citizen.sabe_leer_escribir : false);
        setValue("ciudadano_solicitante.direccion_residencia", citizen.direccion_residencia || "");
        setValue("ciudadano_solicitante.estrato", citizen.estrato || null);
        setValue("ciudadano_solicitante.zona_residencia", citizen.zona_residencia || "");
        setValue("ciudadano_solicitante.departamento", citizen.departamento || "");
        setValue("ciudadano_solicitante.municipio", citizen.municipio || "");
        setValue("ciudadano_solicitante.dane_municipio", citizen.dane_municipio || "");

        setIsExistingCitizen(true);
        setNotification({
          type: "success",
          message:
            "Ciudadano existente encontrado. Los campos han sido rellenados automáticamente.",
        });

        // Establecer fecha de nacimiento si está disponible
        if (citizen.fecha_nacimiento) {
          try {
            const datePart = citizen.fecha_nacimiento.split("T")[0];
            const parsedDate = parseDate(datePart);
            setFechaNacimiento(parsedDate);
          } catch (error) {
            console.error(
              "Error parsing date:",
              error,
              citizen.fecha_nacimiento
            );
            setFechaNacimiento(null);
          }
        }

        // Nota: fecha_expedicion no está disponible en el tipo Citizen
        // Se mantendrá como campo vacío para nuevos registros
      } else {
        // Ciudadano no encontrado - mostrar formulario vacío
        // Solo mantener los campos de documento, resetear todo lo demás
        setValue("ciudadano_solicitante.primer_nombre", "");
        setValue("ciudadano_solicitante.segundo_nombre", "");
        setValue("ciudadano_solicitante.primer_apellido", "");
        setValue("ciudadano_solicitante.segundo_apellido", "");
        setValue("ciudadano_solicitante.email", "");
        setValue("ciudadano_solicitante.num_movil", "");
        setValue("ciudadano_solicitante.telefono_fijo", "");
        setValue("ciudadano_solicitante.fecha_nacimiento", "");
        setValue("ciudadano_solicitante.sexo", "");
        setValue("ciudadano_solicitante.genero", "");
        setValue("ciudadano_solicitante.orientacion_sexual", "");
        setValue("ciudadano_solicitante.nacionalidad", "");
        setValue("ciudadano_solicitante.estado_civil", "");
        setValue("ciudadano_solicitante.escolaridad", "");
        setValue("ciudadano_solicitante.ocupacion", "");
        setValue("ciudadano_solicitante.etnia", "");
        setValue("ciudadano_solicitante.discapacidad", false);
        setValue("ciudadano_solicitante.sabe_leer_escribir", false);
        setValue("ciudadano_solicitante.direccion_residencia", "");
        setValue("ciudadano_solicitante.estrato", null);
        setValue("ciudadano_solicitante.zona_residencia", "");
        setValue("ciudadano_solicitante.departamento", "");
        setValue("ciudadano_solicitante.municipio", "");
        setValue("ciudadano_solicitante.dane_municipio", "");

        setIsExistingCitizen(false);
        setNotification({
          type: "info",
          message:
            "No se encontró ciudadano con este documento. Por favor ingrese la información para crear uno nuevo.",
        });

        // Resetear fechas
        setFechaNacimiento(null);
        setFechaExpedicion(null);
      }

      // Mostrar el formulario completo después de la búsqueda
      setShowFullForm(true);
    } catch (error) {
      console.error("Error searching for citizen:", error);
      setNotification({
        type: "error",
        message: "Error al buscar ciudadano. Por favor intente nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const construirDireccion = () => {
    const partes = [];

    if (tipoVia) {
      let parte = tipoVia;

      if (numeroVia) {
        parte += " " + numeroVia;
      }

      if (letraVia) {
        parte += letraVia;
      }

      if (isBis) {
        parte += " BIS";

        if (letraBis) {
          parte += " " + letraBis;
        }
      }

      if (orientacion) {
        parte += " " + orientacion;
      }

      partes.push(parte);
    }

    // Añadir el cruce si existe
    if (numeroCruce) {
      let cruce = "# " + numeroCruce;

      if (letraCruce) {
        cruce += letraCruce;
      }

      partes.push(cruce);
    }

    // Añadir el número de placa si existe
    if (numeroPlaca) {
      partes.push("- " + numeroPlaca);
    }

    // Añadir el complemento si existe
    if (complemento) {
      partes.push(complemento);
    }

    // Unir todas las partes con espacios, excepto el complemento que va con coma
    let direccionCompleta = "";
    if (partes.length > 0) {
      // Si hay complemento (último elemento), separarlo con coma
      if (complemento && partes.length > 1) {
        const partesBasicas = partes.slice(0, -1).join(" ");
        direccionCompleta = partesBasicas + ", " + partes[partes.length - 1];
      } else {
        direccionCompleta = partes.join(" ");
      }
    }

    return direccionCompleta.trim();
  };

  // Save address
  const guardarDireccion = () => {
    const direccionCompleta = construirDireccion();
    setValue("ciudadano_solicitante.direccion_residencia", direccionCompleta);
    setIsAddressPopoverOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          variant="bordered"
          label="Tipo de documento"
          labelPlacement="outside"
          placeholder="Seleccione tipo de documento"
          selectedKeys={
            ciudadanoData.tipo_documento ? [ciudadanoData.tipo_documento] : []
          }
          onChange={handleTipoDocumentoChange}
          isRequired
        >
          <SelectItem key="TI">Tarjeta de identidad</SelectItem>
          <SelectItem key="CC">Cédula de ciudadanía</SelectItem>
          <SelectItem key="CE">Cédula de extranjería</SelectItem>
          <SelectItem key="P">Pasaporte</SelectItem>
          <SelectItem key="PPT">Permiso por protección temporal</SelectItem>
          <SelectItem key="SD">Sin documento</SelectItem>
        </Select>

        {ciudadanoData.tipo_documento !== "SD" && (
          <Input
            variant="bordered"
            label="Número de documento"
            labelPlacement="outside"
            placeholder="Ingrese número de documento"
            {...register("ciudadano_solicitante.num_documento")}
            isRequired
          />
        )}
      </div>

      {/* Botón de búsqueda */}
      <div className="flex justify-center">
        <Button
          color="primary"
          variant="bordered"
          startContent={<SearchIcon className="h-4 w-4" />}
          onPress={searchCitizen}
          isLoading={isLoading}
          isDisabled={!ciudadanoData.tipo_documento || (!ciudadanoData.num_documento && ciudadanoData.tipo_documento !== "SD")}
        >
          {isLoading ? "Buscando..." : "Buscar ciudadano"}
        </Button>
      </div>

      {/* Notificación */}
      {notification && (
        <div className={`p-4 rounded-lg border ${
          notification.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
          notification.type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
          notification.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
          "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === "success" && <CheckCircleIcon className="h-5 w-5" />}
            {notification.type === "warning" && <AlertCircleIcon className="h-5 w-5" />}
            {notification.type === "error" && <XIcon className="h-5 w-5" />}
            {notification.type === "info" && <AlertCircleIcon className="h-5 w-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
            <Button
              variant="light"
              size="sm"
              isIconOnly
              onPress={() => setNotification(null)}
              className="ml-auto"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Formulario completo - solo se muestra después de la búsqueda */}
      {showFullForm && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-6">
            {isExistingCitizen ? "Información del ciudadano" : "Crear nuevo ciudadano"}
          </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 gap-x-6">
          <Input
            variant="bordered"
            label="Primer nombre"
            labelPlacement="outside"
            placeholder="Ingrese su primer nombre"
            {...register("ciudadano_solicitante.primer_nombre")}
            isRequired
          />

          <Input
            variant="bordered"
            label="Segundo nombre"
            labelPlacement="outside"
            placeholder="Ingrese su segundo nombre"
            {...register("ciudadano_solicitante.segundo_nombre")}
          />

          <Input
            variant="bordered"
            label="Primer apellido"
            labelPlacement="outside"
            placeholder="Ingrese su primer apellido"
            {...register("ciudadano_solicitante.primer_apellido")}
            isRequired
          />

          <Input
            variant="bordered"
            label="Segundo apellido"
            labelPlacement="outside"
            placeholder="Ingrese su segundo apellido"
            {...register("ciudadano_solicitante.segundo_apellido")}
          />

          <I18nProvider locale="es">
            <DateInput
              variant="bordered"
              label="Fecha de nacimiento"
              labelPlacement="outside"
              value={fechaNacimiento}
              onChange={(date) => {
                setFechaNacimiento(date);
                if (date) {
                  const formattedDate = date.toString().split("T")[0];
                  setValue(
                    "ciudadano_solicitante.fecha_nacimiento",
                    formattedDate
                  );
                }
              }}
              isRequired
            />
          </I18nProvider>

          <I18nProvider locale="es">
            <DateInput
              variant="bordered"
              label="Fecha de expedición documento"
              labelPlacement="outside"
              value={fechaExpedicion}
              onChange={(date) => {
                setFechaExpedicion(date);
                if (date) {
                  const formattedDate = date.toString().split("T")[0];
                  setValue(
                    "ciudadano_solicitante.fecha_expedicion",
                    formattedDate
                  );
                }
              }}
            />
          </I18nProvider>

          <Select
            variant="bordered"
            label="Sexo"
            labelPlacement="outside"
            placeholder="Seleccione su sexo"
            selectedKeys={
              ciudadanoData.sexo ? [ciudadanoData.sexo] : []
            }
            onChange={(e) =>
              setValue("ciudadano_solicitante.sexo", e.target.value)
            }
            isRequired
          >
            <SelectItem key="Hombre">Hombre</SelectItem>
            <SelectItem key="Mujer">Mujer</SelectItem>
            <SelectItem key="Intersexual">Intersexual</SelectItem>
            <SelectItem key="Prefiere no decirlo">
              Prefiere no decirlo
            </SelectItem>
            <SelectItem key="Otro">Otro</SelectItem>
          </Select>

          <Select
            variant="bordered"
            label="Género"
            labelPlacement="outside"
            placeholder="Seleccione su género"
            selectedKeys={
              ciudadanoData.genero ? [ciudadanoData.genero] : []
            }
            onChange={(e) =>
              setValue("ciudadano_solicitante.genero", e.target.value)
            }
            isRequired
          >
            <SelectItem key="Masculino">Masculino</SelectItem>
            <SelectItem key="Femenino">Femenino</SelectItem>
            <SelectItem key="Transgénero">Transgénero</SelectItem>
            <SelectItem key="No binario">No binario</SelectItem>
          </Select>

          <Select
            variant="bordered"
            label="Orientación sexual"
            labelPlacement="outside"
            placeholder="Seleccione su orientación sexual"
            selectedKeys={
              ciudadanoData.orientacion_sexual
                ? [ciudadanoData.orientacion_sexual]
                : []
            }
            onChange={(e) =>
              setValue(
                "ciudadano_solicitante.orientacion_sexual",
                e.target.value
              )
            }
            isRequired
          >
            <SelectItem key="Heterosexual">Heterosexual</SelectItem>
            <SelectItem key="Homosexual">Homosexual</SelectItem>
            <SelectItem key="Bisexual">Bisexual</SelectItem>
            <SelectItem key="Asexual">Asexual</SelectItem>
            <SelectItem key="Pansexual">Pansexual</SelectItem>
          </Select>

          <NumberInput
            hideStepper
            variant="bordered"
            label="Número móvil"
            labelPlacement="outside"
            placeholder="Ingrese su número móvil"
            formatOptions={{ useGrouping: false }}
            value={
              ciudadanoData.num_movil
                ? Number(ciudadanoData.num_movil)
                : undefined
            }
            onValueChange={(value) =>
              setValue("ciudadano_solicitante.num_movil", value.toString())
            }
            isRequired
          />

          <NumberInput
            hideStepper
            variant="bordered"
            label="Número fijo"
            labelPlacement="outside"
            placeholder="Ingrese su número fijo"
            formatOptions={{ useGrouping: false }}
            value={
              ciudadanoData.telefono_fijo
                ? Number(ciudadanoData.telefono_fijo)
                : undefined
            }
            onValueChange={(value) =>
              setValue("ciudadano_solicitante.telefono_fijo", value.toString())
            }
          />

          <Input
            variant="bordered"
            label="Correo electrónico"
            labelPlacement="outside"
            placeholder="Ingrese su correo electrónico"
            {...register("ciudadano_solicitante.email")}
          />

          <Select
            variant="bordered"
            label="Nacionalidad"
            labelPlacement="outside"
            placeholder="Seleccione su nacionalidad"
            selectedKeys={
              showNacionalidadInput
                ? ["Otro"]
                : ciudadanoData.nacionalidad
                ? [ciudadanoData.nacionalidad]
                : []
            }
            onChange={handleNacionalidadChange}
            isRequired
          >
            <SelectItem key="Argentina">Argentina</SelectItem>
            <SelectItem key="Bolivia">Bolivia</SelectItem>
            <SelectItem key="Chile">Chile</SelectItem>
            <SelectItem key="Colombia">Colombia</SelectItem>
            <SelectItem key="Costa Rica">Costa Rica</SelectItem>
            <SelectItem key="Cuba">Cuba</SelectItem>
            <SelectItem key="Ecuador">Ecuador</SelectItem>
            <SelectItem key="El Salvador">El Salvador</SelectItem>
            <SelectItem key="España">España</SelectItem>
            <SelectItem key="Guatemala">Guatemala</SelectItem>
            <SelectItem key="Honduras">Honduras</SelectItem>
            <SelectItem key="México">México</SelectItem>
            <SelectItem key="Nicaragua">Nicaragua</SelectItem>
            <SelectItem key="Panamá">Panamá</SelectItem>
            <SelectItem key="Paraguay">Paraguay</SelectItem>
            <SelectItem key="Perú">Perú</SelectItem>
            <SelectItem key="República Dominicana">
              República Dominicana
            </SelectItem>
            <SelectItem key="Uruguay">Uruguay</SelectItem>
            <SelectItem key="Venezuela">Venezuela</SelectItem>
            <SelectItem key="Otro">Otro</SelectItem>
          </Select>

          {showNacionalidadInput && (
            <Input
              variant="bordered"
              label="Especifique su nacionalidad"
              labelPlacement="outside"
              placeholder="Ingrese su nacionalidad"
              value={nacionalidadPersonalizada}
              onChange={handleNacionalidadPersonalizadaChange}
              isRequired
            />
          )}

          <Select
            variant="bordered"
            label="Estado civil"
            labelPlacement="outside"
            placeholder="Seleccione su estado civil"
            selectedKeys={
              ciudadanoData.estado_civil
                ? [ciudadanoData.estado_civil]
                : []
            }
            onChange={(e) =>
              setValue("ciudadano_solicitante.estado_civil", e.target.value)
            }
            isRequired
          >
            <SelectItem key="Soltero/a">Soltero/a</SelectItem>
            <SelectItem key="Casado/a">Casado/a</SelectItem>
            <SelectItem key="Unión libre">Unión libre</SelectItem>
            <SelectItem key="Divorciado/a">Divorciado/a</SelectItem>
            <SelectItem key="Viudo/a">Viudo/a</SelectItem>
            <SelectItem key="No informa">No informa</SelectItem>
          </Select>

          <Select
            variant="bordered"
            label="Escolaridad"
            labelPlacement="outside"
            placeholder="Seleccione su nivel de escolaridad"
            selectedKeys={
              ciudadanoData.escolaridad
                ? [ciudadanoData.escolaridad]
                : []
            }
            onChange={(e) =>
              setValue("ciudadano_solicitante.escolaridad", e.target.value)
            }
            isRequired
          >
            <SelectItem key="Ninguna">Ninguna</SelectItem>
            <SelectItem key="Preescolar">Preescolar</SelectItem>
            <SelectItem key="Primaria">Primaria (1.º a 5.º grado)</SelectItem>
            <SelectItem key="Secundaria">
              Secundaria (6.º a 9.º grado)
            </SelectItem>
            <SelectItem key="Media">Media (10.º a 11.º grado)</SelectItem>
            <SelectItem key="Técnica/Tecnológica">
              Técnica o tecnológica
            </SelectItem>
            <SelectItem key="Pregrado">Pregrado</SelectItem>
            <SelectItem key="Maestría">Maestría</SelectItem>
            <SelectItem key="Doctorado">Doctorado</SelectItem>
          </Select>

          <Input
            variant="bordered"
            label="Ocupación"
            labelPlacement="outside"
            placeholder="Ingrese su ocupación"
            {...register("ciudadano_solicitante.ocupacion")}
          />

          <Select
            variant="bordered"
            label="Etnia"
            labelPlacement="outside"
            placeholder="Seleccione su etnia"
            selectedKeys={ciudadanoData.etnia ? [ciudadanoData.etnia] : []}
            onChange={(e) => setValue("ciudadano_solicitante.etnia", e.target.value)}
            isRequired
          >
            <SelectItem key="Indígena">Indígena</SelectItem>
            <SelectItem key="Afrocolombiano">Afrocolombiano</SelectItem>
            <SelectItem key="Mestizo">Mestizo</SelectItem>
            <SelectItem key="Raizal">Raizal</SelectItem>
            <SelectItem key="Rom/Gitano">Rom/Gitano</SelectItem>
            <SelectItem key="Ninguna">Ninguna</SelectItem>
            <SelectItem key="Otro">Otro</SelectItem>
            <SelectItem key="Prefiero no decirlo">
              Prefiero no decirlo
            </SelectItem>
          </Select>

          <NumberInput
            hideStepper
            variant="bordered"
            label="Estrato"
            labelPlacement="outside"
            placeholder="Ingrese su estrato"
            formatOptions={{ useGrouping: false }}
            value={ciudadanoData.estrato ? Number(ciudadanoData.estrato) : undefined}
            onValueChange={(value) => setValue("ciudadano_solicitante.estrato", value.toString())}
            minValue={1}
            maxValue={6}
          />

          <Select
            variant="bordered"
            label="Zona"
            labelPlacement="outside"
            placeholder="Seleccione su zona"
            selectedKeys={
              ciudadanoData.zona_residencia ? [ciudadanoData.zona_residencia] : []
            }
            onChange={(e) => setValue("ciudadano_solicitante.zona_residencia", e.target.value)}
          >
            <SelectItem key="Urbana">Urbana</SelectItem>
            <SelectItem key="Rural">Rural</SelectItem>
          </Select>

          <Select
            variant="bordered"
            label="Departamento"
            labelPlacement="outside"
            placeholder="Seleccione su departamento"
            selectedKeys={
              ciudadanoData.departamento ? [ciudadanoData.departamento] : []
            }
            onChange={(e) => setValue("ciudadano_solicitante.departamento", e.target.value)}
            isRequired
          >
            {departments.map((dept) => (
              <SelectItem key={dept}>{dept}</SelectItem>
            ))}
          </Select>

          <Select
            variant="bordered"
            label="Municipio"
            labelPlacement="outside"
            placeholder="Seleccione su municipio"
            isRequired
            selectedKeys={ciudadanoData.municipio ? [ciudadanoData.municipio] : []}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0]?.toString() || "";

              // Guardar el nombre del municipio
              setValue("ciudadano_solicitante.municipio", selectedKey);

              // Obtener y guardar el código DANE del municipio
              if (selectedKey) {
                const daneMunicipio = getDaneMunicipioByName(
                  locations,
                  selectedKey
                );
                if (daneMunicipio) {
                  console.log(
                    `Guardando código DANE del municipio: ${daneMunicipio}`
                  );
                  setValue("ciudadano_solicitante.dane_municipio", daneMunicipio);
                }
              }
            }}
            isDisabled={!ciudadanoData.departamento}
          >
            {municipalities.map((mun) => (
              <SelectItem key={mun}>{mun}</SelectItem>
            ))}
          </Select>

          <Select
            variant="bordered"
            label="¿Tiene alguna discapacidad?"
            labelPlacement="outside"
            placeholder="Seleccione una opción"
            selectedKeys={ciudadanoData.discapacidad ? [ciudadanoData.discapacidad] : []}
            onChange={(e) => setValue("ciudadano_solicitante.discapacidad", e.target.value)}
            isRequired
          >
            <SelectItem key="true">Sí</SelectItem>
            <SelectItem key="false">No</SelectItem>
          </Select>

          <Select
            variant="bordered"
            label="¿Sabe leer y escribir?"
            labelPlacement="outside"
            placeholder="Seleccione una opción"
            selectedKeys={
              ciudadanoData.sabe_leer_escribir ? [ciudadanoData.sabe_leer_escribir] : []
            }
            onChange={(e) => setValue("ciudadano_solicitante.sabe_leer_escribir", e.target.value)}
            isRequired
          >
            <SelectItem key="true">Sí</SelectItem>
            <SelectItem key="false">No</SelectItem>
          </Select>

          {/* Dirección de residencia con popover */}
          <div className="flex flex-col gap-1 justify-end">
            <p className="text-sm text-gray-500">
              {ciudadanoData.direccion_residencia
                ? ciudadanoData.direccion_residencia
                : "No especificada"}
            </p>
            <Popover
              isOpen={isAddressPopoverOpen}
              onOpenChange={setIsAddressPopoverOpen}
              placement="bottom-end"
            >
              <PopoverTrigger>
                <Button variant="bordered">Dirección de residencia</Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-4 p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Dirección de residencia
                  </h3>
                  <div className="grid grid-cols-6 gap-4">
                    <Select
                      label="Vía"
                      placeholder="Seleccione tipo de vía"
                      value={tipoVia}
                      onChange={(e) => setTipoVia(e.target.value)}
                    >
                      <SelectItem key="Anillo Vial">Anillo Vial</SelectItem>
                      <SelectItem key="Autopista">Autopista</SelectItem>
                      <SelectItem key="Avenida">Avenida</SelectItem>
                      <SelectItem key="Avenida calle">Avenida calle</SelectItem>
                      <SelectItem key="Avenida carrera">
                        Avenida carrera
                      </SelectItem>
                      <SelectItem key="Calle">Calle</SelectItem>
                      <SelectItem key="Callejón">Callejón</SelectItem>
                      <SelectItem key="Carrera">Carrera</SelectItem>
                      <SelectItem key="Circular">Circular</SelectItem>
                      <SelectItem key="Diagonal">Diagonal</SelectItem>
                      <SelectItem key="Transversal">Transversal</SelectItem>
                    </Select>

                    <NumberInput
                      label="Número"
                      placeholder="Número"
                      hideStepper
                      formatOptions={{
                        useGrouping: false,
                      }}
                      value={numeroVia ? Number(numeroVia) : undefined}
                      onValueChange={(value) => setNumeroVia(value.toString())}
                    />

                    <Select
                      value={letraVia}
                      onChange={(e) => setLetraVia(e.target.value)}
                    >
                      {Array.from({ length: 26 }, (_, i) =>
                        String.fromCharCode(65 + i)
                      ).map((letra) => (
                        <SelectItem key={letra}>{letra}</SelectItem>
                      ))}
                    </Select>

                    <Checkbox isSelected={isBis} onValueChange={setIsBis}>
                      BIS
                    </Checkbox>

                    <Select
                      value={letraBis}
                      onChange={(e) => setLetraBis(e.target.value)}
                    >
                      {Array.from({ length: 26 }, (_, i) =>
                        String.fromCharCode(65 + i)
                      ).map((letra) => (
                        <SelectItem key={letra}>{letra}</SelectItem>
                      ))}
                    </Select>

                    <Select
                      value={orientacion}
                      onChange={(e) => setOrientacion(e.target.value)}
                    >
                      <SelectItem key="Este">Este</SelectItem>
                      <SelectItem key="Norte">Norte</SelectItem>
                      <SelectItem key="Oeste">Oeste</SelectItem>
                      <SelectItem key="Sur">Sur</SelectItem>
                    </Select>

                    <NumberInput
                      label="Número"
                      placeholder="Número"
                      formatOptions={{
                        useGrouping: false,
                      }}
                      hideStepper
                      value={numeroCruce ? Number(numeroCruce) : undefined}
                      onValueChange={(value) =>
                        setNumeroCruce(value.toString())
                      }
                    />

                    <Select
                      value={letraCruce}
                      onChange={(e) => setLetraCruce(e.target.value)}
                    >
                      {Array.from({ length: 26 }, (_, i) =>
                        String.fromCharCode(65 + i)
                      ).map((letra) => (
                        <SelectItem key={letra}>{letra}</SelectItem>
                      ))}
                    </Select>

                    <NumberInput
                      hideStepper
                      formatOptions={{
                        useGrouping: false,
                      }}
                      value={numeroPlaca ? Number(numeroPlaca) : undefined}
                      onValueChange={(value) =>
                        setNumeroPlaca(value.toString())
                      }
                    />

                    <Input
                      label="Complemento"
                      placeholder="Complemento dirección (edificio, apartamento, etc.)"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                    />
                  </div>
                  <div className="mt-8">
                    <Button
                      color="primary"
                      fullWidth
                      onPress={guardarDireccion}
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
