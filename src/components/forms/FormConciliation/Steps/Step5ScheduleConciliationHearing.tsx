"use client";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { DatePicker, TimeInput, DateValue, Button } from "@heroui/react";
import { Time } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { Icon } from "@iconify/react";

export default function Step5ScheduleConciliationHearing() {
  const { setValue, watch } = useFormContext();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<DateValue | null>(
    null
  );
  const [horaSeleccionada, setHoraSeleccionada] = useState<Time>(
    new Time(0, 0)
  );

  // Observar el array de fechas de audiencia
  const fechasAudiencia = watch("fechas_audiencia") || [];

  const handleTimeChange = (time: Time | null) => {
    if (time) {
      setHoraSeleccionada(time);
    }
  };

  const agregarOpcion = () => {
    if (fechaSeleccionada && horaSeleccionada) {
      // Obtener la fecha en formato YYYY-MM-DD
      const fechaStr = fechaSeleccionada.toString().split("T")[0];

      const hora = horaSeleccionada.hour.toString().padStart(2, "0");
      const minuto = horaSeleccionada.minute.toString().padStart(2, "0");

      // Crear el formato ISO 8601 sin Z para evitar problemas de zona horaria
      // El formato será YYYY-MM-DDTHH:MM:00 (hora local)
      const fechaHoraISO = `${fechaStr}T${hora}:${minuto}:00`;

      console.log("Fecha y hora seleccionada:", fechaStr, `${hora}:${minuto}`);
      console.log("Fecha y hora ISO:", fechaHoraISO);

      // Agregar la nueva fecha al array existente
      const nuevasFechas = [...fechasAudiencia, { fecha_hora: fechaHoraISO }];

      // Actualizar el estado del formulario
      setValue("fechas_audiencia", nuevasFechas);

      // Resetear los campos de entrada
      setFechaSeleccionada(null);
      setHoraSeleccionada(new Time(0, 0));
    }
  };

  // Función para eliminar una fecha de audiencia
  const eliminarFecha = (index: number) => {
    const nuevasFechas = [...fechasAudiencia];
    nuevasFechas.splice(index, 1);
    setValue("fechas_audiencia", nuevasFechas);
  };

  return (
    <section className="space-y-9">
      <h3 className="text-lg font-medium mb-6">
        Agendar audiencia de conciliación
      </h3>
      <h6 className="font-medium mb-6 text-blue-500">
        Fecha y hora de audiencia de conciliación
      </h6>

      <div className="grid grid-cols-3 items-end gap-4">
        <I18nProvider locale="es">
          <DatePicker
            variant="bordered"
            label="Fecha"
            labelPlacement="outside"
            value={fechaSeleccionada}
            onChange={setFechaSeleccionada}
            isRequired
            showMonthAndYearPickers
            selectorIcon={<Icon icon="solar:calendar-bold" className="h-5 w-5" />}
          />
        </I18nProvider>

        <I18nProvider locale="es">
          <TimeInput
            variant="bordered"
            label="Hora"
            labelPlacement="outside"
            value={horaSeleccionada}
            onChange={handleTimeChange}
            hourCycle={12}
            isRequired
            endContent={
              <Icon icon="solar:clock-circle-bold" className="h-5 w-5" />
            }
          />
        </I18nProvider>

        {/* Botón */}
        <Button
          color="primary"
          onPress={agregarOpcion}
          isDisabled={!fechaSeleccionada || !horaSeleccionada}
        >
          Agregar opción de fecha
        </Button>
      </div>

      {/* Listado de opciones de fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
        {fechasAudiencia.map((opcion: any, index: number) => {
          // Extraer la fecha y hora directamente del string ISO
          const [fechaParte, horaParte] = opcion.fecha_hora.split('T');
          
          // Formatear la fecha (YYYY-MM-DD a DD/MM/YYYY)
          const [año, mes, dia] = fechaParte.split('-');
          const fecha = `${dia}/${mes}/${año}`;
          
          // Formatear la hora (extraer HH:MM de HH:MM:00)
          const hora = horaParte.substring(0, 5);

          return (
            <figure
              key={index}
              className="border-l-4 flex items-center justify-between border-primary bg-gray-50 rounded-md px-4 py-2 relative"
            >
              <div>
                <p className="text-sm font-semibold text-primary mb-1">
                  Opción fecha {index + 1}
                </p>
                <p className="text-sm text-gray-700">{fecha}</p>
                <p className="text-sm text-gray-700">{hora}</p>
              </div>

              <Button
                variant="light"
                color="danger"
                isIconOnly
                onPress={() => eliminarFecha(index)}
              >
                <Icon icon="solar:trash-bin-2-bold" className="h-5 w-5" />
              </Button>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
