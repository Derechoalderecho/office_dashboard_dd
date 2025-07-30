"use client";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { DateInput, TimeInput, DateValue, Button } from "@heroui/react";
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

      // Crear el formato ISO 8601: YYYY-MM-DDTHH:MM:00Z
      const fechaHoraISO = `${fechaStr}T${hora}:${minuto}:00Z`;

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
          <DateInput
            variant="bordered"
            label="Fecha"
            labelPlacement="outside"
            value={fechaSeleccionada}
            onChange={setFechaSeleccionada}
            isRequired
            endContent={<Icon icon="solar:calendar-bold" className="h-5 w-5" />}
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
          // Convertir la fecha ISO a objetos de fecha y hora para mostrar
          const fechaHora = new Date(opcion.fecha_hora);
          const fecha = fechaHora.toLocaleDateString("es-CO", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          const hora = fechaHora.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

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
