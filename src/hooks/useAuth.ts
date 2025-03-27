import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signUp, signIn, logout, resetPassword, setUser, setUserRole, UserRole } from '@/store/slices/authSlice';
import { useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserRoleFromFirebase } from '@/services/userService';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const serializedUser = serializeUser(firebaseUser);
      dispatch(setUser(serializedUser));
      
      // Si hay un usuario autenticado, obtener su rol
      if (firebaseUser) {
        try {
          const userRole = await getUserRoleFromFirebase(firebaseUser.uid);
          dispatch(setUserRole(userRole as UserRole));
        } catch (error) {
          console.error('Error al obtener el rol del usuario:', error);
        }
      } else {
        dispatch(setUserRole(null));
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
    resetPassword: handleResetPassword
  };
}; 