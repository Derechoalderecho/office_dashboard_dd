import { fetchCasesByCitizenId } from "@/services/caseService"


export default async function page() {
    const cases = await fetchCasesByCitizenId(parseInt("18"));
    console.log(cases);
  return (
    <div>page</div>
  )
}
