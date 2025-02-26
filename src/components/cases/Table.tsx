"use client";

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
import { useState, useCallback, useMemo, useEffect, ChangeEvent } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { parseDateToLocal } from "@/utils/date";
import { capitalize } from "@/utils/capitalize";
import { I18nProvider } from "@react-aria/i18n";
import { CalendarDate } from "@internationalized/date";
import { Cases, RangeValue, DateRange } from "@/types/cases";
import { columns, statusOptions } from "@/constants";
import TopContent from "./TopContent";

type CaseWithKey = Cases & { key: string };

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
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cases, setCases] = useState<CaseWithKey[]>([]);

  type User = Cases;

  useEffect(() => {
    (async () => {
      const casesCollection = collection(db, "cases");
      const casesSnapshot = await getDocs(casesCollection);
      const casesList: CaseWithKey[] = [];
      casesSnapshot.forEach((doc) => {
        const data = doc.data() as Cases;
        casesList.push({ key: doc.id, ...data });
      });
      setCases(casesList);
    })();
  }, []);

  const handleDateRangeChange = (newValue: RangeValue<CalendarDate> | null) => {
    if (!newValue) {
      setDateRange(null);
      return;
    }

    const newDateRange: DateRange = {
      start: {
        year: newValue.start.year,
        month: newValue.start.month,
        day: newValue.start.day,
      },
      end: {
        year: newValue.end.year,
        month: newValue.end.month,
        day: newValue.end.day,
      },
    };

    setDateRange(newDateRange);
  };

  const onSelectionChangeMasiveMenu = (keys: Selection) => {
    setSelectedKeys(keys);
  };

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  //All filters table
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

  const renderCell = useCallback(
    (user: CaseWithKey, columnKey: keyof CaseWithKey) => {
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
              name={user.assigned.name}
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
    },
    []
  );

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
      <TopContent
        usersLength={cases.length}
        onRowsPerPageChange={onRowsPerPageChange}
        handleDateRangeChange={handleDateRangeChange}
        setShowAll={setShowAll}
        setStatusFilter={setStatusFilter}
        onClear={onClear}
        filterValue={filterValue}
        statusFilter={statusFilter as Set<string>}
        showAll={showAll}
        dateRange={dateRange as DateRange}
        onSearchChange={onSearchChange}
      />
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    dateRange,
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
    <>
      {(selectedKeys === "all" || selectedKeys.size > 0) && (
        <aside className="fixed bottom-0 z-50 left-1/2 transform -translate-x-1/2 mb-10">
          <Card shadow="lg" className="bg-[#383838] p-1">
            <CardBody className="!flex flex-row gap-40 justify-between">
              <p className="text-white text-nowrap">
                {selectedKeys === "all"
                  ? "Todos los casos seleccionados"
                  : `${selectedKeys.size} ${
                      selectedKeys.size > 1
                        ? "casos seleccionados"
                        : "caso seleccionado"
                    }`}
              </p>
              <div className="flex items-center gap-4">
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <div className="flex items-center gap-1 cursor-pointer">
                      <CheckBadgeIcon className="w-6 text-white" />
                      <p className="text-white">Estado</p>
                    </div>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" variant="flat">
                    <DropdownSection title="Estado">
                      <DropdownItem key="approved">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#12A150] rounded-full"></div>
                          Aprobado
                        </div>
                      </DropdownItem>
                      <DropdownItem key="action_required">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#C4841D] rounded-full"></div>
                          Acción necesaria
                        </div>
                      </DropdownItem>
                      <DropdownItem key="followed">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#006FEE] rounded-full"></div>
                          Seguimiento
                        </div>
                      </DropdownItem>
                      <DropdownItem key="no_approved">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-[#F31260] rounded-full"></div>
                          No aprobado
                        </div>
                      </DropdownItem>
                    </DropdownSection>
                  </DropdownMenu>
                </Dropdown>
                <div className="border-l border-white h-6 mx-2"></div>
                <div className="flex items-center gap-1">
                  <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                      <div className="flex items-center gap-1 cursor-pointer">
                        <UserCircleIcon className="w-6 text-white" />
                        <p className="text-white">Asignado</p>
                      </div>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Profile Actions" variant="flat">
                      <DropdownSection title="Asignado">
                        <DropdownItem key="user1">
                          <User
                            avatarProps={{
                              radius: "sm",
                              src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                            }}
                            name={"Victor Hugo"}
                          />
                        </DropdownItem>
                        <DropdownItem key="aproved">
                          <User
                            avatarProps={{
                              radius: "sm",
                              src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                            }}
                            name={"Joaquin Fernandez"}
                          />
                        </DropdownItem>
                      </DropdownSection>
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <div className="border-l border-white h-6 mx-2"></div>
                <div className="flex items-center gap-1">
                  <TagIcon className="w-6 text-white" />
                  <p className="text-white">Tags</p>
                </div>
                <div className="border-l border-white h-6 mx-2"></div>
                <TrashIcon className="w-6 text-white" />
              </div>
            </CardBody>
          </Card>
        </aside>
      )}
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
        onSelectionChange={onSelectionChangeMasiveMenu}
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
    </>
  );
}
