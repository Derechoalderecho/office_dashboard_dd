// src/utils/sortItems.ts
import { SortDescriptor } from "@heroui/react";
import { Cases } from "@/types/cases";

export const sortItems = (
  items: Cases[],
  sortDescriptor: SortDescriptor
): Cases[] => {
  return [...items].sort((a, b) => {
    const first = a[sortDescriptor.column as keyof Cases] as unknown as number;
    const second = b[sortDescriptor.column as keyof Cases] as unknown as number;
    const cmp = first < second ? -1 : first > second ? 1 : 0;

    return sortDescriptor.direction === "descending" ? -cmp : cmp;
  });
};