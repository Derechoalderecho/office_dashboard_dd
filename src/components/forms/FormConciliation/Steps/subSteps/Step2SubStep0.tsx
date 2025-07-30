import { Spinner } from "@heroui/react";

interface Step2SubStep0Props {
  isLoading: boolean;
  dataProcessing: Array<{ titulo: string; contenido: string }>;
}

export default function Step2SubStep0({ isLoading, dataProcessing }: Step2SubStep0Props) {
  if (isLoading && dataProcessing.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Tratamiento de datos personales</h2>

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
