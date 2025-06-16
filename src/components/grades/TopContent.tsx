/*
import {
    MagnifyingGlassIcon,
    ChevronDownIcon,
  } from "@heroicons/react/24/outline";
  import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
  import { capitalize } from "@/utils/capitalize";
  import { statusOptions } from "@/constants/casesConstants";
  
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
    onResetFilters: () => void;
  }
  
  export default function TopContent({
    usersLength,
    statusFilter,
    filterValue,
    onClear,
    onSearchChange,
    onRowsPerPageChange,
    setStatusFilter,
    onResetFilters,
  }: TopContentProps) {
  
    // Verificar si hay filtros activos
    const hasActiveFilters = Boolean(
      filterValue || // Filtro de búsqueda
      (statusFilter instanceof Set && statusFilter.size > 0) // Filtro de estado
    );
  
    return (
      <div className="flex flex-col">
        <div className="flex justify-between items-center pb-6 border-b">
          <div className="flex gap-3 items-center">
            <Input
              isClearable
              className="w-full sm:max-w-[100%]"
              placeholder="Buscar por nombre completo o tipo de proceso..."
              startContent={<MagnifyingGlassIcon className="w-6" />}
              value={filterValue}
              onClear={() => onClear()}
              onValueChange={onSearchChange}
            />
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
                onSelectionChange={(keys) =>
                  setStatusFilter(keys as Set<string>)
                }
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <div>
              <Button
                color="primary"
                onPress={onResetFilters}
                isDisabled={!hasActiveFilters}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
          <span className="text-default-400 text-small">
            Total {usersLength} calificaciones
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
*/