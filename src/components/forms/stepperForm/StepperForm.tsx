"use client";

import type React from "react";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
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

export default function StepperForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    num_documento: "",
    tipo_documento: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    sexo: "",
    genero: "",
    orient_sexual: "",
    //fecha_nacimiento: "",
    num_movil: "",
    num_fijo: "",
    email: "",
    nacionalidad: "",
    estado_civil: "",
    escolaridad: "",
    etnia: "",
    discapacidad: "",
    sabe_leer_escribir: "",
    notas: "",
    profesor_id: "",
    monitor_id: "",
    alumno_id: "",
    rol: "",
    tipo_proceso: "Tutela", 
    estado: "Nuevo",
    tiempo_respuesta: "48",
    dane_municipio: "05001",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { title: "Información básica", component: BasicInformationStep },
    { title: "Información general", component: GeneralInformationStep },
    { title: "Información administrativa", component: AdministrationStep },
    { title: "Revisión", component: ReviewStep },
  ];

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === steps.length - 1) {
      setIsSubmitting(true);
      setSubmissionError(null);

      // Create FormData object
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value.toString());
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
            description: useMockMode ? "Modo de prueba: Simulación exitosa" : "El formulario se ha enviado correctamente",
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
            <div className="text-center py-10">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">
                Application Submitted!
              </h3>
              <p className="text-muted-foreground">
                Thank you for completing all steps. We'll be in touch soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <CurrentStepComponent
                formData={formData}
                updateFormData={updateFormData}
              />
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
              disabled={currentStep === 0}
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
