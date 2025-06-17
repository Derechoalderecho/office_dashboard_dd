import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signUp, signIn, logout, resetPassword, setUser, setUserRole, UserRole } from '@/store/slices/authSlice';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserRoleFromFirebaseUid, getUserIdFromFirebaseUid } from '@/services/userAuthService';

// Función para extraer solo las propiedades serializables del usuario
const serializeUser = (user: User | null) => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber,
    isAnonymous: user.isAnonymous,
    providerData: user.providerData.map(provider => ({
      providerId: provider.providerId,
      uid: provider.uid,
      displayName: provider.displayName,
      email: provider.email,
      phoneNumber: provider.phoneNumber,
      photoURL: provider.photoURL
    }))
  };
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, role, loading, error } = useAppSelector((state) => state.auth);
  
  // Estados para el ID interno del usuario (similar a useInternalUserId)
  const [internalUserId, setInternalUserId] = useState<number | null>(null);
  const [isLoadingId, setIsLoadingId] = useState(true);
  const [idError, setIdError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useAuth: Estado inicial - Role:', role);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('useAuth: Firebase auth state changed:', firebaseUser ? `Usuario ID: ${firebaseUser.uid}` : 'No hay usuario');
      const serializedUser = serializeUser(firebaseUser);
      dispatch(setUser(serializedUser));
      
      // Si hay un usuario autenticado, obtener su rol e ID interno
      if (firebaseUser) {
        try {
          console.log('useAuth: Obteniendo rol para el usuario con UID:', firebaseUser.uid);
          const userRole = await getUserRoleFromFirebaseUid(firebaseUser.uid);
          console.log('useAuth: Rol obtenido del servicio:', userRole);
          dispatch(setUserRole(userRole as UserRole));
          
          // Obtener ID interno (integración de useInternalUserId)
          try {
            setIsLoadingId(true);
            setIdError(null);
            console.log(`useAuth: Obteniendo ID interno para usuario Firebase: ${firebaseUser.uid}`);
            
            const userId = await getUserIdFromFirebaseUid(firebaseUser.uid);
            
            if (userId) {
              console.log(`useAuth: ID interno obtenido: ${userId}`);
              setInternalUserId(userId);
            } else {
              setIdError("No se pudo obtener el ID de usuario interno");
              console.error("useAuth: No se pudo obtener el ID de usuario interno para", firebaseUser.uid);
            }
          } catch (err) {
            console.error("useAuth: Error al obtener ID interno:", err);
            setIdError(`Error al obtener ID de usuario: ${err instanceof Error ? err.message : String(err)}`);
          } finally {
            setIsLoadingId(false);
          }
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        }
      } else {
        console.log('useAuth: No hay usuario, estableciendo rol e ID como null');
        dispatch(setUserRole(null));
        setInternalUserId(null);
        setIsLoadingId(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    try {
      await dispatch(signUp({ email, password, displayName })).unwrap();
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      await dispatch(signIn({ email, password })).unwrap();
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(setUserRole(null));
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await dispatch(resetPassword(email)).unwrap();
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  return {
    user,
    role,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    logout: handleLogout,
    resetPassword: handleResetPassword,
    // Agregamos las propiedades del useInternalUserId
    internalUserId,
    isLoadingId,
    idError
  };
}; 