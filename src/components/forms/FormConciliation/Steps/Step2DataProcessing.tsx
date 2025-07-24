import { Input } from "@heroui/react"

type DataProcessingProps = {
  formData: {
    email: string;
    num_movil: string;
  }
  updateFormData: (
    data: Partial<{
      email: string;
      num_movil: string;
    }>
  ) => void;
}

export default function Step2DataProcessing({
  formData,
  updateFormData,
}: DataProcessingProps) {
  return (
    <div>
      <Input
        label="Email"
        value={formData.email}
        onChange={(e) => updateFormData({ email: e.target.value })}
      />
      <Input
        label="Número de móvil"
        value={formData.num_movil}
        onChange={(e) => updateFormData({ num_movil: e.target.value })}
      />
    </div>
  )
}
