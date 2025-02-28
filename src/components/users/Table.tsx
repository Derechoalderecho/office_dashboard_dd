"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
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
import { useState, useCallback, useMemo, useEffect, ChangeEvent } from "react";
import { columns } from "@/constants/usersConstants";
import TopContent from "./TopContent";
import BottomContent from "./BottomContent";
import { sortItems } from "@/utils/sortItems";
import { paginateItems } from "@/utils/paginateItems";
import { UserWithKey } from "@/types/users";
import { TableCellRendererUsers } from "./TableCellRenderer";
import { BulkActionsBar } from "./BulkActionsBar";
import { fetchAllUsers } from "@/services/userService";
import { useFilteredUsers } from "@/hooks/useFilteredUsers";
import { Spinner } from "@heroui/react";

const INITIAL_VISIBLE_COLUMNS = [
  "id_document",
  "name",
  "user_type",
  "branch_law",
  "site",
  "email",
  "active_consults",
  "active_processes",
  "consults_calification",
  "processes_calification",
];

export default function TableUsers() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [siteFilter, setSiteFilter] = useState<Selection>("all");
  const [userTypeFilter, setUserTypeFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState<UserWithKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reviewers from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await fetchAllUsers();
      setUsers(usersList as UserWithKey[]);
      setIsLoading(false);
    };
    fetchUsers();
  }, []);

  // Handle Bulk Actions Bar selection change
  const onSelectionChangeMasiveMenu = (keys: Selection) => {
    setSelectedKeys(keys);
  };

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  // Filters
  const { filteredItems, hasSearchFilter } = useFilteredUsers({
    users,
    filterValue,
    userTypeFilter: userTypeFilter as string | Set<string>,
    siteFilter: siteFilter as string | Set<string>,
  });

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  // Paginate
  const items = useMemo(() => {
    return paginateItems(filteredItems, page, rowsPerPage);
  }, [page, filteredItems, rowsPerPage]);

  //Sort items
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

  // Clear search filter
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
        usersLength={users.length}
        onRowsPerPageChange={onRowsPerPageChange}
        setShowAll={setShowAll}
        setUserTypeFilter={setUserTypeFilter}
        setSiteFilter={setSiteFilter}
        userTypeFilter={userTypeFilter as Set<string>}
        siteFilter={siteFilter as Set<string>}
        onClear={onClear}
        filterValue={filterValue}
        showAll={showAll}
        onSearchChange={onSearchChange}
      />
    );
  }, [
    filterValue,
    userTypeFilter,
    siteFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    users.length,
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
        <TableBody
          emptyContent={"Casos no encontrados"}
          items={sortedItems}
          isLoading={isLoading}
          loadingContent={<Spinner label="Cargando..." />}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  <TableCellRendererUsers
                    user={item as UserWithKey}
                    columnKey={columnKey as keyof UserWithKey}
                  />
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
