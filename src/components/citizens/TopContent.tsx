import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { DropdownItem, DropdownMenu } from "@heroui/react";
import { Button, Dropdown, DropdownTrigger, Input } from "@heroui/react";
import { siteOptions } from "@/constants/citizensConstants";
import { capitalize } from "@/utils/capitalize";

interface TopContentProps {
  usersLength: number;
  siteFilter: Set<string>;
  showAll: boolean;
  filterValue: string;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  setShowAll: (value: boolean) => void;
  setSiteFilter: (value: Set<string>) => void;
}

export default function TopContent({
  usersLength,
  siteFilter,
  setSiteFilter,
  showAll,
  setShowAll,
  filterValue,
  onClear,
  onSearchChange,
  onRowsPerPageChange,
}: TopContentProps) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center pb-6 border-b">
        <div className="flex gap-3 items-center">
          <Input
            isClearable
            className="w-full sm:max-w-[100%]"
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
                  Sede
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={siteFilter}
                selectionMode="multiple"
                onSelectionChange={(keys) => setSiteFilter(keys as Set<string>)}
              >
                {siteOptions.map((status) => (
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
        <Button color="primary" startContent={<UserPlusIcon className="w-5" />}>
          Añadir ciudadano
        </Button>
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
