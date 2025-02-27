import { useMemo } from 'react';
import { Reviewers } from '@/types/reviewers';
import { statusOptions } from '@/constants/reviewersConstants';

interface UseFilteredItemsProps {
  reviewers: Reviewers[];
  filterValue: string;
  userTypeFilter: string | Set<string>;
}

export const useFilteredReviewers = ({
  reviewers,
  filterValue,
  userTypeFilter,
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
        const statusOption = statusOptions.find((option) => option.uid === key);
        return statusOption ? statusOption.name : null;
      });

      filteredUsers = filteredUsers.filter((user) =>
        selectedStatuses.includes(user.user_type)
      );
    }

   
    return filteredUsers;
  }, [reviewers, filterValue, userTypeFilter]);

  return { filteredItems, hasSearchFilter };
};