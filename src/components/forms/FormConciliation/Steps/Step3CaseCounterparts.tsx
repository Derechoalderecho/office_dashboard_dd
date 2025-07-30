import { useFormContext } from "react-hook-form";
import { Button, Tabs, Tab } from "@heroui/react";
import { useState } from "react";
import FieldsCitizen from "../components/FieldsCitizen";
import { UserPlusIcon } from "@heroicons/react/24/outline";

export default function Step3CaseCounterparts() {
  const { setValue, watch } = useFormContext();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Observar el array de ciudadanos citados
  const ciudadanosCitados = watch("ciudadano_citado") || [];

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
      fecha_expedicion_documento: "",
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

  const eliminarCiudadano = (index: number) => {
    if (ciudadanosCitados.length <= 1) {
      return;
    }

    const ciudadanos = [...ciudadanosCitados];
    ciudadanos.splice(index, 1);
    setValue("ciudadano_citado", ciudadanos);

    if (currentIndex >= ciudadanos.length) {
      setCurrentIndex(ciudadanos.length - 1);
    }
  };

  // Función para obtener el nombre del ciudadano para mostrar en el tab
  const getNombreCiudadano = (index: number) => {
    const ciudadano = ciudadanosCitados[index];
    if (!ciudadano) return `Ciudadano ${index + 1}`;

    const nombre = ciudadano.primer_nombre || "";
    const apellido = ciudadano.primer_apellido || "";

    if (nombre || apellido) {
      return `${nombre} ${apellido}`.trim();
    }

    return `Ciudadano ${index + 1}`;
  };

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-blue-500">Datos de la persona citada</h2>
        <Button variant="bordered" color="primary" onPress={agregarCiudadano} startContent={<UserPlusIcon className="w-6 h-6" />}>
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
    </section>
  );
}
