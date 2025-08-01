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
import Step3CaseCounterparts from "./Steps/Step3CaseCounterparts";
import Step4CaseInformation from "./Steps/Step4CaseInformation";
import Step5ScheduleConciliationHearing from "./Steps/Step5ScheduleConciliationHearing";
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
      completado: false,
      //Informacion Step 1
      ciudadano_solicitante: {
        num_documento: "",
        tipo_documento: "",
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        fecha_nacimiento: "",
        fecha_expedicion: "",
        sexo: "",
        genero: "",
        orientacion_sexual: "",
        num_movil: "",
        telefono_fijo: "",
        email: "",
        nacionalidad: "",
        otra_nacionalidad: "",
        estado_civil: "",
        escolaridad: "",
        ocupacion: "",
        etnia: "",
        estrato: null,
        zona_residencia: "",
        departamento: "",
        municipio: "",
        dane_municipio: "",
        discapacidad: false,
        sabe_leer_escribir: false,
        direccion_residencia: "",
      },
      //Informacion Step 2
      confirma_datos: false,
      confirma_tratamiento_datos: false,
      step2SubStep: 0, //No se envía al backend
      firma_solicitante: {
        origen_firma: "canvas"
      },
      foto_usuario: "",
      //Informacion Step 3
      tipo_proceso: "",
      materia_del_caso: "",
      ciudadano_citado: [{
        tipo_documento: "",
        num_documento: "",
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        fecha_nacimiento: "",
        fecha_expedicion: "",
        sexo: "",
        genero: "",
        orientacion_sexual: "",
        num_movil: "",
        telefono_fijo: "",
        email: "",
        nacionalidad: "",
        otra_nacionalidad: "",
        estado_civil: "",
        escolaridad: "",
        ocupacion: "",
        etnia: "",
        estrato: null,
        zona_residencia: "",
        departamento: "",
        municipio: "",
        dane_municipio: "",
        discapacidad: false,
        sabe_leer_escribir: false,
        direccion_residencia: "",
      }],
      existen_persona_beneficiaria: false,
      ciudadano_beneficiado: [{
        tipo_documento: "",
        num_documento: "",
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        fecha_nacimiento: "",
        fecha_expedicion: "",
        sexo: "",
        genero: "",
        orientacion_sexual: "",
        num_movil: "",
        telefono_fijo: "",
        email: "",
        nacionalidad: "Colombiana",
        otra_nacionalidad: "",
        estado_civil: "",
        escolaridad: "",
        ocupacion: "",
        etnia: "",
        estrato: null,
        zona_residencia: "",
        departamento: "",
        municipio: "",
        dane_municipio: "",
        discapacidad: false,
        sabe_leer_escribir: false,
        direccion_residencia: "",
      }],
      //Informacion Step 4
      inicio_de_conflicto: "",
      escala_del_conflicto: "",
      ultima_intervencion: "",
      fecha_intervencion: "",
      modalidad_audiencia: "",
      hechos: "",
      pretensiones: "",
      cuantia: "",
      fundamentos_derecho: "",
      anexo_registro_civil: null,
      anexo_cedula_solicitante: null,
      anexos_adicionales: [],
      prueas_solicitante: "",
      pruebas_citado: "",
      //Informacion Step 5
      fechas_audiencia: [],
    },
    mode: "onSubmit",
  });

  const { handleSubmit, watch } = methods;
  const formValues = watch(); // Observa todos los valores del formulario que van saliendo

  console.log(formValues);

  const steps = [
    { title: "Información del solicitante", component: Step1BasicInformationConciliation },
    { title: "Tratamiento de datos", component: Step2DataProcessing },
    { title: "Contrapartes del caso", component: Step3CaseCounterparts },
    { title: "Información del caso", component: Step4CaseInformation },
    { title: 'Agendar audiencia de conciliación', component: Step5ScheduleConciliationHearing },
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
      console.log("=== INICIO DEBUG STEPPER FORM ===");
      console.log("Datos originales del formulario:", data);
      
      // Eliminar campos que no deben enviarse al backend
      const dataToSend = { ...data };
      delete dataToSend.step2SubStep; // Campo interno que no se envía al backend
      
      console.log("Datos después de eliminar step2SubStep:", dataToSend);
      
      // Asegurarse de que firma_solicitante tiene origen_firma
      if (!dataToSend.firma_solicitante || typeof dataToSend.firma_solicitante !== 'object') {
        dataToSend.firma_solicitante = { origen_firma: "canvas" };
      } else if (!dataToSend.firma_solicitante.origen_firma) {
        dataToSend.firma_solicitante.origen_firma = "canvas";
      }
      
      // Asegurarse de que todos los ciudadanos beneficiados tengan fecha_expedicion
      if (dataToSend.ciudadano_beneficiado && Array.isArray(dataToSend.ciudadano_beneficiado)) {
        dataToSend.ciudadano_beneficiado = dataToSend.ciudadano_beneficiado.map((ciudadano: any) => {
          if (!ciudadano.fecha_expedicion) {
            return { ...ciudadano, fecha_expedicion: null };
          }
          return ciudadano;
        });
      }
      
      // Extraer la firma digital si existe
      const firmaDigital = dataToSend.firma_digital || dataToSend.firma_solicitante;
      console.log("Firma digital encontrada:", firmaDigital);
      
      // Crear un nuevo FormData para enviar directamente
      const formDataObj = new FormData();
      
      // Añadir el objeto de datos completo como JSON en la clave 'datos'
      const jsonData = JSON.stringify(dataToSend);
      console.log("JSON a enviar en 'datos':", jsonData.substring(0, 200) + '...');
      formDataObj.append('datos', jsonData);
      
      // Añadir la firma digital si existe
      if (firmaDigital instanceof File) {
        formDataObj.append('firma_digital', firmaDigital);
        console.log("✓ Firma digital añadida al FormData:", firmaDigital);
      } else {
        console.warn("⚠️ No se encontró firma digital en el formulario o no es un archivo");
      }
      
      // Verificar el FormData antes de enviarlo
      console.log("=== FormData creado ===");
      for (const [key, value] of formDataObj.entries()) {
        console.log(`${key}:`, typeof value, value instanceof File ? `File(${value.name})` : value);
      }
      console.log("=== FIN DEBUG STEPPER FORM ===");

      try {
        console.log("Enviando FormData al submitFormData...");
        await submitFormData(formDataObj);
        setIsComplete(true);
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    } else if (currentStep === 1) {
      // Estamos en el Step 2 (Tratamiento de datos)
      const currentSubStep = data.step2SubStep || 0;
      
      if (currentSubStep === 0) {
        // Si estamos en el sub-paso inicial, avanzamos al sub-paso de confirmación
        methods.setValue("step2SubStep", 1);
        return;
      } else if (currentSubStep === 1) {
        // Si estamos en el sub-paso de confirmación
        if (!data.confirma_datos) {
          // Si los datos no están confirmados, no avanzamos
          return;
        }
        // Si los datos están confirmados, avanzamos al sub-paso de firma
        methods.setValue("step2SubStep", 2);
        return;
      } else if (currentSubStep === 2) {
        // Si estamos en el sub-paso de firma
        if (!data.firma_digital) {
          // Si no hay firma, no avanzamos
          return;
        }
        // Renombramos firma_digital a firma_solicitante para el backend
        methods.setValue("firma_solicitante", data.firma_digital);
        // Si hay firma, avanzamos al siguiente paso
        methods.setValue("step2SubStep", 0); // Reiniciamos el sub-paso para la próxima vez
        handleNext();
      }
    } else {
      handleNext();
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  // Función para navegar a un paso específico
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      // Reiniciar el sub-paso si volvemos al paso 2
      if (stepIndex === 1) {
        methods.setValue("step2SubStep", 0);
      }
    }
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
                  router.push("/dashboard/cases");
                }}
              >
                Volver a casos
              </Button>
            </div>
          ) : (
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CurrentStepComponent goToStep={goToStep} />
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
