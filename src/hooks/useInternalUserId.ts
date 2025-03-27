'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getUserIdFromFirebase } from '@/services/userService';

export const useInternalUserId = () => {
  const { user } = useAuth();
  const [internalUserId, setInternalUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInternalUserId() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log(`Obteniendo ID interno para usuario Firebase: ${user.uid}`);
        
        const userId = await getUserIdFromFirebase(user.uid);
        
        if (userId) {
          console.log(`ID interno obtenido: ${userId}`);
          setInternalUserId(userId);
        } else {
          setError("No se pudo obtener el ID de usuario interno");
          console.error("No se pudo obtener el ID de usuario interno para", user.uid);
        }
      } catch (err) {
        console.error("Error al obtener ID interno:", err);
        setError(`Error al obtener ID de usuario: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInternalUserId();
  }, [user]);

  return { internalUserId, isLoading, error };
} 