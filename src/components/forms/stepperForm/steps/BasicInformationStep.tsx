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
    //fecha_nacimiento: Date;
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
      //fecha_nacimiento: Date;
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
  const [showNewCitizenForm, setShowNewCitizenForm] = useState(false);

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
    }
  };

  const handleCreateNewCitizen = () => {
    // Reset form data and show the new citizen form
    updateFormData({
      num_documento: "",
      tipo_documento: "",
      primer_nombre: "",
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      sexo: "",
      genero: "",
      orient_sexual: "",
      num_movil: "",
      num_fijo: "",
      email: "",
      nacionalidad: "",
      estado_civil: "",
      escolaridad: "",
      etnia: "",
      discapacidad: "",
      sabe_leer_escribir: "",
      citizen_id: "",
      is_existing_citizen: "false",
    });
    setShowNewCitizenForm(true);
  };

  const handleCancelNewCitizen = () => {
    // Hide the form and reset
    setShowNewCitizenForm(false);
    updateFormData({
      citizen_id: "",
      is_existing_citizen: "false",
    });
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
              <p className="text-sm text-gray-500 mt-1">Cargando ciudadanos...</p>
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
              value={formData.tipo_documento}
              onChange={(e) => updateFormData({ tipo_documento: e.target.value })}
              isRequired
            >
              <SelectItem key="CC">Cédula de ciudadanía</SelectItem>
              <SelectItem key="TI">Tarjeta de identidad</SelectItem>
              <SelectItem key="CE">Cédula de extranjería</SelectItem>
            </Select>

            <Input
              id="num_documento"
              name="num_documento"
              variant="bordered"
              label="Número de documento"
              labelPlacement="outside"
              value={formData.num_documento}
              onChange={(e) => updateFormData({ num_documento: e.target.value })}
              placeholder="Ingrese su número de documento"
              isRequired
            />

            <Input
              id="primer_nombre"
              name="primer_nombre"
              variant="bordered"
              label="Primer nombre"
              labelPlacement="outside"
              value={formData.primer_nombre}
              onChange={(e) => updateFormData({ primer_nombre: e.target.value })}
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
              onChange={(e) => updateFormData({ segundo_nombre: e.target.value })}
              placeholder="Ingrese su segundo nombre"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              id="primer_apellido"
              name="primer_apellido"
              variant="bordered"
              label="Primer apellido"
              labelPlacement="outside"
              value={formData.primer_apellido}
              onChange={(e) => updateFormData({ primer_apellido: e.target.value })}
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
              value={formData.sexo}
              onChange={(e) => updateFormData({ sexo: e.target.value })}
              isRequired
            >
              <SelectItem key="M">Masculino</SelectItem>
              <SelectItem key="F">Femenino</SelectItem>
              <SelectItem key="I">Intersexual</SelectItem>
            </Select>

            <Select
              id="genero"
              name="genero"
              variant="bordered"
              label="Género"
              labelPlacement="outside"
              placeholder="Seleccione su género"
              value={formData.genero}
              onChange={(e) => updateFormData({ genero: e.target.value })}
              isRequired
            >
              <SelectItem key="M">Masculino</SelectItem>
              <SelectItem key="F">Femenino</SelectItem>
              <SelectItem key="T">Transgénero</SelectItem>
              <SelectItem key="N">No binario</SelectItem>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              id="orient_sexual"
              name="orient_sexual"
              variant="bordered"
              label="Orientación sexual"
              labelPlacement="outside"
              placeholder="Seleccione su orientación sexual"
              value={formData.orient_sexual}
              onChange={(e) => updateFormData({ orient_sexual: e.target.value })}
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
              isRequired
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              id="nacionalidad"
              name="nacionalidad"
              variant="bordered"
              label="Nacionalidad"
              labelPlacement="outside"
              placeholder="Seleccione su nacionalidad"
              value={formData.nacionalidad}
              onChange={(e) => updateFormData({ nacionalidad: e.target.value })}
              isRequired
            >
              <SelectItem key="CO">Colombiana</SelectItem>
              <SelectItem key="VE">Venezolana</SelectItem>
              <SelectItem key="OT">Otra</SelectItem>
            </Select>

            <Select
              id="estado_civil"
              name="estado_civil"
              variant="bordered"
              label="Estado civil"
              labelPlacement="outside"
              placeholder="Seleccione su estado civil"
              value={formData.estado_civil}
              onChange={(e) => updateFormData({ estado_civil: e.target.value })}
              isRequired
            >
              <SelectItem key="SO">Soltero/a</SelectItem>
              <SelectItem key="CA">Casado/a</SelectItem>
              <SelectItem key="UL">Unión libre</SelectItem>
              <SelectItem key="DI">Divorciado/a</SelectItem>
              <SelectItem key="VI">Viudo/a</SelectItem>
            </Select>

            <Select
              id="escolaridad"
              name="escolaridad"
              variant="bordered"
              label="Escolaridad"
              labelPlacement="outside"
              placeholder="Seleccione su nivel de escolaridad"
              value={formData.escolaridad}
              onChange={(e) => updateFormData({ escolaridad: e.target.value })}
              isRequired
            >
              <SelectItem key="Ninguna">Ninguna</SelectItem>
              <SelectItem key="Preescolar">Preescolar</SelectItem>
              <SelectItem key="Primaria">Primaria (1.º a 5.º grado)</SelectItem>
              <SelectItem key="Secundaria">Secundaria (6.º a 9.º grado)</SelectItem>
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
              value={formData.etnia}
              onChange={(e) => updateFormData({ etnia: e.target.value })}
              isRequired
            >
              <SelectItem key="NI">Ninguna</SelectItem>
              <SelectItem key="IN">Indígena</SelectItem>
              <SelectItem key="AF">Afrocolombiano</SelectItem>
              <SelectItem key="PA">Palenquero</SelectItem>
              <SelectItem key="RA">Raizal</SelectItem>
              <SelectItem key="RO">Rom/Gitano</SelectItem>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              id="discapacidad"
              name="discapacidad"
              variant="bordered"
              label="¿Tiene alguna discapacidad?"
              labelPlacement="outside"
              placeholder="Seleccione una opción"
              value={formData.discapacidad}
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
              value={formData.sabe_leer_escribir}
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
