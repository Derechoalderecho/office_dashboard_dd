import { Select, SelectItem, Textarea, DateInput } from "@heroui/react";
import { useFormContext } from "react-hook-form";
import { I18nProvider } from "@react-aria/i18n";
import { useState, useEffect } from "react";
import { CalendarDate } from "@internationalized/date";
import InputFile, { FileAttachment } from "@/components/shared/InputFile";
import { validateStep4 } from "@/validators/step4ConciliationValidators";

interface Step4CaseInformationProps {
  onValidationChange?: (isValid: boolean) => void;
}

export default function Step4CaseInformation({ onValidationChange }: Step4CaseInformationProps) {
  const { register, watch, setValue } = useFormContext();

  // Obtener la fecha de intervención del formulario
  const fechaIntervencionValue = watch("fecha_intervencion");
  const [fechaSeleccionada, setFechaSeleccionada] =
    useState<CalendarDate | null>(null);

  // Estado para anexos adicionales
  const anexosAdicionales = watch("anexos_adicionales") || [];
  
  // Observar campos relevantes para validación
  const formData = watch();
  
  // Comunicar estado de validación al StepperForm
  useEffect(() => {
    if (onValidationChange) {
      const validation = validateStep4(formData);
      onValidationChange(validation.success);
    }
  }, [
    formData.inicio_de_conflicto,
    formData.escala_del_conflicto,
    formData.ultima_intervencion,
    formData.fecha_intervencion,
    formData.modalidad_audiencia,
    formData.hechos,
    formData.pretensiones,
    formData.cuantia,
    formData.pruebas_solicitante,
    formData.pruebas_citado,
    formData.anexo_registro_civil,
    formData.anexo_cedula_solicitante,
    onValidationChange
  ]);

  // Sincronizar el estado cuando cambie el valor en el formulario
  useEffect(() => {
    if (fechaIntervencionValue) {
      const [year, month, day] = fechaIntervencionValue.split("-").map(Number);
      // CalendarDate usa meses basados en 1 (enero = 1)
      setFechaSeleccionada(new CalendarDate(year, month, day));
    }
  }, []);

  return (
    <section className="flex flex-col gap-y-6 space-y-6">
      <h6 className="text-lg font-medium">Crear solicitud de conciliación</h6>
      <Textarea
        label="Cuánto hace que se inició el conflicto:"
        variant="bordered"
        labelPlacement="outside"
        placeholder="Ingresar la información solicitada"
        isRequired
        {...register("inicio_de_conflicto")}
      />
      <Textarea
        label="Escala del conflicto:"
        variant="bordered"
        labelPlacement="outside"
        placeholder="Ingresar la información solicitada"
        isRequired
        {...register("escala_del_conflicto")}
      />
      <div className="grid grid-cols-3 items-end gap-6">
        <Select
          label="La última vez que alguien intervino en el conflicto fue:"
          placeholder="Seleccione una opción"
          variant="bordered"
          labelPlacement="outside"
          {...register("ultima_intervencion")}
          selectedKeys={
            watch("ultima_intervencion") ? [watch("ultima_intervencion")] : []
          }
          onChange={(e) => setValue("ultima_intervencion", e.target.value)}
          isRequired
        >
          <SelectItem key="Directamente sin intervención de terceros">
            Directamente sin intervención de terceros
          </SelectItem>
          <SelectItem key="Con intervención de terceros institucionales">
            Con intervención de terceros institucionales
          </SelectItem>
          <SelectItem key="Con intervención de terceros no institucionales">
            Con intervención de terceros no institucionales
          </SelectItem>
        </Select>
        <I18nProvider locale="es">
          <DateInput
            variant="bordered"
            label="Fecha de intervención"
            labelPlacement="outside"
            className="!pb-0"
            value={fechaSeleccionada}
            onChange={(date) => {
              setFechaSeleccionada(date);
              if (date) {
                setValue("fecha_intervencion", date.toString());
              } else {
                setValue("fecha_intervencion", null);
              }
            }}
            isRequired
            errorMessage={!fechaSeleccionada ? "Seleccione una fecha" : null}
          />
        </I18nProvider>
        <Select
          label="Modalidad de audiencia:"
          placeholder="Seleccione una opción"
          variant="bordered"
          labelPlacement="outside"
          {...register("modalidad_audiencia")}
          selectedKeys={
            watch("modalidad_audiencia") ? [watch("modalidad_audiencia")] : []
          }
          onChange={(e) => setValue("modalidad_audiencia", e.target.value)}
          isRequired
        >
          <SelectItem key="Virtual">Virtual</SelectItem>
          <SelectItem key="Presencial">Presencial</SelectItem>
        </Select>
      </div>
      <Textarea
        label="Documento firmado:"
        variant="bordered"
        labelPlacement="outside"
        placeholder="Ingresar la información solicitada"
        {...register("documento_firmado")}
      />
      <div>
        <span className="text-blue-500 text-sm font-medium">Hechos</span>
        <Textarea
          label="La controversia que desea solucionar tiene como hechos los siguientes, narrados por la persona solicitante:"
          variant="bordered"
          labelPlacement="outside"
          placeholder="Ingresar la información solicitada"
          isRequired
          {...register("hechos")}
        />
      </div>
      <div>
        <span className="text-blue-500 text-sm font-medium">Pretensiones</span>
        <Textarea
          label="El (La) usuario(a) solicita se consigne las siguientes pretensiones"
          variant="bordered"
          labelPlacement="outside"
          placeholder="Ingresar la información solicitada"
          isRequired
          {...register("pretensiones")}
        />
      </div>

      <div>
        <span className="text-blue-500 text-sm font-medium">Cuantía</span>
        <Textarea
          label="De igual manera, la cuantía del conflicto asciende a la suma de:"
          variant="bordered"
          labelPlacement="outside"
          placeholder="Ingresar la información solicitada"
          isRequired
          {...register("cuantia")}
        />
      </div>
      <Textarea
        label="Fundamentos del derecho"
        variant="bordered"
        labelPlacement="outside"
        placeholder="Ingresar la información solicitada"
        {...register("fundamentos_derecho")}
      />

      <h3 className="text-md font-medium text-blue-500">Anexos obligatorios</h3>

      <div className="space-y-2 p-4 rounded-md bg-gray-50">
        <FileAttachment
          id="registro-civil-menor"
          name="anexo_registro_civil"
          label="Registro civil del menor"
          isRequired={true}
          isPrimordial={true}
          accept="application/pdf,image/*"
          maxSizeMB={2}
          maxSizeErrorMessage="El registro civil no puede superar los 2MB de tamaño"
          file={watch("anexo_registro_civil")}
          onFileSelected={(file) => {
            setValue("anexo_registro_civil", file);
          }}
          onFileRemove={() => {
            setValue("anexo_registro_civil", null);
          }}
        />
        <FileAttachment
          id="cedula-solicitante"
          name="anexo_cedula_solicitante"
          label="Cédula del solicitante"
          isRequired={true}
          isPrimordial={true}
          accept="application/pdf,image/*"
          maxSizeMB={2}
          maxSizeErrorMessage="La cédula del solicitante no puede superar los 2MB de tamaño"
          file={watch("anexo_cedula_solicitante")}
          onFileSelected={(file) => {
            setValue("anexo_cedula_solicitante", file);
          }}
          onFileRemove={() => {
            setValue("anexo_cedula_solicitante", null);
          }}
        />
      </div>

      <h3 className="text-md font-medium text-blue-500 mt-6">
        Anexos adicionales
      </h3>
      <div className="mt-2">
        <InputFile
          id="anexos-adicionales"
          label="Agregar anexos adicionales"
          sublabel="Documentos, imágenes, PDFs (Máx. 5 MB por archivo)"
          description="Puede agregar múltiples archivos de soporte para la conciliación"
          accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          multiple={true}
          maxSizeMB={5}
          maxSizeErrorMessage="Los anexos adicionales no pueden superar los 5MB por archivo"
          files={anexosAdicionales}
          showSelectedFiles={true}
          onFilesSelected={(files) => {
            // Agregar los nuevos archivos a los existentes
            const currentFiles = watch("anexos_adicionales") || [];
            setValue("anexos_adicionales", [...currentFiles, ...files]);
          }}
          onFileRemove={(fileIndex) => {
            // Eliminar archivo por índice
            const currentFiles = [...anexosAdicionales];
            currentFiles.splice(fileIndex, 1);
            setValue("anexos_adicionales", currentFiles);
          }}
        />
      </div>

      <div>
        <span className="text-blue-500 text-sm font-medium">Pruebas solicitante</span>
        <Textarea
          label="De igual manera se discriminan las pruebas que soporten los hechos relacionados:"
          variant="bordered"
          labelPlacement="outside"
          placeholder="Ingresar la información solicitada"
          isRequired
          {...register("pruebas_solicitante")}
        />
      </div>
      <div>
        <span className="text-blue-500 text-sm font-medium">Pruebas citado</span>
        <Textarea
          label="De igual manera se discriminan las pruebas que soporten los hechos relacionados:"
          variant="bordered"
          labelPlacement="outside"
          placeholder="Ingresar la información solicitada"
          isRequired
          {...register("pruebas_citado")}
        />
      </div>
    </section>
  );
}
