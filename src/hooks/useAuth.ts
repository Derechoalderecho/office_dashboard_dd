import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signUp, signIn, logout, resetPassword, setUser, setUserRole, setToken, UserRole } from '@/store/slices/authSlice';
import { useEffect } from 'react';
import { onAuthStateChanged, User, getIdToken, onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserRoleFromFirebaseUid } from '@/services/userAuthService';

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
  const { user, role, loading, error, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    console.log('useAuth: Estado inicial - Role:', role);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('useAuth: Firebase auth state changed:', firebaseUser ? `Usuario ID: ${firebaseUser.uid}` : 'No hay usuario');
      const serializedUser = serializeUser(firebaseUser);
      dispatch(setUser(serializedUser));
      
      // Obtener y guardar el token de autenticación
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser);
          dispatch(setToken(idToken));
          console.log('useAuth: Token de autenticación obtenido:', idToken);
        } catch (error) {
          console.error('useAuth: Error al obtener token de autenticación:', error);
        }
      } else {
        dispatch(setToken(null));
      }
      
      // Si hay un usuario autenticado, obtener su rol e ID interno
      if (firebaseUser) {
        try {
          console.log('useAuth: Obteniendo rol para el usuario con UID:', firebaseUser.uid);
          const userRole = await getUserRoleFromFirebaseUid(firebaseUser.uid);
          console.log('useAuth: Rol obtenido del servicio:', userRole);
          dispatch(setUserRole(userRole as UserRole));
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        }
      } else {
        console.log('useAuth: No hay usuario, estableciendo rol como null');
        dispatch(setUserRole(null));
      }
    });

    // Suscripción a cambios en el token de ID
    const tokenUnsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await getIdToken(firebaseUser);
          dispatch(setToken(idToken));
          console.log('useAuth: Token de autenticación actualizado automáticamente');
        } catch (error) {
          console.error('useAuth: Error al actualizar token de autenticación:', error);
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
    token,
    signUp: handleSignUp,
    signIn: handleSignIn,
    logout: handleLogout,
    resetPassword: handleResetPassword
    // Se eliminaron las propiedades relacionadas con ID interno
  };
}; 