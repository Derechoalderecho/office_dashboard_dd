import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Cases, CaseWithKey } from "@/types/cases";
import { ReviewerWithKey } from "@/types/reviewers";

export async function fetchAllReviewers(): Promise<ReviewerWithKey[]> {
  const reviewersCollection = collection(db, "reviewers");
  const reviewersSnapshot = await getDocs(reviewersCollection);
  
  return reviewersSnapshot.docs.map(doc => ({
    key: doc.id,
    ...doc.data()
  })) as ReviewerWithKey[];
}
