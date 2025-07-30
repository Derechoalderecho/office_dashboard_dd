import { Button, Switch } from "@heroui/react";
import { useFormContext } from "react-hook-form";
import { PencilSquareIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Step2SubStep1Props {
  goToStep?: (stepIndex: number) => void;
  handleBackToInfo: () => void;
}

export default function Step2SubStep1({ goToStep, handleBackToInfo }: Step2SubStep1Props) {
  const { watch, setValue } = useFormContext();
  const formValues = watch();
  const datosConfirmados = watch("confirma_datos");
  
  // Manejar cambio en el switch de confirmación
  const handleConfirmationChange = (checked: boolean) => {
    setValue("confirma_datos", checked);
  };

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
          onClick={handleBackToInfo}
          startContent={<ArrowLeftIcon className="h-4 w-4" />}
        >
          Volver a información
        </Button>
      </div>
    </section>
  );
}