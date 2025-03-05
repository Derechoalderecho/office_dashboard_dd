import { fetchCasesByCitizenId } from "@/services/caseService"
//import { fetchAllCases } from "@/actions/testFetch";
import { fetchAllCases } from "@/actions/testFetch";


export default async function page() {
    const cases = await fetchCasesByCitizenId(parseInt("18"));
    const allCases = await fetchAllCases();
 
    //console.log(allCases);
    //console.log(cases);
  return (
    <div>page</div>
  )
}
