import { Button, Spinner, Switch } from "@heroui/react";
import { dataProcessingService } from "@/services/FormConciliation/dataProcesingService";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { PencilSquareIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Step2DataProcessingProps {
  goToStep?: (stepIndex: number) => void;
}

export default function Step2DataProcessing({
  goToStep,
}: Step2DataProcessingProps) {
  const { watch, setValue } = useFormContext();
  const [isLoading, setIsLoading] = useState(false);
  const [dataProcessing, setDataProcessing] = useState<
    Array<{ titulo: string; contenido: string }>
  >([]);

  const formValues = watch();

  // Estado para controlar el sub-paso
  const subStep = watch("step2SubStep") || 0;
  const datosConfirmados = watch("confirma_datos");

  // Cargar datos de tratamiento al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await dataProcessingService.getDataProcessing();
        setDataProcessing(data);
      } catch (error) {
        console.error("Error al cargar datos de tratamiento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Manejar cambio en el switch de confirmación para solo pasar true o false
  const handleConfirmationChange = (checked: boolean) => {
    setValue("confirma_datos", checked);
  };

  // Volver al sub-paso anterior
  const handleBackToInfo = () => {
    setValue("step2SubStep", 0);
  };

  if (isLoading && dataProcessing.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (subStep === 1) {
    return (
      <section className="flex flex-col space-y-10">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium">
            Autorización tratamiento de datos
          </h2>
          <Button
            onPress={() => goToStep && goToStep(0)}
            size="sm"
            variant="bordered"
            radius="full"
            startContent={<PencilSquareIcon className="h-4 w-4" />}
          >
            Editar datos
          </Button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center">
            <span className="font-medium w-[400px]">Nombre completo</span>
            <span className="text-gray-500">
              {formValues.ciudadano_solicitante.primer_nombre +
                " " +
                formValues.ciudadano_solicitante.primer_apellido ||
                "No especificado"}
            </span>
          </div>

          <div className="flex items-center">
            <span className="font-medium w-[400px]">Número de documento</span>
            <span className="text-gray-500">
              {formValues.ciudadano_solicitante.num_documento ||
                "No especificado"}
            </span>
          </div>

          <div className="flex items-center">
            <span className="font-medium w-[400px]">Correo electrónico</span>
            <span className="text-gray-500">
              {formValues.ciudadano_solicitante.email || "No especificado"}
            </span>
          </div>

          <div className="flex items-center">
            <span className="font-medium w-[400px]">Teléfono celular</span>
            <span className="text-gray-500">
              {formValues.ciudadano_solicitante.num_movil || "No especificado"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <span className="font-medium text-gray-700">¿Los datos son correctos?</span>
          <Switch
            defaultChecked={!!datosConfirmados}
            onChange={(e) => handleConfirmationChange(e.target.checked)}
          />
        </div>

        {!datosConfirmados && (
          <p className="text-amber-600 text-sm mt-4">
            Debe confirmar que los datos son correctos para continuar al
            siguiente paso.
          </p>
        )}

        <div className="flex justify-start mt-6">
          <Button
            variant="bordered"
            size="sm"
            onPress={handleBackToInfo}
            startContent={<ArrowLeftIcon className="h-4 w-4" />}
          >
            Volver a información
          </Button>
        </div>
      </section>
    );
  }

  // Vista de información de tratamiento de datos (sub-paso 0)
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Tratamiento de datos personales</h2>

      {/* Información de tratamiento de datos */}
      {dataProcessing.map((item, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2">{item.titulo}</h3>
          <p className="text-sm text-gray-600">{item.contenido}</p>
        </div>
      ))}
    </div>
  );
}
