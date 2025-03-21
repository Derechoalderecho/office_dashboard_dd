import { fetchCasesByCitizenId } from "@/services/caseService"
//import { fetchAllCases } from "@/actions/testFetch";
import { fetchAllCases } from "@/actions/testFetch";
import { fetchCaseById } from "@/services/caseService";


export default async function page() {
    const cases = await fetchCasesByCitizenId(parseInt("18"));
    const allCases = await fetchAllCases();
    const caseById = await fetchCaseById(parseInt("18"));
    console.log(caseById);
 
    //console.log(allCases);
    //console.log(cases);
  return (
    <div>page</div>
  )
}
