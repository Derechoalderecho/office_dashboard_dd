import { Input, Select, SelectItem, Textarea } from "@heroui/react";
import { useState } from "react";

type GeneralInformationProps = {
  formData: {
    notas: string;
    tipo_proceso: string;
    tiempo_respuesta: string;
  };
  updateFormData: (
    data: Partial<{
      notas: string;
      tipo_proceso: string;
      tiempo_respuesta: string;
    }>
  ) => void;
};

export default function GeneralInformationStep({
  formData,
  updateFormData,
}: GeneralInformationProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          id="tipo_proceso"
          name="tipo_proceso"
          variant="bordered"
          label="Tipo de proceso"
          labelPlacement="outside"
          placeholder="Seleccione el tipo de proceso"
          value={formData.tipo_proceso}
          onChange={(e) => updateFormData({ tipo_proceso: e.target.value })}
          isRequired
        >
          <SelectItem key="Tutela">Tutela</SelectItem>
          <SelectItem key="Derecho de petición">Derecho de petición</SelectItem>
          <SelectItem key="Habeas corpus">Habeas corpus</SelectItem>
          <SelectItem key="Acción popular">Acción popular</SelectItem>
          <SelectItem key="Acción de grupo">Acción de grupo</SelectItem>
        </Select>

        <Input
          id="tiempo_respuesta"
          name="tiempo_respuesta"
          type="number"
          variant="bordered"
          label="Tiempo de respuesta (horas)"
          labelPlacement="outside"
          placeholder="Ingrese el tiempo de respuesta"
          value={formData.tiempo_respuesta}
          onChange={(e) => updateFormData({ tiempo_respuesta: e.target.value })}
          isRequired
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Textarea
          id="notas"
          name="notas"
          variant="bordered"
          label="Notas"
          labelPlacement="outside"
          size="lg"
          value={formData.notas}
          onChange={(e) => updateFormData({ notas: e.target.value })}
          placeholder="Ingrese las notas"
        />
      </div>
    </div>
  );
}
