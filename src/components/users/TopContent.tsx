"use client";

import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownItem,
  DropdownMenu,
  Button,
  DropdownTrigger,
  Dropdown,
  Input,
  Tab,
  Tabs,
} from "@heroui/react";
import { capitalize } from "@/utils/capitalize";
import { siteOptions, userTypeOptions } from "@/constants/usersConstants";
import { useState } from "react";

interface TopContentProps {
  usersLength: number;
  userTypeFilter: Set<string>;
  siteFilter: Set<string>;
  showAll: boolean;
  filterValue: string;
  selectedTab: "all" | "active" | "inactive";
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  setShowAll: (value: boolean) => void;
  setUserTypeFilter: (value: Set<string>) => void;
  setSiteFilter: (value: Set<string>) => void;
  setSelectedTab: (tab: "all" | "active" | "inactive") => void;
}

export default function TopContent({
  usersLength,
  userTypeFilter,
  siteFilter,
  setUserTypeFilter,
  setSiteFilter,
  showAll,
  setShowAll,
  filterValue,
  onClear,
  onSearchChange,
  onRowsPerPageChange,
  selectedTab,
  setSelectedTab,
}: TopContentProps) {

  return (
    <>
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
                  Tipo de usuario
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={userTypeFilter}
                selectionMode="multiple"
                onSelectionChange={(keys) =>
                  setUserTypeFilter(keys as Set<string>)
                }
              >
                {userTypeOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
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
        <Tabs
        className="mt-6"
        aria-label="Filter users"
        selectedKey={selectedTab}
        onSelectionChange={(key) =>
          setSelectedTab(key as "all" | "active" | "inactive")
        }
      >
        <Tab key="all" title="Todos" />
        <Tab key="active" title="Activos" />
        <Tab key="inactive" title="Inactivos" />
      </Tabs>
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

    </>
  );
}
