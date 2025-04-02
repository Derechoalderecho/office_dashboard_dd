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
} from "@heroui/react";
import { useState, useEffect, Key } from "react";
import { fetchAllCitizens } from "@/services/citizenService";
import { Citizen } from "@/types/citizens";
import { PlusIcon, XIcon } from "lucide-react";
import { I18nProvider } from "@react-aria/i18n";

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
    orient_sexual: string;
    fecha_nacimiento: string;
    num_movil: string;
    num_fijo: string;
    email: string;
    nacionalidad: string;
    estado_civil: string;
    escolaridad: string;
    etnia: string;
    discapacidad: string;
    sabe_leer_escribir: string;
    citizen_id: string;
    is_existing_citizen: string;
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
      orient_sexual: string;
      fecha_nacimiento: string;
      num_movil: string;
      num_fijo: string;
      email: string;
      nacionalidad: string;
      estado_civil: string;
      escolaridad: string;
      etnia: string;
      discapacidad: string;
      sabe_leer_escribir: string;
      citizen_id: string;
      is_existing_citizen: string;
    }>
  ) => void;
};

export default function BasicInformationStep({
  formData,
  updateFormData,
}: BasicInformationProps) {
  const [fechaNacimiento, setFechaNacimiento] = useState<DateValue | null>(
    null
  );
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewCitizenForm, setShowNewCitizenForm] = useState<boolean>(
    Boolean(
      formData.is_existing_citizen === "false" ||
        (formData.primer_nombre && formData.primer_apellido)
    )
  );
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
      // Si es "Sin documento", limpiamos el número de documento
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

  // Handle citizen selection and auto-populate form fields
  const handleCitizenSelect = (selectedKey: Key | null) => {
    const selectedId = selectedKey?.toString();

    if (!selectedId) {
      // No citizen selected, reset form
      updateFormData({
        is_existing_citizen: "false",
        citizen_id: "",
      });
      setShowNewCitizenForm(true);
      return;
    }

    // Find the citizen by ID
    const citizen = citizens.find(
      (c) => c.id_ciudadano.toString() === selectedId
    );

    if (citizen) {
      // Update form data with citizen information
      updateFormData({
        num_documento: citizen.num_documento || "",
        tipo_documento: citizen.tipo_documento || "",
        primer_nombre: citizen.primer_nombre || "",
        segundo_nombre: citizen.segundo_nombre || "",
        primer_apellido: citizen.primer_apellido || "",
        segundo_apellido: citizen.segundo_apellido || "",
        email: citizen.email || "",
        num_movil: citizen.num_movil || "",
        num_fijo: citizen.num_fijo || "",
        citizen_id: selectedId,
        is_existing_citizen: "true",
      });
      setShowNewCitizenForm(false);
    }
  };

  const handleCreateNewCitizen = () => {
    setShowNewCitizenForm(true);
  };

  const handleCancelNewCitizen = () => {
    setShowNewCitizenForm(false);
  };

  return (
    <div className="space-y-8">
      {!showNewCitizenForm ? (
        <div className="flex flex-col">
          <div className="flex-grow mb-4">
            <Autocomplete
              id="citizen_id"
              name="citizen_id"
              variant="bordered"
              label="Seleccionar ciudadano existente"
              labelPlacement="outside"
              placeholder="Seleccione o escriba el nombre del ciudadano o su cédula"
              value={formData.citizen_id}
              onSelectionChange={handleCitizenSelect}
              disabled={isLoading}
              className="w-full"
            >
              {citizens.map((citizen) => (
                <AutocompleteItem key={citizen.id_ciudadano.toString()}>
                  {`${citizen.primer_nombre} ${citizen.primer_apellido} - ${citizen.num_documento}`}
                </AutocompleteItem>
              ))}
            </Autocomplete>
            {isLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Cargando ciudadanos...
              </p>
            )}
          </div>
          <Button
            color="primary"
            startContent={<PlusIcon size={16} />}
            onClick={handleCreateNewCitizen}
          >
            Crear nuevo ciudadano
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Crear nuevo ciudadano</h3>
            <Button
              variant="light"
              color="danger"
              startContent={<XIcon size={16} />}
              onClick={handleCancelNewCitizen}
            >
              Cancelar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              id="tipo_documento"
              name="tipo_documento"
              variant="bordered"
              label="Tipo de documento"
              labelPlacement="outside"
              placeholder="Seleccione su tipo de documento"
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
                onChange={(e) =>
                  updateFormData({ num_documento: e.target.value })
                }
                placeholder="Ingrese su número de documento"
                isRequired
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
              <SelectItem key="M">Masculino</SelectItem>
              <SelectItem key="F">Femenino</SelectItem>
              <SelectItem key="T">Transgénero</SelectItem>
              <SelectItem key="N">No binario</SelectItem>
            </Select>

            <Select
              id="orient_sexual"
              name="orient_sexual"
              variant="bordered"
              label="Orientación sexual"
              labelPlacement="outside"
              placeholder="Seleccione su orientación sexual"
              selectedKeys={
                formData.orient_sexual ? [formData.orient_sexual] : []
              }
              onChange={(e) =>
                updateFormData({ orient_sexual: e.target.value })
              }
              isRequired
            >
              <SelectItem key="HE">Heterosexual</SelectItem>
              <SelectItem key="HO">Homosexual</SelectItem>
              <SelectItem key="BI">Bisexual</SelectItem>
              <SelectItem key="AS">Asexual</SelectItem>
              <SelectItem key="PA">Pansexual</SelectItem>
            </Select>

            <Input
              id="num_movil"
              name="num_movil"
              variant="bordered"
              label="Número móvil"
              labelPlacement="outside"
              value={formData.num_movil}
              onChange={(e) => updateFormData({ num_movil: e.target.value })}
              placeholder="Ingrese su número móvil"
              isRequired
            />

            <Input
              id="num_fijo"
              name="num_fijo"
              variant="bordered"
              label="Número fijo"
              labelPlacement="outside"
              value={formData.num_fijo}
              onChange={(e) => updateFormData({ num_fijo: e.target.value })}
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
              <SelectItem key="República Dominicana">República Dominicana</SelectItem>
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
              <SelectItem key="SI">Sí</SelectItem>
              <SelectItem key="NO">No</SelectItem>
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
              <SelectItem key="SI">Sí</SelectItem>
              <SelectItem key="NO">No</SelectItem>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
