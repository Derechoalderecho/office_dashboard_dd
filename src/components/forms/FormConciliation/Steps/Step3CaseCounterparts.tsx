import { Input } from "@heroui/react"
import { useFormContext } from "react-hook-form"

export default function Step3CaseCounterparts() {
  const { register } = useFormContext();
  
  return (
    <div>
      <Input
        label="prueba3"
        {...register("prueba3")}
      />
      <Input
        label="prueba4"
        {...register("prueba4")}
      />
    </div>
  )
}
