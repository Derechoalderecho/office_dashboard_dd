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
import {
  fetchLocations,
  getUniqueDepartments,
  getMunicipalitiesByDepartment,
  getDaneMunicipioByName,
  Location,
} from "@/services/locationService";

interface FieldsCitizenProps {
  arrayPath?: string;
  index?: number;
}

export default function FieldsCitizen({ arrayPath, index = 0 }: FieldsCitizenProps) {
  const { register, watch, setValue } = useFormContext();
  const [fechaNacimiento, setFechaNacimiento] = useState<DateValue | null>(null);
  const [fechaExpedicion, setFechaExpedicion] = useState<DateValue | null>(null);
  const [showNacionalidadInput, setShowNacionalidadInput] = useState(false);
  const [nacionalidadPersonalizada, setNacionalidadPersonalizada] = useState("");
  const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);

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

  // Función para obtener el path correcto para cada campo
  const getFieldPath = (fieldName: string) => {
    if (arrayPath) {
      return `${arrayPath}.${index}.${fieldName}`;
    }
    return fieldName;
  };

  // Función para registrar un campo con el path correcto
  const registerField = (fieldName: string) => {
    return register(getFieldPath(fieldName));
  };

  // Función para establecer el valor de un campo con el path correcto
  const setFieldValue = (fieldName: string, value: any) => {
    setValue(getFieldPath(fieldName), value);
  };

  // Función para obtener el valor de un campo
  const getFieldValue = (fieldName: string) => {
    const formData = watch();
    if (arrayPath) {
      return formData[arrayPath]?.[index]?.[fieldName];
    }
    return formData[fieldName];
  };

  // Datos del formulario
  const formData = watch();

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
    const departamento = getFieldValue("departamento");
    if (departamento) {
      console.log(`Selected department: "${departamento}"`);
      console.log(`Available locations:`, locations.length);

      const filteredMunicipalities = getMunicipalitiesByDepartment(
        locations,
        departamento
      );

      console.log(
        `Filtered municipalities: ${filteredMunicipalities.length}`,
        filteredMunicipalities
      );

      setMunicipalities(filteredMunicipalities);
      // Reinicia el municipio si no está en la lista filtrada
      const municipio = getFieldValue("municipio");
      if (!filteredMunicipalities.includes(municipio)) {
        console.log(
          `Current municipio "${municipio}" not found in filtered list, resetting`
        );
        setFieldValue("municipio", "");
      }
    } else {
      setMunicipalities([]);
      setFieldValue("municipio", "");
    }
  }, [watch, locations, setValue]);

  const handleTipoDocumentoChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFieldValue("tipo_documento", value);
    if (value === "SD") {
      setFieldValue("num_documento", "");
    }
  };

  const handleNacionalidadChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    if (value === "Otro") {
      setShowNacionalidadInput(true);
      setFieldValue("nacionalidad", nacionalidadPersonalizada || "");
    } else {
      setShowNacionalidadInput(false);
      setNacionalidadPersonalizada("");
      setFieldValue("nacionalidad", value);
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
    setFieldValue("direccion_residencia", direccionCompleta);
    setIsAddressPopoverOpen(false);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          variant="bordered"
          label="Tipo de documento"
          labelPlacement="outside"
          placeholder="Seleccione tipo de documento"
          selectedKeys={
            getFieldValue("tipo_documento") ? [getFieldValue("tipo_documento")] : []
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

        {getFieldValue("tipo_documento") !== "SD" && (
          <Input
            variant="bordered"
            label="Número de documento"
            labelPlacement="outside"
            placeholder="Ingrese número de documento"
            {...registerField("num_documento")}
            isRequired
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 gap-x-6 mt-6">
        <Input
          variant="bordered"
          label="Primer nombre"
          labelPlacement="outside"
          placeholder="Ingrese su primer nombre"
          {...registerField("primer_nombre")}
          isRequired
        />

        <Input
          variant="bordered"
          label="Segundo nombre"
          labelPlacement="outside"
          placeholder="Ingrese su segundo nombre"
          {...registerField("segundo_nombre")}
        />

        <Input
          variant="bordered"
          label="Primer apellido"
          labelPlacement="outside"
          placeholder="Ingrese su primer apellido"
          {...registerField("primer_apellido")}
          isRequired
        />

        <Input
          variant="bordered"
          label="Segundo apellido"
          labelPlacement="outside"
          placeholder="Ingrese su segundo apellido"
          {...registerField("segundo_apellido")}
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
                setFieldValue("fecha_nacimiento", formattedDate);
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
                setFieldValue("fecha_expedicion_documento", formattedDate);
              }
            }}
          />
        </I18nProvider>

        <Select
          variant="bordered"
          label="Sexo"
          labelPlacement="outside"
          placeholder="Seleccione su sexo"
          selectedKeys={getFieldValue("genero") ? [getFieldValue("genero")] : []}
          onChange={(e) => setFieldValue("genero", e.target.value)}
          isRequired
        >
          <SelectItem key="Hombre">Hombre</SelectItem>
          <SelectItem key="Mujer">Mujer</SelectItem>
          <SelectItem key="Intersexual">Intersexual</SelectItem>
          <SelectItem key="Prefiere no decirlo">Prefiere no decirlo</SelectItem>
          <SelectItem key="Otro">Otro</SelectItem>
        </Select>

        <NumberInput
          hideStepper
          variant="bordered"
          label="Número móvil"
          labelPlacement="outside"
          placeholder="Ingrese su número móvil"
          formatOptions={{ useGrouping: false }}
          value={getFieldValue("telefono_movil") ? Number(getFieldValue("telefono_movil")) : undefined}
          onValueChange={(value) => setFieldValue("telefono_movil", value.toString())}
          isRequired
        />

        <Input
          variant="bordered"
          label="Correo electrónico"
          labelPlacement="outside"
          placeholder="Ingrese su correo electrónico"
          {...registerField("email")}
        />

        <Select
          variant="bordered"
          label="Estado civil"
          labelPlacement="outside"
          placeholder="Seleccione su estado civil"
          selectedKeys={getFieldValue("estado_civil") ? [getFieldValue("estado_civil")] : []}
          onChange={(e) => setFieldValue("estado_civil", e.target.value)}
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
          selectedKeys={getFieldValue("escolaridad") ? [getFieldValue("escolaridad")] : []}
          onChange={(e) => setFieldValue("escolaridad", e.target.value)}
          isRequired
        >
          <SelectItem key="Ninguna">Ninguna</SelectItem>
          <SelectItem key="Preescolar">Preescolar</SelectItem>
          <SelectItem key="Primaria">Primaria (1.º a 5.º grado)</SelectItem>
          <SelectItem key="Secundaria">Secundaria (6.º a 9.º grado)</SelectItem>
          <SelectItem key="Media">Media (10.º a 11.º grado)</SelectItem>
          <SelectItem key="Técnica/Tecnológica">Técnica o tecnológica</SelectItem>
          <SelectItem key="Pregrado">Pregrado</SelectItem>
          <SelectItem key="Maestría">Maestría</SelectItem>
          <SelectItem key="Doctorado">Doctorado</SelectItem>
        </Select>

        <Input
          variant="bordered"
          label="Ocupación"
          labelPlacement="outside"
          placeholder="Ingrese su ocupación"
          {...registerField("ocupacion")}
        />

        <NumberInput
          hideStepper
          variant="bordered"
          label="Estrato"
          labelPlacement="outside"
          placeholder="Ingrese su estrato"
          formatOptions={{ useGrouping: false }}
          value={getFieldValue("estrato") ? Number(getFieldValue("estrato")) : undefined}
          onValueChange={(value) => setFieldValue("estrato", value.toString())}
          minValue={1}
          maxValue={6}
        />

        <Select
          variant="bordered"
          label="Departamento"
          labelPlacement="outside"
          placeholder="Seleccione su departamento"
          selectedKeys={getFieldValue("departamento") ? [getFieldValue("departamento")] : []}
          onChange={(e) => setFieldValue("departamento", e.target.value)}
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
          selectedKeys={getFieldValue("municipio") ? [getFieldValue("municipio")] : []}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0]?.toString() || "";

            // Guardar el nombre del municipio
            setFieldValue("municipio", selectedKey);

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
                setFieldValue("dane_municipio", daneMunicipio);
              }
            }
          }}
          isDisabled={!getFieldValue("departamento")}
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
          selectedKeys={getFieldValue("discapacidad") ? [getFieldValue("discapacidad")] : []}
          onChange={(e) => setFieldValue("discapacidad", e.target.value)}
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
          selectedKeys={getFieldValue("sabe_leer_escribir") ? [getFieldValue("sabe_leer_escribir")] : []}
          onChange={(e) => setFieldValue("sabe_leer_escribir", e.target.value)}
          isRequired
        >
          <SelectItem key="true">Sí</SelectItem>
          <SelectItem key="false">No</SelectItem>
        </Select>

        {/* Dirección de residencia con popover */}
        <div className="flex flex-col gap-1 justify-end">
          <p className="text-sm text-gray-500">
            {getFieldValue("direccion_residencia")
              ? getFieldValue("direccion_residencia")
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
                    <SelectItem key="Avenida carrera">Avenida carrera</SelectItem>
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
                    onValueChange={(value) => setNumeroCruce(value.toString())}
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
                    onValueChange={(value) => setNumeroPlaca(value.toString())}
                  />

                  <Input
                    label="Complemento"
                    placeholder="Complemento dirección (edificio, apartamento, etc.)"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                  />
                </div>
                <div className="mt-8">
                  <Button color="primary" fullWidth onPress={guardarDireccion}>
                    Guardar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
