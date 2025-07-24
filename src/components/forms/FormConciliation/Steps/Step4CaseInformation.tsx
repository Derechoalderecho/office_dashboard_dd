import { Input } from "@heroui/react"
import { useFormContext } from "react-hook-form"

export default function Step4CaseInformation() {
  const { register } = useFormContext();
  
  return (
    <div>
      <Input
        label="prueba5"
        {...register("prueba5")}
      />
      <Input
        label="prueba6"
        {...register("prueba6")}
      />
    </div>
  )
}
