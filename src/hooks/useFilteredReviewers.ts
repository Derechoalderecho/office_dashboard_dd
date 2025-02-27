import { useMemo } from "react";
import { Reviewers } from "@/types/reviewers";
import { userTypeOptions, siteOptions } from "@/constants/reviewersConstants";

interface UseFilteredItemsProps {
  reviewers: Reviewers[];
  filterValue: string;
  userTypeFilter: string | Set<string>;
  siteFilter: string | Set<string>;
}

export const useFilteredReviewers = ({
  reviewers,
  filterValue,
  userTypeFilter,
  siteFilter,
}: UseFilteredItemsProps) => {
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...reviewers];

    // Search filter
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    // user tpe filter
    if (userTypeFilter !== "all") {
      const selectedStatuses = Array.from(userTypeFilter).map((key) => {
        const userTypeOption = userTypeOptions.find(
          (option) => option.uid === key
        );
        return userTypeOption ? userTypeOption.name : null;
      });

      filteredUsers = filteredUsers.filter((user) =>
        selectedStatuses.includes(user.user_type)
      );
    }

    if (siteFilter !== "all") {
      const selectedSites = Array.from(siteFilter).map((key) => {
        const siteOption = siteOptions.find((option) => option.uid === key);
        return siteOption ? siteOption.name : null;
      });

      filteredUsers = filteredUsers.filter((user) =>
        selectedSites.includes(user.site)
      );
    }

    return filteredUsers;
  }, [reviewers, filterValue, userTypeFilter, siteFilter]);

  return { filteredItems, hasSearchFilter };
};
