import { Select, SelectItem, Textarea } from "@heroui/react";

type GeneralInformationProps = {
  formData: {
    id_tipo_caso: string;
    entidad: string;
    hechos: string;
    pretensiones: string;
    fundamentos_derecho: string;
  };
  updateFormData: (
    data: Partial<{
      id_tipo_caso: string;
      entidad: string;
      hechos: string;
      pretensiones: string;
      fundamentos_derecho: string;
    }>
  ) => void;
};

export default function Step2GeneralInformationStep({
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 mb-6">
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
      </div>

      <div className="grid grid-cols-1 gap-6">
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
            id="fundamentos_derecho"
            name="fundamentos_derecho"
            variant="bordered"
            label="Fundamentos de derecho"
            labelPlacement="outside"
            size="lg"
            isRequired
            value={formData.fundamentos_derecho || ""}
            onChange={(e) => updateFormData({ fundamentos_derecho: e.target.value })}
            placeholder="Ingrese los fundamentos de derecho"
          />
        )}
      </div>
    </div>
  );
}
