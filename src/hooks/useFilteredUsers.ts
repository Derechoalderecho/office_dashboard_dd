import { useMemo } from "react";
import { Users } from "@/types/users";
import { userTypeOptions, siteOptions } from "@/constants/usersConstants";

interface UseFilteredItemsProps {
  users: Users[];
  filterValue: string;
  userTypeFilter: string | Set<string>;
  siteFilter: string | Set<string>;
  selectedTab: "all" | "active" | "inactive";
  
}

export const useFilteredUsers = ({
  users,
  filterValue,
  userTypeFilter,
  siteFilter,
  selectedTab,
}: UseFilteredItemsProps) => {
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...users];

    // Search filter
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.primer_nombre.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // user role filter
    if (userTypeFilter !== "all") {
      const selectedStatuses = Array.from(userTypeFilter).map((key) => {
        const userTypeOption = userTypeOptions.find(
          (option) => option.uid === key
        );
        return userTypeOption ? userTypeOption.name : null;
      });

      filteredUsers = filteredUsers.filter((user) =>
        selectedStatuses.includes(user.rol)
      );
    }
 /*
    if (siteFilter !== "all") {
      const selectedSites = Array.from(siteFilter).map((key) => {
        const siteOption = siteOptions.find((option) => option.uid === key);
        return siteOption ? siteOption.name : null;
      });

      filteredUsers = filteredUsers.filter((user) =>
        selectedSites.includes(user.site)
      );
    }

    // Filter by tab
    if (selectedTab !== "all") {
      filteredUsers = filteredUsers.filter((user) => 
        selectedTab === "active" ? user.is_active : !user.is_active
      );
    }
      */

    return filteredUsers;
  }, [users, filterValue, userTypeFilter, siteFilter, selectedTab]);

  return { filteredItems, hasSearchFilter };
};
