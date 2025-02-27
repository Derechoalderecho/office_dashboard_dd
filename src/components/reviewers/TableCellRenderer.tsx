"use client";

import { Chip } from "@heroui/react";
import { ReviewerWithKey } from "@/types/reviewers";

interface TableCellRendererProps {
  user: ReviewerWithKey;
  columnKey: keyof ReviewerWithKey;
}

export const TableCellRendererReviewers = ({
  user,
  columnKey,
}: TableCellRendererProps) => {
  const cellValue = user[columnKey];

  switch (columnKey) {
    case "name":
      return (
        <div className="flex flex-col">
          <p className="text-base font-semibold">{String(cellValue)}</p>
        </div>
      );
    case "user_type":
      return (
        <Chip
          className={`capitalize ${
            cellValue === "Aprobado"
              ? "bg-success text-[#12A150]"
              : cellValue === "Seguimiento"
              ? "bg-followed text-[#006FEE]"
              : cellValue === "Acción Necesaria"
              ? "bg-warning text-[#C4841D]"
              : cellValue === "No Aprobado"
              ? "bg-error text-[#F31260]"
              : ""
          }`}
          size="sm"
          variant="flat"
        >
          {String(cellValue)}
        </Chip>
      );
    case "assigned_areas":
      return (
        <div className="flex flex-col">
          <p className="text-base font-semibold">{String(cellValue)}</p>
        </div>
      );
    case "email":
      return (
        <div className="flex flex-col">
          <p className="text-base font-semibold text-primary">
            {String(cellValue)}
          </p>
        </div>
      );
    case "queries_number":
      return (
        <div className="flex flex-col">
          <p className="text-base">{String(cellValue)}</p>
        </div>
      );
    case "procceses_number":
      return (
        <div className="flex flex-col">
          <p className="text-base">{String(cellValue)}</p>
        </div>
      );
    default:
      return cellValue;
  }
};
