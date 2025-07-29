import { dataProcessingService } from "@/services/FormConciliation/dataProcesingService";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import Step2SubStep0 from "./subSteps/Step2SubStep0";
import Step2SubStep1 from "./subSteps/Step2SubStep1";

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

  // Estado para controlar el sub-paso
  const subStep = watch("step2SubStep") || 0;
  
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

  // Volver al sub-paso anterior
  const handleBackToInfo = () => {
    setValue("step2SubStep", 0);
  };

  // Renderizar el sub-paso correspondiente
  if (subStep === 1) {
    return <Step2SubStep1 goToStep={goToStep} handleBackToInfo={handleBackToInfo} />;
  }

  // Por defecto, mostrar el sub-paso 0
  return <Step2SubStep0 isLoading={isLoading} dataProcessing={dataProcessing} />;
}