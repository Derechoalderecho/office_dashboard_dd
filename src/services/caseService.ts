import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cases, CaseWithKey } from "@/types/cases";

export const fetchCaseDetails = async (id: string): Promise<Cases | null> => {
  const caseDoc = await getDoc(doc(db, "cases", id));
  if (!caseDoc.exists()) {
    return null;
  }
  return caseDoc.data() as Cases;
};

export const fetchAllCases = async (): Promise<Cases[]> => {
  const casesCollection = collection(db, "cases");
  const casesSnapshot = await getDocs(casesCollection);
  const casesList: CaseWithKey[] = [];
  casesSnapshot.forEach((doc) => {
    const data = doc.data() as Cases;
    casesList.push({ key: doc.id, ...data });
  });
  return casesList;
};