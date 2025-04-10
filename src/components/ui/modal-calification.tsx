"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
} from "@heroui/react";
import { CaseWithKey } from "@/types/cases";
import { updateCaseCalification } from "@/services/caseService";

interface ModalCalificationProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseWithKey | null;
  onSuccess?: () => void;
}

interface Criterio {
  valor: string;
  error: string;
}

export function ModalCalification({
  isOpen,
  onClose,
  caseData,
  onSuccess,
}: ModalCalificationProps) {
  const [criterios, setCriterios] = useState<Criterio[]>([
    { valor: "", error: "" },
    { valor: "", error: "" },
    { valor: "", error: "" },
    { valor: "", error: "" },
  ]);
  const [calificacionFinal, setCalificacionFinal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Calcular el promedio cada vez que cambien los criterios
    const valores = criterios.map(c => parseFloat(c.valor) || 0);
    const suma = valores.reduce((acc, val) => acc + val, 0);
    const promedio = suma / 4;
    
    if (valores.every(v => v > 0)) {
      setCalificacionFinal(promedio.toFixed(1));
    } else {
      setCalificacionFinal("");
    }
  }, [criterios]);

  const handleCriterioChange = (value: string, index: number) => {
    // Solo permitir números entre 0 y 5
    const newCriterios = [...criterios];
    
    if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 5)) {
      newCriterios[index] = { 
        valor: value, 
        error: "" 
      };
    } else {
      newCriterios[index] = { 
        valor: criterios[index].valor, 
        error: "La calificación debe ser un número entre 0 y 5" 
      };
    }
    
    setCriterios(newCriterios);
    setError("");
  };

  const validarCriterios = () => {
    let valido = true;
    const newCriterios = [...criterios];
    
    criterios.forEach((criterio, index) => {
      if (!criterio.valor) {
        newCriterios[index].error = "Debe ingresar una calificación";
        valido = false;
      } else {
        const valor = parseFloat(criterio.valor);
        if (isNaN(valor) || valor < 0 || valor > 5) {
          newCriterios[index].error = "La calificación debe ser un número entre 0 y 5";
          valido = false;
        }
      }
    });
    
    setCriterios(newCriterios);
    return valido;
  };

  const handleSubmit = async () => {
    if (!caseData) return;
    
    if (!validarCriterios() || !calificacionFinal) {
      setError("Por favor complete todos los criterios correctamente");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCaseCalification(caseData.id_caso, calificacionFinal);
      setIsSubmitting(false);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error al guardar la calificación:", err);
      setError("Ocurrió un error al guardar la calificación");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCriterios([
      { valor: "", error: "" },
      { valor: "", error: "" },
      { valor: "", error: "" },
      { valor: "", error: "" },
    ]);
    setCalificacionFinal("");
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Calificar estudiante
            </ModalHeader>
            <ModalBody>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">ID del caso:</span>
                  <span className="text-blue-600 font-bold">{caseData?.id_caso || "-"}</span>
                </div>
                <div className="mt-1">
                  <span className="font-semibold mr-2">Tipo de proceso:</span>
                  <span>{caseData?.tipo_proceso || "-"}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Ingrese la calificación para cada criterio del estudiante asignado al caso{" "}
                <span className="font-semibold">
                  {caseData?.estudiante_asignado || "Sin asignar"}
                </span>
              </p>
              
              {criterios.map((criterio, index) => (
                <div key={index} className="mb-4">
                  <Input
                    type="number"
                    label={`Criterio ${index + 1} (0-5)`}
                    placeholder="Ej: 4.5"
                    value={criterio.valor}
                    onValueChange={(value) => handleCriterioChange(value, index)}
                    min={0}
                    max={5}
                    step={0.1}
                    isInvalid={!!criterio.error}
                    errorMessage={criterio.error}
                  />
                </div>
              ))}
              
              <div className="mt-6 border-t pt-4">
                <p className="text-sm font-semibold mb-2">
                  Calificación Final (25% cada criterio): {calificacionFinal || "-"}
                </p>
              </div>
              
              {error && (
                <p className="text-danger text-sm mt-2">{error}</p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={handleClose}
                isDisabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isSubmitting}
                isDisabled={!calificacionFinal || !!error}
              >
                Guardar calificación
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
} 