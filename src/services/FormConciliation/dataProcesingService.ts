import { get } from "@/utils/apiUtils";

interface DataProcessingResponse {
  titulo: string;
  contenido: string;
}

function getDataProcessing() {
  return get<DataProcessingResponse[]>("/tratamiento-datos");
}

const mockDataProcessing: DataProcessingResponse[] = [
  {
    titulo: "Autorización para el tratamiento de datos personales",
    contenido: "De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013, autorizo el tratamiento de mis datos personales para las finalidades y en los términos que me han sido informados."
  },
  {
    titulo: "Finalidad del tratamiento",
    contenido: "Sus datos serán utilizados para gestionar el proceso de conciliación, realizar estadísticas, mejorar nuestros servicios y cumplir con las obligaciones legales."
  },
  {
    titulo: "Derechos del titular",
    contenido: "Como titular de los datos personales, usted tiene derecho a conocer, actualizar y rectificar sus datos, solicitar prueba de la autorización, ser informado sobre el uso de sus datos, presentar quejas, revocar la autorización y acceder a sus datos."
  }
];

// Servicio mock para desarrollo sin backend
async function getDataProcessingMock(): Promise<DataProcessingResponse[]> {
  return new Promise((resolve) => 
    setTimeout(() => resolve(mockDataProcessing), 800)
  );
}

// Flag para alternar entre mock y real
const IS_MOCK = true;

export const dataProcessingService = {
  getDataProcessing: IS_MOCK ? getDataProcessingMock : getDataProcessing,
  getDataProcessingMock
};
