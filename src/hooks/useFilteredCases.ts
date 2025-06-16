import { useMemo } from 'react';
import { CaseWithKey } from '@/types/cases';
import { DateRange } from '@/types/sharedTypes';
import { statusOptions } from '@/constants/casesConstants';
import { transformStateByRole } from '@/utils/stateTransformer';
import { UserRole } from '@/store/slices/authSlice';

interface UseFilteredItemsProps {
  cases: CaseWithKey[];
  filterValue: string;
  statusFilter: string | Set<string>;
  dateRange: DateRange | null;
  onResetFilters?: () => void;
  userRole?: UserRole;
}

export const useFilteredItems = ({
  cases,
  filterValue,
  statusFilter,
  dateRange,
  onResetFilters,
  userRole,
}: UseFilteredItemsProps) => {
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...cases];
    
    // Search filter
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.ciudadano.primer_nombre.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      const selectedStatuses = Array.from(statusFilter).map((key) => {
        const statusOption = statusOptions.find((option) => option.uid === key);
        return statusOption ? statusOption.name : null;
      });

      filteredUsers = filteredUsers.filter((user) => {
        // Comprueba si el estado real coincide directamente
        if (selectedStatuses.includes(user.estado_actual)) {
          return true;
        }
        
        // Si tenemos un rol, comprueba si el estado transformado según el rol coincide
        if (userRole) {
          const transformedState = transformStateByRole(user.estado_actual, userRole);
          return selectedStatuses.includes(transformedState);
        }
        
        return false;
      });
    }

    // Date range filter
    if (dateRange && dateRange.start && dateRange.end) {
      const { start, end } = dateRange;
      const startDate = new Date(start.year, start.month - 1, start.day);
      const endDate = new Date(end.year, end.month - 1, end.day);

      filteredUsers = filteredUsers.filter((user) => {
        const userDate = new Date(user.created_date);
        if (isNaN(userDate.getTime())) {
          console.error(`Invalid date for user: ${user.id_caso}`, user.created_date);
          return false;
        }

        return userDate >= startDate && userDate <= endDate;
      });
    }

    // Ya no hacemos filtrado por pestaña o usuario, siempre mostramos todos los casos

    return filteredUsers;
  }, [cases, filterValue, statusFilter, dateRange]);

  const resetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
    }
  };

  return { 
    filteredItems, 
    hasSearchFilter,
    resetFilters 
  };
};