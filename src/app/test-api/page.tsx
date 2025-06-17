"use client";

import { fetchCasesByCitizenId } from "@/services/caseService"
import { fetchAllCases } from "@/services/caseService";
import { fetchCaseById } from "@/services/caseService";
import { fetchCasesByUserId } from "@/services/caseService";
import { fetchCompleteUserCases } from "@/services/completeUserCasesService";
import { fetchUserByFirebaseUid } from "@/services/userByFirebaseService";
import { getUserIdFromFirebaseUid } from "@/services/userByFirebaseService";
import { useAuth } from "@/hooks/useAuth";

export default function page() {

    const { user, role, loading, error } = useAuth();

    console.log(user);
    console.log(role);

  return (
    <div>page</div>
  )
}
