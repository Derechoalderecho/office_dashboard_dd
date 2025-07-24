import { Input } from "@heroui/react"
import { useFormContext } from "react-hook-form"

export default function Step2DataProcessing() {
  const { register } = useFormContext();
  
  return (
    <div>
      <Input
        label="Email"
        {...register("email")}
      />
      <Input
        label="Número de móvil"
        {...register("num_movil")}
      />
    </div>
  )
}
