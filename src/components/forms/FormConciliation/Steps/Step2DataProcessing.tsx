import { Spinner } from "@heroui/react"
import { dataProcessingService } from "@/services/FormConciliation/dataProcesingService"
import { useEffect, useState } from "react"

export default function Step2DataProcessing() {
  const [isLoading, setIsLoading] = useState(false);
  const [dataProcessing, setDataProcessing] = useState<Array<{titulo: string, contenido: string}>>([]);
  
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
  
  if (isLoading && dataProcessing.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
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
  )
}
