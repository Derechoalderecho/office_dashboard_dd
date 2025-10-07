import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserData, logout as logoutThunk, setToken, setLoading } from '@/store/slices/authSlice';
import { useEffect, useRef } from 'react';
import { onAuthStateChanged, getIdToken, onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Guard global para evitar llamadas concurrentes a /usuarios/me
let isFetchingUser = false;

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, token, initialized } = useAppSelector((state) => state.auth);
  const hasLoadedUser = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser);
          dispatch(setToken(idToken));
          // Evitar múltiples llamadas desde distintas instancias de useAuth
          if (!initialized && !hasLoadedUser.current && !isFetchingUser) {
            isFetchingUser = true;
            try {
              await dispatch(fetchUserData()).unwrap();
              hasLoadedUser.current = true;
            } finally {
              isFetchingUser = false;
            }
          }
        } catch (e) {
          console.error('useAuth: Error al obtener token o datos del usuario:', e);
          hasLoadedUser.current = false;
        }
      } else {
        dispatch(setToken(null));
        hasLoadedUser.current = false;
        // Importante: si no hay usuario autenticado, finalizar carga global
        dispatch(setLoading(false));
      }
    });

    const tokenUnsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser);
          dispatch(setToken(idToken));
        } catch (e) {
          console.error('useAuth: Error al actualizar token de autenticación:', e);
        }
      } else {
        dispatch(setToken(null));
      }
    });

    return () => {
      unsubscribe();
      tokenUnsubscribe();
    };
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch (e) {
      console.error('Error signing out:', e);
      throw e;
    }
  };

  return {
    user,
    loading,
    error,
    token,
    // Helpers de acceso rápido
    userId: user?.id,
    userEmail: user?.email,
    userName: user ? `${user.primer_nombre} ${user.primer_apellido}` : null,
    userFullName: user ? `${user.primer_nombre} ${user.segundo_nombre || ''} ${user.primer_apellido} ${user.segundo_apellido || ''}`.trim() : null,
    userRole: user?.rol?.nombre || null,
    userAreas: user?.areas_atencion || [],
    userUniversities: user?.universidades || [],
    // Métodos
    logout: handleLogout,
  };
};