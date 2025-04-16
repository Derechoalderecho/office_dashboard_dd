import { Input, Select, SelectItem, Textarea } from "@heroui/react";

type GeneralInformationProps = {
  formData: {
    notas: string;
    tipo_proceso: string;
    tiempo_respuesta: string;
    hechos: string;
    pretensiones: string;
    fundamentos: string;
    entidad: string;
  };
  updateFormData: (
    data: Partial<{
      notas: string;
      tipo_proceso: string;
      tiempo_respuesta: string;
      hechos: string;
      pretensiones: string;
      fundamentos: string;
      entidad: string;
    }>
  ) => void;
};

export default function GeneralInformationStep({
  formData,
  updateFormData,
}: GeneralInformationProps) {
  const isTutela = formData.tipo_proceso === "Tutela";
  const isDerechoPeticion = formData.tipo_proceso === "Derecho de petición";
  
  const selectedInSelect = !!formData.tipo_proceso && 
    (formData.tipo_proceso === "Tutela" || formData.tipo_proceso === "Derecho de petición");
  
  const showHechos = selectedInSelect && (isTutela || isDerechoPeticion);
  const showPretensiones = selectedInSelect && (isTutela || isDerechoPeticion);
  const showFundamentos = selectedInSelect && (isTutela || isDerechoPeticion);
  const showEntidad = selectedInSelect && isDerechoPeticion;
  
  const showAdditionalFields = selectedInSelect;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          id="tipo_proceso"
          name="tipo_proceso"
          variant="bordered"
          label="Tipo de proceso"
          labelPlacement="outside"
          placeholder="Seleccione un tipo de proceso"
          value={formData.tipo_proceso}
          onChange={(e) => updateFormData({ tipo_proceso: e.target.value })}
          isRequired
        >
          <SelectItem key="Tutela">Tutela</SelectItem>
          <SelectItem key="Derecho de petición">Derecho de petición</SelectItem>
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

      <div className="grid grid-cols-1 gap-6">
        {/* Muestra los campos adicionales solo si se ha seleccionado un tipo de proceso */}
        {showAdditionalFields && (
          <>
            {showHechos && (
              <Textarea
                id="hechos"
                name="hechos"
                variant="bordered"
                label="Hechos"
                labelPlacement="outside"
                size="lg"
                isRequired
                value={formData.hechos || ""}
                onChange={(e) => updateFormData({ hechos: e.target.value })}
                placeholder="Ingrese los hechos"
              />
            )}

            {showPretensiones && (
              <Textarea
                id="pretensiones"
                name="pretensiones"
                variant="bordered"
                label="Pretensiones"
                labelPlacement="outside"
                size="lg"
                isRequired
                value={formData.pretensiones || ""}
                onChange={(e) => updateFormData({ pretensiones: e.target.value })}
                placeholder="Ingrese las pretensiones"
              />
            )}

            {showFundamentos && (
              <Textarea
                id="fundamentos"
                name="fundamentos"
                variant="bordered"
                label="Fundamentos de derecho"
                labelPlacement="outside"
                size="lg"
                isRequired
                value={formData.fundamentos || ""}
                onChange={(e) => updateFormData({ fundamentos: e.target.value })}
                placeholder="Ingrese los fundamentos de derecho"
              />
            )}

            {showEntidad && (
              <Textarea
                id="entidad"
                name="entidad"
                variant="bordered"
                label="Entidad"
                labelPlacement="outside"
                size="lg"
                isRequired
                value={formData.entidad || ""}
                onChange={(e) => updateFormData({ entidad: e.target.value })}
                placeholder="Ingrese la entidad"
              />
            )}
          </>
        )}

        {/* El campo de notas siempre se muestra */}
        <Textarea
          id="notas"
          name="notas"
          variant="bordered"
          label="Notas"
          labelPlacement="outside"
          size="lg"
          isRequired  
          value={formData.notas}
          onChange={(e) => updateFormData({ notas: e.target.value })}
          placeholder="Ingrese las notas"
        />
      </div>
    </div>
  );
}
