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
import { gradesService } from "@/services/gradesService";
import { CreateGradeParams, UpdateGradeParams } from "@/types/grades";

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

  // Función auxiliar para formatear valores de criterios
  function formatCriterioValue(value: string | undefined): string {
    if (!value) return "";
    
    // Si el valor es un string vacío o null, retornar vacío
    if (value === "" || value === "null") return "";
    
    const numValue = Number(value);
    if (isNaN(numValue)) return value;
    
    // Si está en formato 0-50, convertir a 0-5
    if (numValue > 5) {
      return (numValue / 10).toFixed(1);
    } else {
      // Asegurar que siempre tenga un decimal (para mantener consistencia)
      return numValue.toFixed(1);
    }
  }

  // Cargar valores existentes cuando el modal se abre y caseData cambia
  useEffect(() => {
    if (caseData && isOpen) {
      const newCriterios = [...criterios];
      let valuesLoaded = false;
      
      // Cargar criterios individuales si existen en el array de calificaciones
      if (caseData.calificaciones && caseData.calificaciones.length > 0) {
        const calificacion = caseData.calificaciones[0];
        
        if (calificacion.criterio_1) {
          newCriterios[0].valor = formatCriterioValue(calificacion.criterio_1.toString());
          valuesLoaded = true;
        }
        
        if (calificacion.criterio_2) {
          newCriterios[1].valor = formatCriterioValue(calificacion.criterio_2.toString());
          valuesLoaded = true;
        }
        
        if (calificacion.criterio_3) {
          newCriterios[2].valor = formatCriterioValue(calificacion.criterio_3.toString());
          valuesLoaded = true;
        }
        
        if (calificacion.criterio_4) {
          newCriterios[3].valor = formatCriterioValue(calificacion.criterio_4.toString());
          valuesLoaded = true;
        }
        
        if (valuesLoaded) {
          console.log("Cargando criterios existentes:", newCriterios);
          setCriterios(newCriterios);
        }
        
        // Si hay promedio, también lo cargamos
        if (calificacion.promedio) {
          const numCalificacion = Number(calificacion.promedio);
          if (!isNaN(numCalificacion)) {
            // Si está en formato 0-50, convertir a 0-5
            const finalValue = numCalificacion > 5 
              ? (numCalificacion / 10).toFixed(1)
              : numCalificacion.toFixed(1);
            console.log("Cargando calificación final:", finalValue);
            setCalificacionFinal(finalValue);
          }
        }
      }
    }
  }, [caseData, isOpen]);

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
      // Si el valor es válido, formatearlo correctamente
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
    
    // También validar que la calificación final exista y sea un número válido
    if (valido && !calificacionFinal) {
      setError("Error calculando la calificación final. Revise los criterios.");
      valido = false;
    }
    
    return valido;
  };

  const handleSubmit = async () => {
    if (!caseData) return;

    // Validar los criterios
    if (!validarCriterios()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Convertir los valores a números
      const criteriosNumericos = criterios.map(c => parseFloat(c.valor) || 0);
      
      // Encontrar el estudiante y docente asignados al caso
      const estudiante = caseData.usuarios?.find(user => user.rol === "Estudiante");
      const docente = caseData.usuarios?.find(user => user.rol === "Docente");
      
      if (!estudiante || !docente) {
        throw new Error("El caso debe tener asignado un estudiante y un docente para calificarlo");
      }
      
      // Verificar si ya existe una calificación para este caso
      const existingGrade = caseData.calificaciones && caseData.calificaciones.length > 0 ? caseData.calificaciones[0] : null;
      
      console.log('Calificación existente:', existingGrade);
      
      // Obtener el ID de la calificación, manejando posibles inconsistencias en el nombre del campo
      const gradeId = existingGrade && (
        // Intentar con ambas versiones del nombre del campo
        existingGrade.id_califiaciones_caso || 
        (existingGrade as any).id_calificaciones_caso
      );
      
      if (existingGrade && gradeId) {
        // Si ya existe una calificación, preparar datos para actualizar
        const updateData: UpdateGradeParams = {
          criterio_1: criteriosNumericos[0],
          criterio_2: criteriosNumericos[1],
          criterio_3: criteriosNumericos[2],
          criterio_4: criteriosNumericos[3],
          ganado: false // Valor por defecto para cumplir con el tipo
        };
        
        console.log('Actualizando calificación con ID:', gradeId);
        
        // Actualizar la calificación existente
        await gradesService.updateGrade(gradeId, updateData);
      } else {
        // Si no existe, crear una nueva calificación
        const createData: CreateGradeParams = {
          id_caso: caseData.id_caso,
          id_estudiante: estudiante.id_usuario,
          id_docente: docente.id_usuario,
          criterio_1: criteriosNumericos[0],
          criterio_2: criteriosNumericos[1],
          criterio_3: criteriosNumericos[2],
          criterio_4: criteriosNumericos[3]
        };
        
        await gradesService.createGrade(createData);
      }
      

      
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
    // Reset all form values
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

  function getCriterioLabel(index: number): string {
    switch (index) {
      case 0:
        return "Criterio 1: Análisis del caso";
      case 1:
        return "Criterio 2: Fundamentación jurídica";
      case 2:
        return "Criterio 3: Redacción y argumentación";
      case 3:
        return "Criterio 4: Cumplimiento de plazos";
      default:
        return `Criterio ${index + 1}`;
    }
  }

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
                  <span>{caseData?.tipo_caso?.nombre_tipo || "-"}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-4">
                Ingrese la calificación para cada criterio del estudiante asignado al caso{" "}
                <span className="font-semibold">
                  {caseData?.usuarios?.find(user => user.rol === "Estudiante") ? 
                    `${caseData.usuarios.find(user => user.rol === "Estudiante")?.primer_nombre} ${caseData.usuarios.find(user => user.rol === "Estudiante")?.primer_apellido}` : 
                    "Sin asignar"}
                </span>
              </p>
              
              {criterios.map((criterio, index) => (
                <div key={index} className="mb-4">
                  <Input
                    type="number"
                    label={`${getCriterioLabel(index)} (0-5)`}
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