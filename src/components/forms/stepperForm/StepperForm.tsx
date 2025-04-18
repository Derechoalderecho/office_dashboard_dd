"use client";

import type React from "react";

import { useState } from "react";
import { ArrowLeftIcon, Check, ChevronRight, Link } from "lucide-react";
import { CheckIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button, Divider, addToast } from "@heroui/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

import BasicInformationStep from "./steps/BasicInformationStep";
import GeneralInformationStep from "./steps/GeneralInformationStep";
import AdministrationStep from "./steps/AdministrationStep";
import ReviewStep from "./steps/ReviewStep";
import { submitFormData } from "@/actions/citizenActions";
import { useRouter } from "next/navigation";

export default function StepperForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isExistingCitizen, setIsExistingCitizen] = useState(false);
  const [selectedCitizenId, setSelectedCitizenId] = useState<number | null>(
    null
  );
  const [formData, setFormData] = useState({
    // Citizen information
    num_documento: "",
    tipo_documento: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    sexo: "",
    genero: "",
    orient_sexual: "",
    fecha_nacimiento: "",
    num_movil: "",
    num_fijo: "",
    email: "",
    nacionalidad: "",
    estado_civil: "",
    escolaridad: "",
    etnia: "",
    discapacidad: "",
    sabe_leer_escribir: "",
    direccion: "",
    estrato: "",
    zona: "",
    departamento: "",
    municipio: "",

    // Case information
    notas: "",
    tipo_proceso: "",
    tiempo_respuesta: "48",
    hechos: "",
    pretensiones: "",
    fundamentos: "",
    entidad: "",

    // Administration information
    persona_modifica: "",
    profesor_id: "",
    monitor_id: "",
    alumno_id: "",

    // Other required fields
    dane_municipio: "05001",

    // For tracking citizen selection
    citizen_id: "",
    is_existing_citizen: "false",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const steps = [
    { title: "Información básica", component: BasicInformationStep },
    { title: "Información general", component: GeneralInformationStep },
    { title: "Información administrativa", component: AdministrationStep },
    { title: "Revisión", component: ReviewStep },
  ];

  const updateFormData = (data: Partial<typeof formData>) => {
    // Check if we're updating citizen_id
    if (data.citizen_id) {
      setIsExistingCitizen(true);
      setSelectedCitizenId(Number(data.citizen_id));
      data.is_existing_citizen = "true";
    } else if (data.is_existing_citizen === "false") {
      setIsExistingCitizen(false);
      setSelectedCitizenId(null);
    }

    setFormData((prev) => ({ ...prev, ...data }));
  };

  // Validation rules for each step
  const stepValidations = {
    0: (data: typeof formData) => {
      const errors: { [key: string]: string } = {};
      
      // Skip validation if using existing citizen
      if (data.is_existing_citizen === "true") {
        if (!data.citizen_id) {
          errors.citizen_id = "Debe seleccionar un ciudadano existente";
        }
        return errors;
      }

      // Basic Information validation
      if (!data.tipo_documento) errors.tipo_documento = "El tipo de documento es requerido";
      if (!data.num_documento) errors.num_documento = "El número de documento es requerido";
      if (!data.primer_nombre) errors.primer_nombre = "El primer nombre es requerido";
      if (!data.primer_apellido) errors.primer_apellido = "El primer apellido es requerido";
      if (!data.sexo) errors.sexo = "El sexo es requerido";
      if (!data.genero) errors.genero = "El género es requerido";
      if (!data.orient_sexual) errors.orient_sexual = "La orientación sexual es requerida";
      if (!data.num_movil) errors.num_movil = "El número móvil es requerido";
      if (!data.nacionalidad) errors.nacionalidad = "La nacionalidad es requerida";
      if (!data.estado_civil) errors.estado_civil = "El estado civil es requerido";
      if (!data.escolaridad) errors.escolaridad = "La escolaridad es requerida";
      if (!data.etnia) errors.etnia = "La etnia es requerida";
      if (!data.discapacidad) errors.discapacidad = "Debe indicar si tiene discapacidad";
      if (!data.sabe_leer_escribir) errors.sabe_leer_escribir = "Debe indicar si sabe leer y escribir";
      if (!data.departamento) errors.departamento = "El departamento es requerido";
      if (!data.municipio) errors.municipio = "El municipio es requerido";

      return errors;
    },
    1: (data: typeof formData) => {
      const errors: { [key: string]: string } = {};
      
      // General Information validation
      if (!data.tipo_proceso) errors.tipo_proceso = "El tipo de proceso es requerido";
      if (!data.tiempo_respuesta) errors.tiempo_respuesta = "El tiempo de respuesta es requerido";
      if (!data.hechos) errors.hechos = "Los hechos son requeridos";
      if (!data.pretensiones) errors.pretensiones = "Las pretensiones son requeridas";
      if (!data.fundamentos) errors.fundamentos = "Los fundamentos de derecho son requeridos";
      if (!data.notas) errors.notas = "Las notas son requeridas";
      return errors;
    },
    2: (data: typeof formData) => {
      const errors: { [key: string]: string } = {};
      
      // Administration validation
      if (!data.profesor_id) errors.profesor_id = "Debe seleccionar un profesor";
      if (!data.alumno_id) errors.alumno_id = "Debe seleccionar un alumno";

      return errors;
    }
  };

  const validateCurrentStep = () => {
    const currentValidation = stepValidations[currentStep as keyof typeof stepValidations];
    if (currentValidation) {
      const errors = currentValidation(formData);
      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        setValidationErrors({});
      }
    } else {
      // Get the list of missing fields for a more detailed error message
      const missingFields = Object.keys(validationErrors);
      
      // Map field keys to human-readable names
      const fieldNames = missingFields.map(field => {
        const fieldLabels: {[key: string]: string} = {
          // Basic Information
          tipo_documento: "Tipo de documento",
          num_documento: "Número de documento",
          primer_nombre: "Primer nombre",
          primer_apellido: "Primer apellido",
          sexo: "Sexo",
          genero: "Género",
          orient_sexual: "Orientación sexual",
          fecha_nacimiento: "Fecha de nacimiento",
          num_movil: "Número móvil",
          nacionalidad: "Nacionalidad",
          estado_civil: "Estado civil",
          escolaridad: "Escolaridad",
          etnia: "Etnia",
          discapacidad: "Discapacidad",
          sabe_leer_escribir: "Sabe leer y escribir",
          departamento: "Departamento",
          municipio: "Municipio",
          // General Information
          tipo_proceso: "Tipo de proceso",
          tiempo_respuesta: "Tiempo de respuesta",
          hechos: "Hechos",
          pretensiones: "Pretensiones",
          fundamentos: "Fundamentos de derecho",
          entidad: "Entidad",
          notas: "Notas",
          // Administration
          profesor_id: "Docente asignado",
          alumno_id: "Estudiante asignado",
          citizen_id: "Ciudadano existente",
        };
        
        return fieldLabels[field] || field;
      });
      
      // Create the error message with the list of missing fields
      let errorMessage = "Por favor complete los siguientes campos:";
      
      if (fieldNames.length <= 3) {
        // Show all fields if there are 3 or fewer
        errorMessage += ` ${fieldNames.join(', ')}`;
      } else {
        // Show only the first 3 fields if there are more than 3
        errorMessage += ` ${fieldNames.slice(0, 3).join(', ')} y ${fieldNames.length - 3} más`;
      }
      
      // Show error toast for validation errors
      addToast({
        title: "Error de validación",
        description: errorMessage,
        color: "danger",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setValidationErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === steps.length - 1) {
      // Perform a final validation of all steps before submitting
      const validationErrors: { [key: string]: string } = {};
      
      // Validate each step
      Object.keys(stepValidations).forEach((stepKey) => {
        const stepNumber = parseInt(stepKey);
        const stepValidator = stepValidations[stepNumber as keyof typeof stepValidations];
        if (stepValidator) {
          const errors = stepValidator(formData);
          Object.assign(validationErrors, errors);
        }
      });
      
      // Check if there are any validation errors
      if (Object.keys(validationErrors).length > 0) {
        setValidationErrors(validationErrors);
        
        // Get the list of missing fields for a more detailed error message
        const missingFields = Object.keys(validationErrors);
        
        // Map field keys to human-readable names
        const fieldNames = missingFields.map(field => {
          const fieldLabels: {[key: string]: string} = {
            // Basic Information
            tipo_documento: "Tipo de documento",
            num_documento: "Número de documento",
            primer_nombre: "Primer nombre",
            primer_apellido: "Primer apellido",
            sexo: "Sexo",
            genero: "Género",
            orient_sexual: "Orientación sexual",
            fecha_nacimiento: "Fecha de nacimiento",
            num_movil: "Número móvil",
            nacionalidad: "Nacionalidad",
            estado_civil: "Estado civil",
            escolaridad: "Escolaridad",
            etnia: "Etnia",
            discapacidad: "Discapacidad",
            sabe_leer_escribir: "Sabe leer y escribir",
            departamento: "Departamento",
            municipio: "Municipio",
            // General Information
            tipo_proceso: "Tipo de proceso",
            tiempo_respuesta: "Tiempo de respuesta",
            hechos: "Hechos",
            pretensiones: "Pretensiones",
            fundamentos: "Fundamentos de derecho",
            entidad: "Entidad",
            notas: "Notas",
            // Administration
            profesor_id: "Docente asignado",
            alumno_id: "Estudiante asignado",
            citizen_id: "Ciudadano existente",
          };
          
          return fieldLabels[field] || field;
        });
        
        // Create the error message with the list of missing fields
        let errorMessage = "No se puede enviar el formulario. Campos faltantes:";
        
        if (fieldNames.length <= 3) {
          // Show all fields if there are 3 or fewer
          errorMessage += ` ${fieldNames.join(', ')}`;
        } else {
          // Show only the first 3 fields if there are more than 3
          errorMessage += ` ${fieldNames.slice(0, 3).join(', ')} y ${fieldNames.length - 3} más`;
        }
        
        // Show error toast for validation errors
        addToast({
          title: "Error en el formulario",
          description: errorMessage,
          color: "danger",
        });
        
        return; // Prevent form submission
      }
      
      // If validation passes, proceed with submission
      setIsSubmitting(true);
      setSubmissionError(null);

      // Create FormData object
      const formDataObj = new FormData();

      // Add flag to indicate if we're using an existing citizen
      formDataObj.append("isExistingCitizen", isExistingCitizen.toString());

      // If using existing citizen, add the citizen ID
      if (isExistingCitizen && selectedCitizenId) {
        formDataObj.append("citizenId", selectedCitizenId.toString());
      }

      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        // Skip the tracking fields that we don't want to send to the server
        if (key !== "citizen_id" && key !== "is_existing_citizen") {
          formDataObj.append(key, value.toString());
        }
      });

      try {
        // Submit the form data with mock mode enabled temporarily
        // Set to true to use mock mode, false to use real API calls
        const useMockMode = false; // Toggle this when database permissions are fixed
        const result = await submitFormData(formDataObj, useMockMode);

        if (result.success) {
          setIsComplete(true);
          addToast({
            title: "Formulario enviado exitosamente",
            description: useMockMode
              ? "Modo de prueba: Simulación exitosa"
              : "El formulario se ha enviado correctamente",
          });
        } else {
          setSubmissionError(result.error || "Error al enviar el formulario");
          addToast({
            title: "Error al enviar el formulario",
            description: result.error || "Error al enviar el formulario",
          });
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setSubmissionError("Error inesperado al enviar el formulario");
        addToast({
          title: "Error inesperado al enviar el formulario",
          description: "Error inesperado al enviar el formulario",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      handleNext();
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  // Pass validation errors to child components
  const currentStepProps = {
    formData,
    updateFormData,
    validationErrors,
  };

  return (
    <div className="py-6">
      <div className="mb-16">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${
                  index < currentStep
                    ? "bg-primary border-primary text-primary-foreground"
                    : index === currentStep
                    ? "border-primary text-primary"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {index < currentStep ? (
                  <CheckIcon className="h-8 w-8 stroke-2" />
                ) : (
                  <span className="text-lg font-bold">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-sm mt-2 ${
                  index <= currentStep
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute top-0 left-0 right-0 h-2 rounded-full bg-muted">
            <div
              className="h-2 bg-primary transition-all rounded-full duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Información de nuevo ciudadano</CardTitle>
          <CardDescription>
            Complete todos los pasos para presentar la solicitud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Divider className="mb-7" />
          {/* Stepper Header */}

          {/* Form Content */}
          {isComplete ? (
            <div className="text-center py-28">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                Ciudadano creado exitosamente
              </h3>
              <p className="text-muted-foreground">
                Ahora puedes revisar la información del ciudadano en la sección
                de ciudadanos o los casos que se han creado.
              </p>
              <Button
                color="primary"
                className="mt-10"
                type="button"
                onPress={() => {
                  router.push("/dashboard/citizens");   
                }}
              >
                Volver al dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <CurrentStepComponent {...currentStepProps} />
            </form>
          )}
        </CardContent>
        {!isComplete && (
          <CardFooter className="flex justify-between">
            <Button
              color="primary"
              type="button"
              variant="bordered"
              onPress={handlePrevious}
              isDisabled={currentStep === 0}
            >
              Anterior
            </Button>
            <Button
              color="primary"
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting
                ? "Enviando..."
                : currentStep === steps.length - 1
                ? "Enviar"
                : "Siguiente"}
              {!isSubmitting && currentStep < steps.length - 1 && (
                <ChevronRightIcon className="ml-2 h-4 w-4 stroke-2" />
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
