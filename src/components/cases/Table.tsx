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
  Selection,
  SortDescriptor,
} from "@heroui/react";
import { ClockIcon, EyeIcon, PencilIcon } from "@heroicons/react/24/outline";
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
import { CalendarDate } from "@internationalized/date";
import { Cases, RangeValue, DateRange } from "@/types/cases";
import { columns, statusOptions } from "@/constants";
import TopContent from "./TopContent";
import BottomContent from "./BottomContent";
import { useFilteredItems } from "@/hooks/useFilteredCases";
import { sortItems } from "@/utils/sortItems";
import { paginateItems } from "@/utils/paginateItems";
import { CaseWithKey } from "@/types/cases";
import { TableCellRenderer } from "./TableCellRenderer";
import { BulkActionsBar } from "./BulkActionsBar";

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

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const { filteredItems, hasSearchFilter } = useFilteredItems({
    cases,
    filterValue,
    statusFilter: statusFilter as string | Set<string>,
    dateRange,
  });

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    return paginateItems(filteredItems, page, rowsPerPage);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return sortItems(items, sortDescriptor);
  }, [sortDescriptor, items]);

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
      <BottomContent
        selectedKeys={selectedKeys as string}
        selectedKeysSize={
          selectedKeys === "all" ? filteredItems.length : selectedKeys.size
        }
        filteredItemsLenght={filteredItems.length}
        page={page}
        pages={pages}
        setPage={setPage}
      />
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <>
     {(selectedKeys === "all" || selectedKeys.size > 0) && (
  <BulkActionsBar
    selectedKeys={selectedKeys}
    filteredItemsLength={filteredItems.length}
  />
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
                <TableCell>
                  <TableCellRenderer user={item} columnKey={columnKey} />
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
