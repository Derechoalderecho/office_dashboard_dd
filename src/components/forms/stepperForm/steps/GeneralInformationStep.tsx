import { Input, Select, SelectItem, Textarea } from "@heroui/react";

type GeneralInformationProps = {
  formData: {
    notas: string;
    id_tipo_caso: string;
    tiempo_respuesta: string;
    hechos: string;
    pretensiones: string;
    fundamentos: string;
    entidad: string;
  };
  updateFormData: (
    data: Partial<{
      notas: string;
      id_tipo_caso: string;
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
  const isTutela = formData.id_tipo_caso === "1";
  const isDerechoPeticion = formData.id_tipo_caso === "2";
  const isTutelaPrimeraInstancia = formData.id_tipo_caso === "5";
  const isTutelaSegundaInstancia = formData.id_tipo_caso === "6";
  const isTutelaDesacato = formData.id_tipo_caso === "7";
  
  const selectedInSelect = !!formData.id_tipo_caso && 
    (["1", "2", "5", "6", "7"].includes(formData.id_tipo_caso));
  
  const showHechos = selectedInSelect && (isTutela || isDerechoPeticion || isTutelaPrimeraInstancia || isTutelaSegundaInstancia || isTutelaDesacato);
  const showPretensiones = selectedInSelect && (isTutela || isDerechoPeticion || isTutelaPrimeraInstancia || isTutelaSegundaInstancia || isTutelaDesacato);
  const showFundamentos = selectedInSelect && (isTutela || isDerechoPeticion || isTutelaPrimeraInstancia || isTutelaSegundaInstancia || isTutelaDesacato);
  const showEntidad = selectedInSelect && isDerechoPeticion;
  
  const showAdditionalFields = selectedInSelect;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          id="id_tipo_caso"
          name="id_tipo_caso"
          variant="bordered"
          label="Tipo de proceso"
          labelPlacement="outside"
          placeholder="Seleccione un tipo de proceso"
          value={formData.id_tipo_caso}
          onChange={(e) => updateFormData({ id_tipo_caso: e.target.value })}
          isRequired
        >
          <SelectItem key="1">Tutela</SelectItem>
          <SelectItem key="5">Tutela primera instancia</SelectItem>
          <SelectItem key="6">Tutela segunda instancia</SelectItem>
          <SelectItem key="7">Tutela desacato</SelectItem>
          <SelectItem key="2">Derecho de petición</SelectItem>
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
          value={formData.notas}
          onChange={(e) => updateFormData({ notas: e.target.value })}
          placeholder="Ingrese las notas"
        />
      </div>
    </div>
  );
}
