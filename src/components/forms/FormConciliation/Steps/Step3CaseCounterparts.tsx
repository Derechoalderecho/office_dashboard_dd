import { Input } from "@heroui/react"
import { useFormContext } from "react-hook-form"
import FieldsCitizen from "../components/FieldsCitizen";

export default function Step3CaseCounterparts() {
  const { register } = useFormContext();
  
  return (
    <div>
      <Input
        label="prueba3"
        {...register("prueba3")}
      />
      <FieldsCitizen prefix="ciudadano_citado" />
      <Input
        label="prueba4"
        {...register("prueba4")}
      />
    </div>
  )
}
