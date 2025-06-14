import { fetchCasesByCitizenId } from "@/services/caseService"
import { fetchAllCases } from "@/services/caseService";
import { fetchCaseById } from "@/services/caseService";
import { fetchCasesByUserId } from "@/services/caseService";
import { fetchCompleteUserCases } from "@/services/completeUserCasesService";


export default async function page() {
    //const cases = await fetchCasesByCitizenId(parseInt("18"));
    //const allCases = await fetchAllCases();
    //const caseById = await fetchCaseById(parseInt("18"));
    //const casesByUserId = await fetchCasesByUserId(parseInt("18"));

    //console.log(caseById);
    //console.log(casesByUserId);
    //console.log(allCases);
    //console.log(cases);
    const completeCases = await fetchCompleteUserCases(parseInt("3"));
    console.log(completeCases);
  return (
    <div>page</div>
  )
}
