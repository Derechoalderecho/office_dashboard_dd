import { SortDescriptor } from "@heroui/react";
import { Cases } from "@/types/cases";
import { Reviewers } from "@/types/reviewers";
import { Users } from "@/types/users";
import { Citizen } from "@/types/citizens";

export const sortItems = <T extends Cases | Reviewers | Users | Citizen>(
  items: T[],
  sortDescriptor: SortDescriptor
): T[] => {
  return [...items].sort((a, b) => {
    const first = a[sortDescriptor.column as keyof T] as unknown as number;
    const second = b[sortDescriptor.column as keyof T] as unknown as number;
    const cmp = first < second ? -1 : first > second ? 1 : 0;

    return sortDescriptor.direction === "descending" ? -cmp : cmp;
  });
};