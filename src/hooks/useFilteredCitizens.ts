import { useMemo } from "react";
import { Citizen } from "@/types/citizens";
import { siteOptions } from "@/constants/citizensConstants";

interface UseFilteredItemsProps {
  citizens: Citizen[];
  filterValue: string;
  siteFilter: string | Set<string>;
  onResetFilters?: () => void;
}

export const useFilteredCitizens = ({
  citizens,
  filterValue,
  siteFilter,
  onResetFilters,
}: UseFilteredItemsProps) => {
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredCitizens = [...citizens];

    if (hasSearchFilter) {
      filteredCitizens = filteredCitizens.filter((ciudadano) =>
        ciudadano.primer_nombre.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
/*
    if (siteFilter !== "all") {
      filteredCitizens = filteredCitizens.filter((citizen) =>
        siteOptions.some((site) => site.uid === citizen.site)
      );
    }
*/
    return filteredCitizens;
  }, [citizens, filterValue, /*siteFilter*/]);

  const resetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
    }
  };

  return { filteredItems, hasSearchFilter, resetFilters };
};
