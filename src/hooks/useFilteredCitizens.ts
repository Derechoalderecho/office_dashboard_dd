import { useMemo } from "react";
import { Citizen } from "@/types/citizens";
import { siteOptions } from "@/constants/citizensConstants";

interface UseFilteredItemsProps {
  citizens: Citizen[];
  filterValue: string;
  siteFilter: string | Set<string>;
}

export const useFilteredCitizens = ({
  citizens,
  filterValue,
  siteFilter,
}: UseFilteredItemsProps) => {
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredCitizens = [...citizens];

    if (hasSearchFilter) {
      filteredCitizens = filteredCitizens.filter((citizen) =>
        citizen.first_name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (siteFilter !== "all") {
      filteredCitizens = filteredCitizens.filter((citizen) =>
        siteOptions.some((site) => site.uid === citizen.site)
      );
    }

    return filteredCitizens;
  }, [citizens, filterValue, siteFilter]);

  return { filteredItems, hasSearchFilter };
};
