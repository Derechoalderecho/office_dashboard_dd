"use client";

import { fetchCompleteUserCases } from "@/services/completeUserCasesService";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function page() {

    const { user, role, token, loading, error } = useAuth();

   useEffect(() => {
       console.log('=== TOKEN DE AUTENTICACIÓN FIREBASE ===');
       console.log(token);
       console.log('======================================');
     }, [token]);

     useEffect(() => {
        console.log('=== USER DE AUTENTICACIÓN FIREBASE ===');
        console.log(user);
        console.log('======================================');
      }, [user]);

  return (
    <div>page</div>
  )
}
