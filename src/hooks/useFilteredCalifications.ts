/*

import { useMemo } from 'react';
import { CaseWithKey } from '@/types/cases';
import { statusOptions } from '@/constants/casesConstants';
import { Selection } from '@heroui/react';

interface UseFilteredCalificationsProps {
  cases: CaseWithKey[];
  filterValue: string;
  statusFilter: Selection;
  onResetFilters?: () => void;
}

export function useFilteredCalifications({
  cases,
  filterValue,
  statusFilter,
  onResetFilters,
}: UseFilteredCalificationsProps) {
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredCases = [...cases];
    
    // Search filter
    if (filterValue.trim()) {
      const searchTerm = filterValue.toLowerCase().trim();
      
      filteredCases = filteredCases.filter(caseItem => {
        // Get the searchable fields and handle null/undefined values safely
        const firstName = caseItem.ciudadano?.primer_nombre?.toLowerCase() || '';
        const lastName = caseItem.ciudadano?.primer_apellido?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const tipoProcesoLower = caseItem.tipo_proceso?.toLowerCase() || '';
        const calificacionLower = typeof caseItem.calificacion === 'string' ? caseItem.calificacion.toLowerCase() : '';
        
        // Check if the search term is contained in any of the fields
        return (
          fullName.includes(searchTerm) || 
          firstName.includes(searchTerm) || 
          lastName.includes(searchTerm) || 
          tipoProcesoLower.includes(searchTerm) || 
          calificacionLower.includes(searchTerm)
        );
      });
    }
    
    // Status filter
    if (statusFilter !== "all" && statusFilter instanceof Set && statusFilter.size > 0) {
      const selectedStatuses = Array.from(statusFilter as Set<string>).map((key) => {
        const statusOption = statusOptions.find((option) => option.uid === key);
        return statusOption ? statusOption.uid : null;
      }).filter(Boolean);

      filteredCases = filteredCases.filter((caseItem) =>
        selectedStatuses.includes(caseItem.estado)
      );
    }

    return filteredCases;
  }, [cases, filterValue, statusFilter]);

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
} 

*/