import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/store/slices/authSlice';

/**
 * Hook personalizado para acceder al rol del usuario actual
 * @returns Objeto con el rol del usuario y estado de carga
 */
export const useUserRole = (): { role: UserRole; loading: boolean } => {
  const { role, loading } = useAppSelector((state) => state.auth);
  
  return { role, loading };
}; 