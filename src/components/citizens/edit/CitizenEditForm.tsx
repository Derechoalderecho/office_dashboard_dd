"use client";

import { useEffect, useState, Key } from "react";
import { useRouter } from "next/navigation";
import {
  Input,
  Select,
  SelectItem,
  DateInput,
  DateValue,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  NumberInput,
  Checkbox,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Spinner,
  addToast,
} from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import { Citizen } from "@/types/citizens";
import { updateCitizen, fetchCitizenDetails } from "@/services/citizenService";
import {
  fetchLocations,
  getUniqueDepartments,
  getMunicipalitiesByDepartment,
  Location,
} from "@/services/locationService";
import { ArrowLeftIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { parseDate, CalendarDate } from "@internationalized/date";
import { mapZonaForSelect } from "@/utils/citizenUtils";

interface CitizenEditFormProps {
  citizenId: string;
}

export default function CitizenEditForm({ citizenId }: CitizenEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [formData, setFormData] = useState<Partial<Citizen>>({
    num_documento: "",
    tipo_documento: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    sexo: "",
    genero: "",
    orientacion_sexual: "",
    fecha_nacimiento: "",
    num_movil: "",
    telefono_fijo: "",
    email: "",
    nacionalidad: "",
    otra_nacionalidad: "",
    estado_civil: "",
    escolaridad: "",
    etnia: "",
    discapacidad: false,
    sabe_leer_escribir: false,
    direccion_residencia: "",
    estrato: 0,
    zona_residencia: "",
    departamento: "",
    municipio: "",
    dane_municipio: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  // Estados para el componente de fecha de nacimiento
  const [fechaNacimiento, setFechaNacimiento] = useState<DateValue | null>(
    null
  );

  // Estado para nacionalidad personalizada
  const [nacionalidadPersonalizada, setNacionalidadPersonalizada] =
    useState<string>("");
  const [showNacionalidadInput, setShowNacionalidadInput] =
    useState<boolean>(false);

  // Estados para dirección
  const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);

  // Estados para componentes de la dirección
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

  // Cargar datos del ciudadano
  useEffect(() => {
    const loadCitizen = async () => {
      setIsLoading(true);
      try {
        const citizenData = await fetchCitizenDetails(citizenId);
        if (citizenData) {
          setCitizen(citizenData);

          // Actualizar formData con los datos del ciudadano
          setFormData({
            num_documento: citizenData.num_documento || "",
            tipo_documento: citizenData.tipo_documento || "",
            primer_nombre: citizenData.primer_nombre || "",
            segundo_nombre: citizenData.segundo_nombre || "",
            primer_apellido: citizenData.primer_apellido || "",
            segundo_apellido: citizenData.segundo_apellido || "",
            sexo: citizenData.sexo || "",
            genero: citizenData.genero || "",
            orientacion_sexual: citizenData.orientacion_sexual || "",
            fecha_nacimiento: citizenData.fecha_nacimiento || "",
            num_movil: citizenData.num_movil || "",
            telefono_fijo: citizenData.telefono_fijo || "",
            email: citizenData.email || "",
            nacionalidad: citizenData.nacionalidad || "",
            otra_nacionalidad: citizenData.otra_nacionalidad || "",
            estado_civil: citizenData.estado_civil || "",
            escolaridad: citizenData.escolaridad || "",
            etnia: citizenData.etnia || "",
            discapacidad: Boolean(citizenData.discapacidad),
            sabe_leer_escribir: Boolean(citizenData.sabe_leer_escribir),
            direccion_residencia: citizenData.direccion_residencia || "",
            estrato: typeof citizenData.estrato === 'number' ? citizenData.estrato : 0,
            zona_residencia: citizenData.zona_residencia || "",
            departamento: citizenData.departamento || "",
            municipio: citizenData.municipio || "",
            dane_municipio: citizenData.dane_municipio || "",
          });

          // Inicializar fechaNacimiento si existe
          if (citizenData.fecha_nacimiento) {
            try {
              // Convertir formato yyyy-MM-dd a un objeto DateValue
              const [year, month, day] = citizenData.fecha_nacimiento.split('-').map(Number);
              if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                const dateValue = parseDate(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                setFechaNacimiento(dateValue);
              }
            } catch (error) {
              console.error("Error parsing date:", error);
            }
          }

          // Comprobar si la nacionalidad es personalizada
          if (
            citizenData.nacionalidad &&
            ![
              "Colombia",
              "Venezuela",
              "Argentina",
              "Bolivia",
              "Chile",
              "Costa Rica",
              "Cuba",
              "Ecuador",
              "El Salvador",
              "España",
              "Guatemala",
              "Honduras",
              "México",
              "Nicaragua",
              "Panamá",
              "Paraguay",
              "Perú",
              "República Dominicana",
              "Uruguay",
            ].includes(citizenData.nacionalidad)
          ) {
            setShowNacionalidadInput(true);
            setNacionalidadPersonalizada(citizenData.nacionalidad);
          }
        } else {
          addToast({
            title: "Error",
            description: "No se pudo encontrar al ciudadano",
            color: "danger",
          });
          router.push("/dashboard/citizens");
        }
      } catch (error) {
        console.error("Error loading citizen:", error);
        addToast({
          title: "Error",
          description: "Error al cargar los datos del ciudadano",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCitizen();
  }, [citizenId, router]);

  // Cargar datos de ubicaciones
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await fetchLocations();
        setLocations(data);
        setDepartments(getUniqueDepartments(data));
      } catch (error) {
        console.error("Error loading locations:", error);
      }
    };
    loadLocations();
  }, []);

  // Actualizar municipios cuando cambia el departamento
  useEffect(() => {
    if (formData.departamento && locations.length > 0) {
      const filteredMunicipalities = getMunicipalitiesByDepartment(
        locations,
        formData.departamento
      );
      setMunicipalities(filteredMunicipalities);
    }
  }, [formData.departamento, locations]);

  // Función para actualizar el estado del formulario
  const updateFormData = (data: Partial<Citizen>) => {
    // Asegurar que los valores numéricos sean tratados como números
    const processedData = Object.entries(data).reduce((acc, [key, value]) => {
      // Convertir valores específicos al tipo esperado
      if (key === 'estrato' && typeof value === 'number') {
        (acc as any)[key] = value;
      } else {
        (acc as any)[key] = value;
      }
      return acc;
    }, {} as Partial<Citizen>);

    setFormData((prevData) => ({
      ...prevData,
      ...processedData,
    }));
  };

  // Gestionar cambio de nacionalidad
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

  // Gestionar cambio de nacionalidad personalizada
  const handleNacionalidadPersonalizadaChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setNacionalidadPersonalizada(value);
    updateFormData({ nacionalidad: value });
  };

  // Gestionar cambio de tipo de documento
  const handleTipoDocumentoChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    updateFormData({
      tipo_documento: value,
      num_documento: value === "SD" ? "" : formData.num_documento,
    });
  };

  // Construir la dirección completa
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

    if (numeroCruce) {
      let cruce = "# " + numeroCruce;

      if (letraCruce) {
        cruce += letraCruce;
      }

      partes.push(cruce);
    }

    if (numeroPlaca) {
      partes.push("- " + numeroPlaca);
    }

    if (complemento) {
      partes.push(complemento);
    }

    let direccionCompleta = "";
    if (partes.length > 0) {
      if (complemento && partes.length > 1) {
        const partesBasicas = partes.slice(0, -1).join(" ");
        direccionCompleta = partesBasicas + ", " + partes[partes.length - 1];
      } else {
        direccionCompleta = partes.join(" ");
      }
    }

    return direccionCompleta.trim();
  };

  // Guardar la dirección
  const guardarDireccion = () => {
    const direccionCompleta = construirDireccion();
    updateFormData({ direccion_residencia: direccionCompleta });
    setIsAddressPopoverOpen(false);
  };

  // Send form data to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure date is in the right format for API
    let formDataToSubmit = {...formData};
    if (fechaNacimiento) {
      formDataToSubmit.fecha_nacimiento = fechaNacimiento.toString();
    }

    // Filtrar campos vacíos o no seleccionados para no enviarlos
    const filteredFormData: Record<string, any> = {};
    Object.entries(formDataToSubmit).forEach(([key, value]) => {
      // Solo incluye campos con valores (no vacíos)
      if (value !== undefined && value !== null && value !== "") {
        filteredFormData[key] = value;
      }
    });

    setIsSaving(true);
    try {
      const updatedCitizen = await updateCitizen(citizenId, filteredFormData);

      if (updatedCitizen) {
        addToast({
          title: "Ciudadano actualizado",
          description: "Ciudadano actualizado exitosamente",
          color: "success",
        });
        router.push("/dashboard/citizens");
      } else {
        addToast({
          title: "Error",
          description: "No se pudo actualizar el ciudadano",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error updating citizen:", error);
      addToast({
        title: "Error",
        description: "Error al actualizar el ciudadano",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/citizens");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Editar Ciudadano</h2>
          <p className="text-default-500">
            {formData.primer_nombre} {formData.primer_apellido} -{" "}
            {formData.num_documento}
          </p>
        </div>
        <Button
          variant="light"
          startContent={<ArrowLeftIcon />}
          onPress={handleCancel}
        >
          Volver
        </Button>
      </CardHeader>
      <Divider />
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              id="tipo_documento"
              name="tipo_documento"
              variant="bordered"
              label="Tipo de documento"
              labelPlacement="outside"
              placeholder="Seleccione su tipo de documento"
              selectedKeys={formData.tipo_documento ? [formData.tipo_documento] : []}
              onChange={handleTipoDocumentoChange}
              isRequired
              errorMessage={validationErrors.tipo_documento}
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
                onChange={(e) =>
                  updateFormData({ num_documento: e.target.value })
                }
                placeholder="Ingrese su número de documento"
                isRequired
                errorMessage={validationErrors.num_documento}
              />
            )}

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
              errorMessage={validationErrors.primer_nombre}
            />

            <Input
              id="segundo_nombre"
              name="segundo_nombre"
              variant="bordered"
              label="Segundo nombre"
              labelPlacement="outside"
              value={formData.segundo_nombre || ""}
              onChange={(e) =>
                updateFormData({ segundo_nombre: e.target.value })
              }
              placeholder="Ingrese su segundo nombre"
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
              errorMessage={validationErrors.primer_apellido}
            />

            <Input
              id="segundo_apellido"
              name="segundo_apellido"
              variant="bordered"
              label="Segundo apellido"
              labelPlacement="outside"
              value={formData.segundo_apellido || ""}
              onChange={(e) =>
                updateFormData({ segundo_apellido: e.target.value })
              }
              placeholder="Ingrese su segundo apellido"
            />

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
              errorMessage={validationErrors.sexo}
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
              errorMessage={validationErrors.genero}
            >
              <SelectItem key="M">Masculino</SelectItem>
              <SelectItem key="F">Femenino</SelectItem>
              <SelectItem key="T">Transgénero</SelectItem>
              <SelectItem key="N">No binario</SelectItem>
            </Select>

            <Select
              id="orientacion_sexual"
              name="orientacion_sexual"
              variant="bordered"
              label="Orientación sexual"
              labelPlacement="outside"
              placeholder="Seleccione su orientación sexual"
              selectedKeys={formData.orientacion_sexual ? [formData.orientacion_sexual] : []}
              onChange={(e) =>
                updateFormData({ orientacion_sexual: e.target.value })
              }
              isRequired
              errorMessage={validationErrors.orientacion_sexual}
            >
              <SelectItem key="HE">Heterosexual</SelectItem>
              <SelectItem key="HO">Homosexual</SelectItem>
              <SelectItem key="BI">Bisexual</SelectItem>
              <SelectItem key="AS">Asexual</SelectItem>
              <SelectItem key="PA">Pansexual</SelectItem>
            </Select>

            <NumberInput
              hideStepper
              id="num_movil"
              name="num_movil"
              variant="bordered"
              label="Número móvil"
              labelPlacement="outside"
              placeholder="Ingrese su número móvil"
              value={
                formData.num_movil ? Number(formData.num_movil) : undefined
              }
              onValueChange={(value) =>
                updateFormData({ num_movil: value.toString() })
              }
              isRequired
              errorMessage={validationErrors.num_movil}
            />

            <NumberInput
              id="telefono_fijo"
              name="telefono_fijo"
              variant="bordered"
              label="Número fijo"
              labelPlacement="outside"
              hideStepper
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
              errorMessage={validationErrors.nacionalidad}
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
              errorMessage={validationErrors.estado_civil}
            >
              <SelectItem key="SO">Soltero/a</SelectItem>
              <SelectItem key="CA">Casado/a</SelectItem>
              <SelectItem key="UL">Unión libre</SelectItem>
              <SelectItem key="DI">Divorciado/a</SelectItem>
              <SelectItem key="VI">Viudo/a</SelectItem>
              <SelectItem key="NI">No informa</SelectItem>
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
              errorMessage={validationErrors.escolaridad}
            >
              <SelectItem key="Ninguna">Ninguna</SelectItem>
              <SelectItem key="Preescolar">Preescolar</SelectItem>
              <SelectItem key="Primaria">Primaria (1.º a 5.º grado)</SelectItem>
              <SelectItem key="Secundaria">
                Secundaria (6.º a 9.º grado)
              </SelectItem>
              <SelectItem key="Media">Media (10.º a 11.º grado)</SelectItem>
              <SelectItem key="Técnica">Técnica o tecnológica</SelectItem>
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
              errorMessage={validationErrors.etnia}
            >
              <SelectItem key="IN">Indígena</SelectItem>
              <SelectItem key="AF">Afrocolombiano</SelectItem>
              <SelectItem key="ME">Mestizo</SelectItem>
              <SelectItem key="RA">Raizal</SelectItem>
              <SelectItem key="RO">Rom/Gitano</SelectItem>
              <SelectItem key="Ninguna">Ninguna</SelectItem>
              <SelectItem key="Otro">Otro</SelectItem>
              <SelectItem key="Prefiero no decirlo">
                Prefiero no decirlo
              </SelectItem>
            </Select>

            <NumberInput
              id="estrato"
              name="estrato"
              variant="bordered"
              label="Estrato"
              labelPlacement="outside"
              min={0}
              max={6}
              value={formData.estrato !== undefined ? Number(formData.estrato) : undefined}
              onValueChange={(value) =>
                updateFormData({ estrato: value })
              }
              minValue={1}
              maxValue={6}
              errorMessage={validationErrors.estrato}
            />

            <Select
              id="zona_residencia"
              name="zona_residencia"
              label="Zona"
              variant="bordered"
              labelPlacement="outside"
              placeholder="Seleccione su zona"
              selectedKeys={formData.zona_residencia ? [formData.zona_residencia] : []}
              onChange={(e) => {
                updateFormData({ zona_residencia: e.target.value });
              }}
              errorMessage={validationErrors.zona_residencia}
            >
              <SelectItem key="UR">Urbana</SelectItem>
              <SelectItem key="RU">Rural</SelectItem>
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
              errorMessage={validationErrors.departamento}
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
                updateFormData({ municipio: selectedKey });
              }}
              isDisabled={!formData.departamento}
              errorMessage={validationErrors.municipio}
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
              selectedKeys={[formData.discapacidad === true ? 'true' : 'false']}
              onChange={(e) => updateFormData({ discapacidad: e.target.value === 'true' })}
              isRequired
              errorMessage={validationErrors.discapacidad}
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
              selectedKeys={[formData.sabe_leer_escribir === true ? 'true' : 'false']}
              onChange={(e) =>
                updateFormData({ sabe_leer_escribir: e.target.value === 'true' })
              }
              isRequired
              errorMessage={validationErrors.sabe_leer_escribir}
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
        </form>
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-between">
        <Button variant="flat" color="danger" onPress={handleCancel}>
          Cancelar
        </Button>
        <Button
          color="primary"
          onClick={handleSubmit}
          isLoading={isSaving}
          startContent={!isSaving && <CheckIcon size={16} />}
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </CardFooter>
    </Card>
  );
}
