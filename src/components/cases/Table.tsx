"use client";

import React, { SVGProps, Key, ChangeEvent } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Chip,
  User,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Card,
  CardBody,
  Input,
  Pagination,
  Selection,
  ChipProps,
  SortDescriptor,
  DateRangePicker,
} from "@heroui/react";
import {
  ClockIcon,
  EyeIcon,
  PencilIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
  CheckBadgeIcon,
  TagIcon,
  UserCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useFetchCollection } from "@/hooks/useFetchCollection";
import { Cases } from "@/types/cases";
import { useState, useCallback, useMemo, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseDateToLocal } from "@/utils/date";
import { capitalize } from "@/utils/capitalize";
import { I18nProvider } from "@react-aria/i18n";

type Column = {
  name: string;
  uid: string;
  sortable?: boolean;
};

type StatusOption = {
  name: string;
  uid: string;
};

const columns = [
  { name: "Creado en", uid: "created" },
  { name: "Actualizado en", uid: "update" },
  { name: "Tipo de proceso", uid: "proccess_type", sortable: true },
  { name: "Estado", uid: "status", sortable: true },
  { name: "Cliente", uid: "name" },
  { name: "Tiempo Respuesta", uid: "response_time", sortable: true },
  { name: "Asignado", uid: "assigned", sortable: true },
  { name: "Acciones", uid: "actions" },
];

const statusOptions = [
  { name: "Seguimiento", uid: "follow_up" },
  { name: "Aprobado", uid: "aproved" },
  { name: "No Aprobado", uid: "not_approved" },
  { name: "Acción Necesaria", uid: "action_required" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "created",
  "update",
  "proccess_type",
  "status",
  "name",
  "response_time",
  "assigned",
  "actions",
];

export default function App() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [cases, setCases] = useState<Cases[]>([]);

  type User = Cases;

  useEffect(() => {
    (async () => {
      const casesCollection = collection(db, "cases");
      const casesSnapshot = await getDocs(casesCollection);
      const casesList: Cases[] = [];
      casesSnapshot.forEach((doc) => {
        const data = doc.data() as Cases;
        casesList.push({ key: doc.id, ...data });
      });
      setCases(casesList);
    })();
  }, []);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
      if (visibleColumns === "all") return columns;
  
      return columns.filter((column) =>
        Array.from(visibleColumns).includes(column.uid)
      );
    }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...cases];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      const selectedStatuses = Array.from(statusFilter).map((key) => {
        const statusOption = statusOptions.find((option) => option.uid === key);
        return statusOption ? statusOption.name : null;
      });

      filteredUsers = filteredUsers.filter((user) =>
        selectedStatuses.includes(user.status)
      );
    }

    return filteredUsers;
  }, [cases, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a: User, b: User) => {
      const first = a[sortDescriptor.column as keyof User] as unknown as number;
      const second = b[
        sortDescriptor.column as keyof User
      ] as unknown as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((user: User, columnKey: keyof User) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "created":
        return (
          <div className="flex flex-col">
            <p className="font-medium text-sm">
              {parseDateToLocal(cellValue as string | number | Date)}
            </p>
          </div>
        );
      case "update":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-medium">
              {parseDateToLocal(cellValue as string | number | Date)}
            </p>
          </div>
        );
      case "proccess_type":
        return (
          <div className="flex flex-col">
            <p className="text-sm">{String(cellValue)}</p>
          </div>
        );
      case "status":
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
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-sm font-semibold">{String(cellValue)}</p>
            {user.email && <p className="text-sm">{user.email}</p>}
            {user.phone && <p className="text-sm">{user.phone}</p>}
          </div>
        );
      case "response_time":
        return (
          <div className="flex gap-2 items-center">
            <ClockIcon className="w-6 text-[#12A150]" />
            <p className="text-sm font-semibold text-[#12A150]">
              {String(cellValue)} Horas
            </p>
          </div>
        );
      case "assigned":
        return (
          <User
            avatarProps={{ radius: "lg", src: user.assigned.avatar }}
            name={cellValue.name}
          />
        );
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            <Tooltip content="Vista previa">
              <Button
                isIconOnly
                className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <EyeIcon className="w-6" />
              </Button>
            </Tooltip>
            <Tooltip content="Editar cliente">
              <Button
                isIconOnly
                className="bg-transparent text-lg text-default-400 cursor-pointer active:opacity-50"
              >
                <PencilIcon className="w-6" />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e.target.value));
      setPage(1);
    },
    []
  );

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(() => {
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
                onSelectionChange={setStatusFilter}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
          <I18nProvider locale="es-ES">
            <DateRangePicker
              variant="bordered"
              label="Buscar por fecha"
              className="max-w-xs"
            />
          </I18nProvider>
          <div>
            <Button color="primary" onPress={() => setShowAll(!showAll)}>
              Mostrar todos
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-6">
          <span className="text-default-400 text-small">
            Total {cases.length} casos
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
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    cases.length,
    hasSearchFilter,
  ]);

  const bottomContent = useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
        />
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <Table
      suppressHydrationWarning
      isHeaderSticky
      aria-label="Tabla de casos"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-w-[100%]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
            className="text-base"
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody emptyContent={"Casos no encontrados"} items={sortedItems}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
