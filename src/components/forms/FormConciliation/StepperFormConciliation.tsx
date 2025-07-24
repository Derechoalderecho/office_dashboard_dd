"use client";

import type React from "react";

import { useState } from "react";
import { Check } from "lucide-react";
import { CheckIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Button, Divider } from "@heroui/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Step1BasicInformationConciliation from "./Steps/Step1BasicInformationConciliation";
import Step2DataProcessing from "./Steps/Step2DataProcessing";
import Step6ReviewStepConciliation from "./Steps/Step6ReviewStepConciliation";
import { submitFormData } from "./SubmitFormConciliation";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";

export default function StepperFormConciliation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();

  // Configuración de React Hook Form
  const methods = useForm({
    defaultValues: {
      ciudadano_solicitante: {
        // Información de documento
        num_documento: "",

        // Información personal básica
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        fecha_nacimiento: "",
        sexo: "",
        genero: "",
        orientacion_sexual: "",

        // Información de contacto
        num_movil: "",
        telefono_fijo: "",
        email: "",

        // Información adicional
        nacionalidad: "",
        estado_civil: "",
        escolaridad: "",
        etnia: "",
        estrato: "",
        zona_residencia: "",
        departamento: "",
        municipio: "",
        dane_municipio: "",
        discapacidad: "",
        sabe_leer_escribir: "",
        direccion_residencia: "",
      },
      prueba1: "",
      prueba2: "",
    },
    mode: "onSubmit",
  });

  const { handleSubmit, watch } = methods;
  const formValues = watch(); // Observa todos los valores del formulario que van saliendo

  console.log(formValues);

  const steps = [
    {
      title: "Información básica",
      component: Step1BasicInformationConciliation,
    },
    { title: "Información general", component: Step2DataProcessing },
    { title: "Revisión", component: Step6ReviewStepConciliation },
  ];

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

  const onSubmit = async (data: any) => {
    if (currentStep === steps.length - 1) {
      const formDataObj = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataObj.append(key, String(value));
        } else {
          formDataObj.append(key, "");
        }
      });

      try {
        await submitFormData(formDataObj);
        setIsComplete(true);
      } catch (error) {
        console.error("Error submitting form:", error);
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
                  router.push("/dashboard/cases");
                }}
              >
                Volver a casos
              </Button>
            </div>
          ) : (
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CurrentStepComponent />
              </form>
            </FormProvider>
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
              onClick={methods.handleSubmit(onSubmit)}
              disabled={methods.formState.isSubmitting}
              className="flex items-center"
            >
              {methods.formState.isSubmitting
                ? "Enviando..."
                : currentStep === steps.length - 1
                ? "Enviar"
                : "Siguiente"}
              {!methods.formState.isSubmitting &&
                currentStep < steps.length - 1 && (
                  <ChevronRightIcon className="ml-2 h-4 w-4 stroke-2" />
                )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
