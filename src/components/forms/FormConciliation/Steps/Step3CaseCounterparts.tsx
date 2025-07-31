import { useFormContext } from "react-hook-form";
import {
  Button,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Divider,
  Switch,
} from "@heroui/react";
import { useState } from "react";
import FieldsCitizen from "../components/FieldsCitizen";
import { UserPlusIcon } from "@heroicons/react/24/outline";

export default function Step3CaseCounterparts() {
  const { setValue, watch, register } = useFormContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [beneficiarioIndex, setBeneficiarioIndex] = useState(0);

  // Observar el array de ciudadanos citados
  const ciudadanosCitados = watch("ciudadano_citado") || [];
  
  // Observar el array de personas beneficiarias
  const personasBeneficiarias = watch("ciudadano_beneficiado") || [];

  // Función para agregar un nuevo ciudadano citado
  const agregarCiudadano = () => {
    const ciudadanos = [...ciudadanosCitados];
    ciudadanos.push({
      tipo_documento: "",
      num_documento: "",
      primer_nombre: "",
      segundo_nombre: "",
      primer_apellido: "",
      segundo_apellido: "",
      fecha_nacimiento: "",
      fecha_expedicion: "",
      sexo: "",
      genero: "",
      orientacion_sexual: "",
      num_movil: "",
      telefono_fijo: "",
      email: "",
      nacionalidad: "",
      estado_civil: "",
      escolaridad: "",
      ocupacion: "",
      etnia: "",
      estrato: "",
      zona_residencia: "",
      departamento: "",
      municipio: "",
      dane_municipio: "",
      discapacidad: "",
      sabe_leer_escribir: "",
      direccion_residencia: "",
    });
    setValue("ciudadano_citado", ciudadanos);
    setCurrentIndex(ciudadanos.length - 1);
  };

  // Función para eliminar un ciudadano citado
  const eliminarCiudadano = (index: number) => {
    const ciudadanos = [...ciudadanosCitados];
    ciudadanos.splice(index, 1);
    setValue("ciudadano_citado", ciudadanos);

    // Ajustar el índice actual si es necesario
    if (index <= currentIndex && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Función para obtener el nombre del ciudadano para mostrar en la pestaña
  const getNombreCiudadano = (index: number) => {
    const ciudadano = ciudadanosCitados[index] || {};
    const nombre = ciudadano.primer_nombre || "";
    const apellido = ciudadano.primer_apellido || "";

    if (nombre || apellido) {
      return `${nombre} ${apellido}`.trim();
    }

    return `Ciudadano ${index + 1}`;
  };

  // Función para eliminar una persona beneficiaria
  const eliminarBeneficiario = (index: number) => {
    const beneficiarios = [...personasBeneficiarias];
    beneficiarios.splice(index, 1);
    setValue("ciudadano_beneficiado", beneficiarios);

    // Ajustar el índice actual si es necesario
    if (index <= beneficiarioIndex && beneficiarioIndex > 0) {
      setBeneficiarioIndex(beneficiarioIndex - 1);
    }
  };

  // Función para obtener el nombre del beneficiario para mostrar en la pestaña
  const getNombreBeneficiario = (index: number) => {
    const beneficiario = personasBeneficiarias[index] || {};
    const nombre = beneficiario.primer_nombre || "";
    const apellido = beneficiario.primer_apellido || "";

    if (nombre || apellido) {
      return `${nombre} ${apellido}`.trim();
    }

    return `Beneficiario ${index + 1}`;
  };

  return (
    <section className="flex flex-col gap-y-6">
      <Select
        label="Tipo de proceso"
        placeholder="Seleccione el tipo de proceso"
        variant="bordered"
        labelPlacement="outside"
        className="max-w-md"
        {...register("tipo_proceso")}
        selectedKeys={watch("tipo_proceso") ? [watch("tipo_proceso")] : []}
        onChange={(e) => setValue("tipo_proceso", e.target.value)}
        isRequired
      >
        <SelectItem key="Solicitud de conciliación">
          Solicitud de conciliación
        </SelectItem>
        <SelectItem key="Otros">Otro</SelectItem>
      </Select>

      <h6 className="text-lg font-medium py-4">
        Crear solicitud de conciliación
      </h6>

      <Select
        label="Área o materia del caso"
        placeholder="Seleccione el área o materia del caso"
        variant="bordered"
        labelPlacement="outside"
        className="max-w-md"
        {...register("materia_del_caso")}
        selectedKeys={
          watch("materia_del_caso") ? [watch("materia_del_caso")] : []
        }
        onChange={(e) => setValue("materia_del_caso", e.target.value)}
        isRequired
      >
        <SelectItem key="Familiar">Familiar</SelectItem>
      </Select>
      <div className="flex justify-between items-center">
        <h2 className="font-medium text-blue-500">
          Datos de la persona citada
        </h2>
        <Button
          variant="bordered"
          color="primary"
          onPress={agregarCiudadano}
          startContent={<UserPlusIcon className="w-6 h-6" />}
        >
          Agregar otra persona citada
        </Button>
      </div>

      {ciudadanosCitados.length > 0 && (
        <div>
          <Tabs
            selectedKey={currentIndex.toString()}
            onSelectionChange={(key) =>
              setCurrentIndex(parseInt(key.toString()))
            }
          >
            {ciudadanosCitados.map((_: any, index: number) => (
              <Tab key={index.toString()} title={getNombreCiudadano(index)}>
                <div>
                  <div className="flex justify-end mb-4">
                    {ciudadanosCitados.length > 1 && (
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => eliminarCiudadano(index)}
                      >
                        Eliminar ciudadano
                      </Button>
                    )}
                  </div>
                  <FieldsCitizen arrayPath="ciudadano_citado" index={index} />
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
      )}
      <Divider />

      <div className="flex items-center gap-3">
        <p> ¿Existen personas beneficiarias distintas del solicitante?</p>
        <Switch
          checked={watch("existen_ciudadano_beneficiado")}
          onChange={(e) => setValue("existen_ciudadano_beneficiado", e.target.checked)}
        />
      </div>

      {watch("existen_ciudadano_beneficiado") && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-blue-500">
              Datos de la persona beneficiaria
            </h2>
            <Button
              variant="bordered"
              color="primary"
              onPress={() => {
                const beneficiarios = [...(watch("ciudadano_beneficiado") || [])];
                beneficiarios.push({
                  tipo_documento: "",
                  num_documento: "",
                  primer_nombre: "",
                  segundo_nombre: "",
                  primer_apellido: "",
                  segundo_apellido: "",
                  fecha_nacimiento: "",
                  sexo: "",
                  genero: "",
                  orientacion_sexual: "",
                  telefono_movil: "",
                  telefono_fijo: "",
                  email: "",
                  nacionalidad: "Colombiana",
                  estado_civil: "",
                  escolaridad: "",
                  ocupacion: "",
                  etnia: "",
                  estrato: "",
                  zona_residencia: "",
                  departamento: "",
                  municipio: "",
                  dane_municipio: "",
                  discapacidad: "",
                  sabe_leer_escribir: "",
                  direccion_residencia: "",
                });
                setValue("ciudadano_beneficiado", beneficiarios);
                setBeneficiarioIndex(beneficiarios.length - 1);
              }}
              startContent={<UserPlusIcon className="w-6 h-6" />}
            >
              Agregar otra persona beneficiaria
            </Button>
          </div>

          {watch("ciudadano_beneficiado")?.length > 0 && (
            <div>
              <Tabs
                selectedKey={beneficiarioIndex.toString()}
                onSelectionChange={(key) =>
                  setBeneficiarioIndex(parseInt(key.toString()))
                }
              >
                {watch("ciudadano_beneficiado").map((_: any, index: number) => (
                  <Tab key={index.toString()} title={getNombreBeneficiario(index)}>
                    <div>
                      <div className="flex justify-end mb-4">
                        {watch("ciudadano_beneficiado").length > 1 && (
                          <Button
                            color="danger"
                            variant="light"
                            onPress={() => eliminarBeneficiario(index)}
                          >
                            Eliminar
                          </Button>
                        )}
                      </div>
                      <FieldsCitizen
                        arrayPath="ciudadano_beneficiado"
                        index={index}
                      />
                    </div>
                  </Tab>
                ))}
              </Tabs>
            </div>
          )}
        </>
      )}
    </section>
  );
}
