import { Input } from "@heroui/react"
import { useFormContext } from "react-hook-form"

export default function Step1BasicInformationConciliation() {
  // Usamos useFormContext para acceder al contexto del formulario
  const { register, formState } = useFormContext();
  
  return (
    <div>
      <Input
        label="Primer nombre"
        {...register("primer_nombre")}
      />
      <Input
        label="Segundo nombre"
        {...register("segundo_nombre")}
      />
    </div>
  )
}
