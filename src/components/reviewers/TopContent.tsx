import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { DropdownItem, DropdownMenu } from "@heroui/react";
import { Button } from "@heroui/react";
import { DropdownTrigger } from "@heroui/react";
import { Dropdown } from "@heroui/react";
import { Input } from "@heroui/react";
import { statusOptions } from "@/constants/reviewersConstants";
import { capitalize } from "@/utils/capitalize";
import React from "react";

interface TopContentProps {
  usersLength: number;
  statusFilter: Set<string>;
  showAll: boolean;
  filterValue: string;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  setShowAll: (value: boolean) => void;
  setStatusFilter: (value: Set<string>) => void;
}

export default function TopContent({
  usersLength,
  statusFilter,
  showAll,
  setShowAll,
  filterValue,
  onClear,
  onSearchChange,
  onRowsPerPageChange,
  setStatusFilter,
}: TopContentProps) {

  return (
    <div className="flex flex-col">
      <div className="flex gap-3 items-center pb-6 border-b">
        <Input
          isClearable
          className="w-full sm:max-w-[25%]"
          placeholder="Buscar por nombre..."
          startContent={<MagnifyingGlassIcon className="w-6" />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<ChevronDownIcon className="text-small w-4" />}
                variant="bordered"
              >
                Estado
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode="multiple"
              onSelectionChange={(keys) => setStatusFilter(keys as Set<string>)}
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {capitalize(status.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div>
          <Button color="primary" onPress={() => setShowAll(!showAll)}>
            Mostrar todos
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center mt-6">
        <span className="text-default-400 text-small">
          Total {usersLength} casos
        </span>
        <label className="flex items-center text-default-400 text-small">
          Fila por pagina:
          <select
            className="text-small rounded-sm"
            onChange={onRowsPerPageChange}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
      </div>
    </div>
  );
}
