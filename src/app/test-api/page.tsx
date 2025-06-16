import { fetchCasesByCitizenId } from "@/services/caseService"
import { fetchAllCases } from "@/services/caseService";
import { fetchCaseById } from "@/services/caseService";
import { fetchCasesByUserId } from "@/services/caseService";
import { fetchCompleteUserCases } from "@/services/completeUserCasesService";
import { fetchUserByFirebaseUid } from "@/services/userByFirebaseService";
import { getUserIdFromFirebaseUid } from "@/services/userByFirebaseService";


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
    const user = await fetchUserByFirebaseUid("4LVEA2Ir2yNuGXMmIeRsuC9RssE3");
    const userId = await getUserIdFromFirebaseUid("4LVEA2Ir2yNuGXMmIeRsuC9RssE3");
    console.log(completeCases);
    console.log(user);
    console.log(userId);
  return (
    <div>page</div>
  )
}
