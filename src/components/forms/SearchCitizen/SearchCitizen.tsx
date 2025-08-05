"use client";

import { useState } from "react";
import {
  Input,
  Select,
  SelectItem,
  Button,
} from "@heroui/react";
import {
  findCitizenByDocument,
} from "@/services/citizenService";
import { Citizen } from "@/types/citizens";
import {
  XIcon,
  SearchIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react";

interface SearchCitizenProps {
  onCitizenFound: (citizen: Citizen) => void;
  onCitizenNotFound: () => void;
  onShowForm: () => void;
  tipoDocumento?: string;
  numDocumento?: string;
  onTipoDocumentoChange?: (tipo: string) => void;
  onNumDocumentoChange?: (numero: string) => void;
}

export default function SearchCitizen({
  onCitizenFound,
  onCitizenNotFound,
  onShowForm,
  tipoDocumento = "",
  numDocumento = "",
  onTipoDocumentoChange,
  onNumDocumentoChange,
}: SearchCitizenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "info" | "warning" | "error";
    message: string;
  } | null>(null);

  const handleTipoDocumentoChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    onTipoDocumentoChange?.(value);
    if (value === "SD") {
      onNumDocumentoChange?.("");
    }
  };

  const handleNumDocumentoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    onNumDocumentoChange?.(value);
  };

  // Función para buscar ciudadano existente
  const searchCitizen = async () => {
    if (!tipoDocumento || (!numDocumento && tipoDocumento !== "SD")) {
      setNotification({
        type: "warning",
        message: "Por favor ingrese el tipo y número de documento",
      });
      return;
    }

    setIsLoading(true);
    try {
      const citizen = await findCitizenByDocument(
        tipoDocumento,
        numDocumento
      );

      if (citizen) {
        // Ciudadano encontrado
        onCitizenFound(citizen);
        setNotification({
          type: "success",
          message:
            "Ciudadano existente encontrado. Los campos han sido rellenados automáticamente.",
        });
      } else {
        // Ciudadano no encontrado
        onCitizenNotFound();
        setNotification({
          type: "info",
          message:
            "No se encontró ciudadano con este documento. Por favor ingrese la información para crear uno nuevo.",
        });
      }

      // Mostrar el formulario completo después de la búsqueda
      onShowForm();
    } catch (error) {
      console.error("Error searching for citizen:", error);
      setNotification({
        type: "error",
        message: "Error al buscar ciudadano. Por favor intente nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Campos de documento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          variant="bordered"
          label="Tipo de documento"
          labelPlacement="outside"
          placeholder="Seleccione tipo de documento"
          selectedKeys={tipoDocumento ? [tipoDocumento] : []}
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

        {tipoDocumento !== "SD" && (
          <Input
            variant="bordered"
            label="Número de documento"
            labelPlacement="outside"
            placeholder="Ingrese número de documento"
            value={numDocumento}
            onChange={handleNumDocumentoChange}
            isRequired
          />
        )}
      </div>

      {/* Botón de búsqueda */}
      <div className="flex justify-center">
        <Button
          color="primary"
          variant="bordered"
          startContent={<SearchIcon className="h-4 w-4" />}
          onPress={searchCitizen}
          isLoading={isLoading}
          isDisabled={!tipoDocumento || (!numDocumento && tipoDocumento !== "SD")}
        >
          {isLoading ? "Buscando..." : "Buscar ciudadano"}
        </Button>
      </div>

      {/* Notificación */}
      {notification && (
        <div className={`p-4 rounded-lg border ${
          notification.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
          notification.type === "warning" ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
          notification.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
          "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === "success" && <CheckCircleIcon className="h-5 w-5" />}
            {notification.type === "warning" && <AlertCircleIcon className="h-5 w-5" />}
            {notification.type === "error" && <XIcon className="h-5 w-5" />}
            {notification.type === "info" && <AlertCircleIcon className="h-5 w-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
            <Button
              variant="light"
              size="sm"
              isIconOnly
              onPress={() => setNotification(null)}
              className="ml-auto"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
