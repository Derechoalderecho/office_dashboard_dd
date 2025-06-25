"use client";

import { fetchCompleteUserCases } from "@/services/completeUserCasesService";
import { fetchUserByFirebaseUid } from "@/services/userByFirebaseService";
import { getUserIdFromFirebaseUid } from "@/services/userByFirebaseService";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function page() {

    const { user, role, token, loading, error } = useAuth();

   useEffect(() => {
       console.log('=== TOKEN DE AUTENTICACIÓN FIREBASE ===');
       console.log(token);
       console.log('======================================');
     }, [token]);

  return (
    <div>page</div>
  )
}
