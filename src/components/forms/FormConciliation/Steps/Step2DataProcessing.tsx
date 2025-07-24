import { Input } from "@heroui/react"
import { useFormContext } from "react-hook-form"

export default function Step2DataProcessing() {
  const { register } = useFormContext();
  
  return (
    <div>
      <Input
        label="prueba1"
        {...register("prueba1")}
      />
      <Input
        label="prueba2"
        {...register("prueba2")}
      />
    </div>
  )
}
