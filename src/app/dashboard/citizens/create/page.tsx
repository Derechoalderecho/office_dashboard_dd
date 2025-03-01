import StepperForm from "@/components/forms/stepperForm/StepperForm"
import { fetchAllCases } from "@/services/caseService";


export default async function CreateCitizenPage() {
  const cases = await fetchAllCases();
  console.log(cases);
  return (
    <div>
      <h1>Hola</h1>
    </div>
  )
}
