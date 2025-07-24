import { Input } from "@heroui/react"

type BasicInformationProps = {
  formData: {
    primer_nombre: string;
    segundo_nombre: string;
  }
  updateFormData: (
    data: Partial<{
      primer_nombre: string;
      segundo_nombre: string;
    }>
  ) => void;
}

export default function Step1BasicInformationConciliation({
  formData,
  updateFormData,
}: BasicInformationProps) {
  return (
    <div>
      <Input
        label="Primer nombre"
        value={formData.primer_nombre}
        onChange={(e) => updateFormData({ primer_nombre: e.target.value })}
      />
      <Input
        label="Segundo nombre"
        value={formData.segundo_nombre}
        onChange={(e) => updateFormData({ segundo_nombre: e.target.value })}
      />
    </div>
  )
}
