"use client";

import { useState } from "react";
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

export function ModalCalification({
  isOpen,
  onClose,
  caseData,
  onSuccess,
}: ModalCalificationProps) {
  const [calification, setCalification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCalificationChange = (value: string) => {
    // Only allow numbers between 0 and 5
    if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 5)) {
      setCalification(value);
      setError("");
    } else {
      setError("La calificación debe ser un número entre 0 y 5");
    }
  };

  const handleSubmit = async () => {
    if (!caseData) return;
    
    if (!calification) {
      setError("Debe ingresar una calificación");
      return;
    }

    const calificationNumber = parseFloat(calification);
    if (isNaN(calificationNumber) || calificationNumber < 0 || calificationNumber > 5) {
      setError("La calificación debe ser un número entre 0 y 5");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCaseCalification(caseData.id_caso, calificationNumber.toString());
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
    setCalification("");
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
              <p className="text-sm text-gray-500 mb-4">
                Ingrese la calificación para el estudiante asignado al caso{" "}
                <span className="font-semibold">
                  {caseData?.tipo_proceso}
                </span>
              </p>
              <Input
                type="number"
                label="Calificación (0-5)"
                placeholder="Ej: 4.5"
                value={calification}
                onValueChange={handleCalificationChange}
                min={0}
                max={5}
                step={0.1}
                isInvalid={!!error}
                errorMessage={error}
              />
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
                isDisabled={!calification || !!error}
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