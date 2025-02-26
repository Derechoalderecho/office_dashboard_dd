import { useMemo } from 'react';
import { Cases } from '@/types/cases';
import { DateRange } from '@/types/cases';
import { statusOptions } from '@/constants';

interface UseFilteredItemsProps {
  cases: (Cases & { key: string })[];
  filterValue: string;
  statusFilter: string | Set<string>;
  dateRange: DateRange | null;
}

export const useFilteredItems = ({
  cases,
  filterValue,
  statusFilter,
  dateRange,
}: UseFilteredItemsProps) => {
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...cases];
    
    // Search filter
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter !== "all") {
      const selectedStatuses = Array.from(statusFilter).map((key) => {
        const statusOption = statusOptions.find((option) => option.uid === key);
        return statusOption ? statusOption.name : null;
      });

      filteredUsers = filteredUsers.filter((user) =>
        selectedStatuses.includes(user.status)
      );
    }

    // Date range filter
    if (dateRange && dateRange.start && dateRange.end) {
      const { start, end } = dateRange;
      const startDate = new Date(start.year, start.month - 1, start.day);
      const endDate = new Date(end.year, end.month - 1, end.day);

      filteredUsers = filteredUsers.filter((user) => {
        const userDate = new Date(user.created);
        if (isNaN(userDate.getTime())) {
          console.error(`Invalid date for user: ${user.id}`, user.created);
          return false;
        }

        return userDate >= startDate && userDate <= endDate;
      });
    }

    return filteredUsers;
  }, [cases, filterValue, statusFilter, dateRange]);

  return { filteredItems, hasSearchFilter };
};