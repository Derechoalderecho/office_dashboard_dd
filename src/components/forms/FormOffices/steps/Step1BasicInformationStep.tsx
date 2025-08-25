"use client";

import { parseNumberToString } from "@/utils/string";
import {
  Input,
  Select,
  SelectItem,
  DateInput,
  DateValue,
  Autocomplete,
  AutocompleteItem,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  NumberInput,
  Checkbox,
} from "@heroui/react";
import { useState, useEffect } from "react";
import {
  fetchAllCitizens,
  findCitizenByDocument,
} from "@/services/citizenService";
import { Citizen } from "@/types/citizens";
import {
  XIcon,
  SearchIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import { I18nProvider } from "@react-aria/i18n";
import {
  fetchLocations,
  getUniqueDepartments,
  getMunicipalitiesByDepartment,
  getDaneMunicipioByName,
  Location,
} from "@/services/locationService";
import { parseDate } from "@internationalized/date";

type BasicInformationProps = {
  formData: {
    num_documento: string;
    tipo_documento: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    sexo: string;
    genero: string;
    orientacion_sexual: string;
    fecha_nacimiento: string;
    num_movil: string;
    telefono_fijo: string;
    email: string;
    nacionalidad: string;
    estado_civil: string;
    escolaridad: string;
    etnia: string;
    discapacidad: string;
    sabe_leer_escribir: string;
    citizen_id: string;
    is_existing_citizen: string;
    direccion_residencia: string;
    estrato: string;
    zona_residencia: string;
    departamento: string;
    municipio: string;
    dane_municipio: string;
  };
  updateFormData: (
    data: Partial<{
      num_documento: string;
      tipo_documento: string;
      primer_nombre: string;
      segundo_nombre: string;
      primer_apellido: string;
      segundo_apellido: string;
      sexo: string;
      genero: string;
      orientacion_sexual: string;
      fecha_nacimiento: string;
      num_movil: string;
      telefono_fijo: string;
      email: string;
      nacionalidad: string;
      estado_civil: string;
      escolaridad: string;
      etnia: string;
      discapacidad: string;
      sabe_leer_escribir: string;
      citizen_id: string;
      is_existing_citizen: string;
      direccion_residencia: string;
      estrato: string;
      zona_residencia: string;
      departamento: string;
      municipio: string;
      dane_municipio: string;
    }>
  ) => void;
  validationErrors?: { [key: string]: string };
};

export default function Step1BasicInformationStep({
  formData,
  updateFormData,
  validationErrors = {},
}: BasicInformationProps) {
  const [fechaNacimiento, setFechaNacimiento] = useState<DateValue | null>(
    null
  );
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullForm, setShowFullForm] = useState<boolean>(
    Boolean(
      formData.primer_nombre || 
      formData.primer_apellido || 
      formData.is_existing_citizen === "true" ||
      formData.citizen_id
    )
  );
  const [isExistingCitizen, setIsExistingCitizen] = useState<boolean>(
    formData.is_existing_citizen === "true"
  );
  const [notification, setNotification] = useState<{
    type: "success" | "info" | "warning" | "error";
    message: string;
  } | null>(null);
  const [nacionalidadPersonalizada, setNacionalidadPersonalizada] =
    useState<string>(
      formData.nacionalidad &&
        !["Colombia", "Venezuela"].includes(formData.nacionalidad)
        ? formData.nacionalidad
        : ""
    );
  const [showNacionalidadInput, setShowNacionalidadInput] = useState<boolean>(
    Boolean(
      formData.nacionalidad &&
        !["Colombia", "Venezuela"].includes(formData.nacionalidad)
    )
  );
  const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);

  // States for address components
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

  const handleNacionalidadChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    if (value === "Otro") {
      setShowNacionalidadInput(true);
      updateFormData({ nacionalidad: nacionalidadPersonalizada || "" });
    } else {
      setShowNacionalidadInput(false);
      setNacionalidadPersonalizada("");
      updateFormData({ nacionalidad: value });
    }
  };

  const handleNacionalidadPersonalizadaChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setNacionalidadPersonalizada(value);
    updateFormData({ nacionalidad: value });
  };

  const handleTipoDocumentoChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    updateFormData({
      tipo_documento: value,
      num_documento: value === "SD" ? "" : formData.num_documento,
    });
  };

  // Fetch all citizens for the dropdown
  useEffect(() => {
    const loadCitizens = async () => {
      setIsLoading(true);
      const allCitizens = await fetchAllCitizens();
      setCitizens(allCitizens);
      setIsLoading(false);
    };
    loadCitizens();
  }, []);

  // Fetch locations data
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

  // Update municipalities when department changes
  useEffect(() => {
    if (formData.departamento) {
      console.log(`Selected department: "${formData.departamento}"`);
      console.log(`Available locations:`, locations.length);

      const filteredMunicipalities = getMunicipalitiesByDepartment(
        locations,
        formData.departamento
      );

      console.log(
        `Filtered municipalities: ${filteredMunicipalities.length}`,
        filteredMunicipalities
      );

      setMunicipalities(filteredMunicipalities);
      // Reset municipio if it's not in the new list
      if (!filteredMunicipalities.includes(formData.municipio)) {
        console.log(
          `Current municipio "${formData.municipio}" not found in filtered list, resetting`
        );
        updateFormData({ municipio: "" });
      }
    } else {
      setMunicipalities([]);
      updateFormData({ municipio: "" });
    }
  }, [formData.departamento, locations]);

  // Efecto para establecer fechaNacimiento si ya existe en formData
  useEffect(() => {
    if (formData.fecha_nacimiento && !fechaNacimiento) {
      try {
        const datePart = formData.fecha_nacimiento.split("T")[0];
        const parsedDate = parseDate(datePart);
        setFechaNacimiento(parsedDate);
      } catch (error) {
        console.error("Error parsing date from formData:", error);
      }
    }
  }, [formData.fecha_nacimiento, fechaNacimiento]);

  const searchCitizen = async () => {
    if (!formData.tipo_documento || !formData.num_documento) {
      setNotification({
        type: "warning",
        message: "Por favor ingrese el tipo y número de documento",
      });
      return;
    }

    setIsLoading(true);
    try {
      const citizen = await findCitizenByDocument(
        formData.tipo_documento,
        formData.num_documento
      );

      if (citizen) {
        // Citizen found - populate form with their data
        updateFormData({
          primer_nombre: citizen.primer_nombre || "",
          segundo_nombre: citizen.segundo_nombre || "",
          primer_apellido: citizen.primer_apellido || "",
          segundo_apellido: citizen.segundo_apellido || "",
          email: citizen.email || "",
          num_movil: citizen.num_movil || "",
          telefono_fijo: citizen.num_fijo || "",
          fecha_nacimiento: citizen.fecha_nacimiento || "",
          sexo: citizen.sexo || "",
          genero: citizen.genero || "",
          orientacion_sexual: citizen.orientacion_sexual || "",
          nacionalidad: citizen.nacionalidad || "",
          estado_civil: citizen.estado_civil || "",
          escolaridad: citizen.escolaridad || "",
          etnia: citizen.etnia || "",
          discapacidad: typeof citizen.discapacidad === "boolean" ? (citizen.discapacidad ? "true" : "false") : "",
          sabe_leer_escribir: typeof citizen.sabe_leer_escribir === "boolean" ? (citizen.sabe_leer_escribir ? "true" : "false") : "",
          direccion_residencia: citizen.direccion_residencia || "",
          estrato: citizen.estrato.toString() || "",
          zona_residencia: citizen.zona_residencia || "",
          departamento: citizen.departamento || "",
          municipio: citizen.municipio || "",
          citizen_id: citizen.id.toString(),
          is_existing_citizen: "true",
        });

        setIsExistingCitizen(true);
        setNotification({
          type: "success",
          message:
            "Ciudadano existente encontrado. Los campos han sido rellenados automáticamente.",
        });

        // Set fecha_nacimiento state if available
        if (citizen.fecha_nacimiento) {
          try {
            // Extract just the date part if it contains time
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
      } else {
        // Citizen not found - show empty form
        // Only keep the document fields, reset everything else
        updateFormData({
          primer_nombre: "",
          segundo_nombre: "",
          primer_apellido: "",
          segundo_apellido: "",
          email: "",
          num_movil: "",
          telefono_fijo: "",
          fecha_nacimiento: "",
          sexo: "",
          genero: "",
          orientacion_sexual: "",
          nacionalidad: "",
          estado_civil: "",
          escolaridad: "",
          etnia: "",
          discapacidad: "",
          sabe_leer_escribir: "",
          direccion_residencia: "",
          estrato: "",
          zona_residencia: "",
          departamento: "",
          municipio: "",
          citizen_id: "",
          is_existing_citizen: "false",
        });

        setIsExistingCitizen(false);
        setNotification({
          type: "info",
          message:
            "No se encontró ciudadano con este documento. Por favor ingrese la información para crear uno nuevo.",
        });

        // Reset fecha_nacimiento
        setFechaNacimiento(null);
      }

      // Show the full form after search
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
    updateFormData({ direccion_residencia: direccionCompleta });
    setIsAddressPopoverOpen(false);
  };

  return (
    <div className="space-y-8">
      {notification && (
        <div
          className={`p-4 mb-4 rounded-lg flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-green-100 text-green-800"
              : notification.type === "info"
              ? "bg-blue-100 text-blue-800"
              : notification.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircleIcon size={20} />
          ) : notification.type === "error" ? (
            <AlertCircleIcon size={20} />
          ) : (
            <AlertCircleIcon size={20} />
          )}
          <span>{notification.message}</span>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            className="ml-auto"
            onPress={() => setNotification(null)}
          >
            <XIcon size={16} />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          id="tipo_documento"
          name="tipo_documento"
          variant="bordered"
          label="Tipo de documento"
          labelPlacement="outside"
          placeholder="Seleccione tipo de documento"
          selectedKeys={
            formData.tipo_documento ? [formData.tipo_documento] : []
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

        {formData.tipo_documento !== "SD" && (
          <Input
            id="num_documento"
            name="num_documento"
            variant="bordered"
            label="Número de documento"
            labelPlacement="outside"
            value={formData.num_documento}
            onChange={(e) => updateFormData({ num_documento: e.target.value })}
            placeholder="Ingrese número de documento"
            isRequired
          />
        )}

        <Button
          color="primary"
          startContent={<SearchIcon size={16} />}
          onPress={searchCitizen}
          isLoading={isLoading}
          className="self-end"
        >
          Buscar Ciudadano
        </Button>
      </div>

      {showFullForm && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">
              {isExistingCitizen
                ? "Información del Ciudadano"
                : "Crear Nuevo Ciudadano"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              id="primer_nombre"
              name="primer_nombre"
              variant="bordered"
              label="Primer nombre"
              labelPlacement="outside"
              value={formData.primer_nombre}
              onChange={(e) =>
                updateFormData({ primer_nombre: e.target.value })
              }
              placeholder="Ingrese su primer nombre"
              isRequired
            />

            <Input
              id="segundo_nombre"
              name="segundo_nombre"
              variant="bordered"
              label="Segundo nombre"
              labelPlacement="outside"
              value={formData.segundo_nombre}
              onChange={(e) =>
                updateFormData({ segundo_nombre: e.target.value })
              }
              placeholder="Ingrese su segundo nombre"
            />

            <Input
              id="primer_apellido"
              name="primer_apellido"
              variant="bordered"
              label="Primer apellido"
              labelPlacement="outside"
              value={formData.primer_apellido}
              onChange={(e) =>
                updateFormData({ primer_apellido: e.target.value })
              }
              placeholder="Ingrese su primer apellido"
              isRequired
            />

            <Input
              id="segundo_apellido"
              name="segundo_apellido"
              variant="bordered"
              label="Segundo apellido"
              labelPlacement="outside"
              value={formData.segundo_apellido}
              onChange={(e) =>
                updateFormData({ segundo_apellido: e.target.value })
              }
              placeholder="Ingrese su segundo apellido"
            />

            <I18nProvider locale="es">
              <DateInput
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                variant="bordered"
                label="Fecha de nacimiento"
                labelPlacement="outside"
                value={fechaNacimiento}
                onChange={(date) => {
                  setFechaNacimiento(date);
                  if (date) {
                    const formattedDate = date.toString().split("T")[0];
                    updateFormData({ fecha_nacimiento: formattedDate });
                  }
                }}
                isRequired
              />
            </I18nProvider>

            <Select
              id="sexo"
              name="sexo"
              variant="bordered"
              label="Sexo"
              labelPlacement="outside"
              placeholder="Seleccione su sexo"
              selectedKeys={formData.sexo ? [formData.sexo] : []}
              onChange={(e) => updateFormData({ sexo: e.target.value })}
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
              id="genero"
              name="genero"
              variant="bordered"
              label="Género"
              labelPlacement="outside"
              placeholder="Seleccione su género"
              selectedKeys={formData.genero ? [formData.genero] : []}
              onChange={(e) => updateFormData({ genero: e.target.value })}
              isRequired
            >
              <SelectItem key="Masculino">Masculino</SelectItem>
              <SelectItem key="Femenino">Femenino</SelectItem>
              <SelectItem key="Transgénero">Transgénero</SelectItem>
              <SelectItem key="No binario">No binario</SelectItem>
            </Select>

            <Select
              id="orientacion_sexual"
              name="orientacion_sexual"
              variant="bordered"
              label="Orientación sexual"
              labelPlacement="outside"
              placeholder="Seleccione su orientación sexual"
              selectedKeys={
                formData.orientacion_sexual ? [formData.orientacion_sexual] : []
              }
              onChange={(e) =>
                updateFormData({ orientacion_sexual: e.target.value })
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
              id="num_movil"
              name="num_movil"
              variant="bordered"
              label="Número móvil"
              labelPlacement="outside"
              placeholder="Ingrese su número móvil"
              formatOptions={{
                useGrouping: false,
              }}
              value={
                formData.num_movil ? Number(formData.num_movil) : undefined
              }
              onValueChange={(value) =>
                updateFormData({ num_movil: value.toString() })
              }
              isRequired
            />

            <NumberInput
              id="telefono_fijo"
              name="telefono_fijo"
              variant="bordered"
              label="Número fijo"
              labelPlacement="outside"
              hideStepper
              formatOptions={{
                useGrouping: false,
              }}
              value={formData.telefono_fijo ? Number(formData.telefono_fijo) : undefined}
              onValueChange={(value) =>
                updateFormData({ telefono_fijo: value.toString() })
              }
              placeholder="Ingrese su número fijo"
            />

            <Input
              id="email"
              name="email"
              variant="bordered"
              label="Correo electrónico"
              labelPlacement="outside"
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
              placeholder="Ingrese su correo electrónico"
            />

            <Select
              id="nacionalidad"
              name="nacionalidad"
              variant="bordered"
              label="Nacionalidad"
              labelPlacement="outside"
              placeholder="Seleccione su nacionalidad"
              selectedKeys={
                showNacionalidadInput
                  ? ["Otro"]
                  : formData.nacionalidad
                  ? [formData.nacionalidad]
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
                id="nacionalidad_personalizada"
                name="nacionalidad_personalizada"
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
              id="estado_civil"
              name="estado_civil"
              variant="bordered"
              label="Estado civil"
              labelPlacement="outside"
              placeholder="Seleccione su estado civil"
              selectedKeys={
                formData.estado_civil ? [formData.estado_civil] : []
              }
              onChange={(e) => updateFormData({ estado_civil: e.target.value })}
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
              id="escolaridad"
              name="escolaridad"
              variant="bordered"
              label="Escolaridad"
              labelPlacement="outside"
              placeholder="Seleccione su nivel de escolaridad"
              selectedKeys={formData.escolaridad ? [formData.escolaridad] : []}
              onChange={(e) => updateFormData({ escolaridad: e.target.value })}
              isRequired
            >
              <SelectItem key="Ninguna">Ninguna</SelectItem>
              <SelectItem key="Preescolar">Preescolar</SelectItem>
              <SelectItem key="Primaria">Primaria (1.º a 5.º grado)</SelectItem>
              <SelectItem key="Secundaria">
                Secundaria (6.º a 9.º grado)
              </SelectItem>
              <SelectItem key="Media">Media (10.º a 11.º grado)</SelectItem>
              <SelectItem key="Técnica/Tecnológica">Técnica o tecnológica</SelectItem>
              <SelectItem key="Pregrado">Pregrado</SelectItem>
              <SelectItem key="Maestría">Maestría</SelectItem>
              <SelectItem key="Doctorado">Doctorado</SelectItem>
            </Select>

            <Select
              id="etnia"
              name="etnia"
              variant="bordered"
              label="Etnia"
              labelPlacement="outside"
              placeholder="Seleccione su etnia"
              selectedKeys={formData.etnia ? [formData.etnia] : []}
              onChange={(e) => updateFormData({ etnia: e.target.value })}
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
              id="estrato"
              name="estrato"
              label="Estrato"
              variant="bordered"
              labelPlacement="outside"
              placeholder="Ingrese su estrato"
              hideStepper
              formatOptions={{
                useGrouping: false,
              }}
              value={formData.estrato ? Number(formData.estrato) : undefined}
              onValueChange={(value) =>
                updateFormData({ estrato: value.toString() })
              }
              minValue={1}
              maxValue={6}
              errorMessage={validationErrors?.estrato}
            />
            <Select
              id="zona_residencia"
              name="zona_residencia"
              label="Zona"
              variant="bordered"
              labelPlacement="outside"
              placeholder="Seleccione su zona"
              selectedKeys={formData.zona_residencia ? [formData.zona_residencia] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0]?.toString() || "";
                updateFormData({ zona_residencia: selectedKey });
              }}
              errorMessage={validationErrors?.zona}
            >
              <SelectItem key="Urbana">Urbana</SelectItem>
              <SelectItem key="Rural">Rural</SelectItem>
            </Select>

            <Select
              id="departamento"
              name="departamento"
              label="Departamento"
              variant="bordered"
              labelPlacement="outside"
              placeholder="Seleccione su departamento"
              selectedKeys={
                formData.departamento ? [formData.departamento] : []
              }
              onChange={(e) => updateFormData({ departamento: e.target.value })}
              isRequired
            >
              {departments.map((dept) => (
                <SelectItem key={dept}>{dept}</SelectItem>
              ))}
            </Select>

            <Select
              id="municipio"
              name="municipio"
              label="Municipio"
              variant="bordered"
              labelPlacement="outside"
              placeholder="Seleccione su municipio"
              isRequired
              selectedKeys={formData.municipio ? [formData.municipio] : []}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0]?.toString() || "";
                
                // Guardar el nombre del municipio
                updateFormData({ municipio: selectedKey });
                
                // Obtener y guardar el código DANE del municipio
                if (selectedKey) {
                  const daneMunicipio = getDaneMunicipioByName(locations, selectedKey);
                  if (daneMunicipio) {
                    console.log(`Guardando código DANE del municipio: ${daneMunicipio}`);
                    updateFormData({ dane_municipio: daneMunicipio });
                  }
                }
              }}
              isDisabled={!formData.departamento}
              errorMessage={validationErrors?.municipio}
            >
              {municipalities.map((mun) => (
                <SelectItem key={mun}>{mun}</SelectItem>
              ))}
            </Select>

            <Select
              id="discapacidad"
              name="discapacidad"
              variant="bordered"
              label="¿Tiene alguna discapacidad?"
              labelPlacement="outside"
              placeholder="Seleccione una opción"
              selectedKeys={
                formData.discapacidad ? [formData.discapacidad] : []
              }
              onChange={(e) => updateFormData({ discapacidad: e.target.value })}
              isRequired
            >
              <SelectItem key="true">Sí</SelectItem>
              <SelectItem key="false">No</SelectItem>
            </Select>

            <Select
              id="sabe_leer_escribir"
              name="sabe_leer_escribir"
              variant="bordered"
              label="¿Sabe leer y escribir?"
              labelPlacement="outside"
              placeholder="Seleccione una opción"
              selectedKeys={
                formData.sabe_leer_escribir ? [formData.sabe_leer_escribir] : []
              }
              onChange={(e) =>
                updateFormData({ sabe_leer_escribir: e.target.value })
              }
              isRequired
            >
              <SelectItem key="true">Sí</SelectItem>
              <SelectItem key="false">No</SelectItem>
            </Select>

            <div className="flex flex-col gap-1 justify-end">
              <p className="text-sm text-gray-500">
                {formData.direccion_residencia ? formData.direccion_residencia : "No especificada"}
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
                        <SelectItem key="Avenida calle">
                          Avenida calle
                        </SelectItem>
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
                        onValueChange={(value) =>
                          setNumeroVia(value.toString())
                        }
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
