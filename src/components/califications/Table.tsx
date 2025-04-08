"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Selection,
  SortDescriptor,
  Spinner,
  useDisclosure,
  addToast,
} from "@heroui/react";
import { useState, useCallback, useMemo, useEffect, ChangeEvent } from "react";
import { columns } from "@/constants/casesConstants";
import TopContent from "./TopContent";
import BottomContent from "../shared/BottomContentTable";
import { sortItems } from "@/utils/sortItems";
import { paginateItems } from "@/utils/paginateItems";
import { CaseWithKey } from "@/types/cases";
import { TableCellRendererCalifications } from "./TableCellRenderer";
import { fetchAllCases } from "@/services/caseService";
import { useFilteredCalifications } from "@/hooks/useFilteredCalifications";
import { ModalCalification } from "../ui/modal-calification";

const INITIAL_VISIBLE_COLUMNS = [
  "tipo_proceso",
  "estado",
  "ciudadano",
  "estudiante_asignado",
  "calificacion",
  "actions",
];

export default function TableCalifications() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Selection>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [cases, setCases] = useState<CaseWithKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseWithKey | null>(null);
  
  // Modal controls
  const previewModal = useDisclosure();
  const calificationModal = useDisclosure();

  // Fetch cases from API
  const fetchCasesData = async () => {
    setIsLoading(true);
    const casesList = await fetchAllCases();
    setCases(casesList as CaseWithKey[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCasesData();
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

  // Función para reiniciar todos los filtros
  const handleResetAllFilters = useCallback(() => {
    setFilterValue("");
    setStatusFilter("all");
    setPage(1);
    setShowAll(false);
  }, []);

  // Use the custom hook for filtering
  const { filteredItems, hasSearchFilter } = useFilteredCalifications({
    cases,
    filterValue,
    statusFilter,
    onResetFilters: handleResetAllFilters
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
        usersLength={cases.length}
        onRowsPerPageChange={onRowsPerPageChange}
        setShowAll={setShowAll}
        setStatusFilter={setStatusFilter}
        statusFilter={statusFilter as Set<string>}
        onClear={onClear}
        filterValue={filterValue}
        showAll={showAll}
        onSearchChange={onSearchChange}
        onResetFilters={handleResetAllFilters}
      />
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onSearchChange,
    onRowsPerPageChange,
    cases.length,
    handleResetAllFilters,
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
  }, [selectedKeys, filteredItems.length, page, pages]);

  const handlePreviewCase = (caseData: CaseWithKey) => {
    setSelectedCase(caseData);
    previewModal.onOpen();
  };

  const handleCalificateCase = (caseData: CaseWithKey) => {
    setSelectedCase(caseData);
    calificationModal.onOpen();
  };

  const handleCalificationSuccess = () => {
    addToast({
      title: "Calificación guardada",
      description: "La calificación ha sido guardada correctamente",
      color: "success",
    });
    // Refresh the data
    fetchCasesData();
  };

  return (
    <>
      <ModalCalification
        isOpen={calificationModal.isOpen}
        onClose={calificationModal.onClose}
        caseData={selectedCase}
        onSuccess={handleCalificationSuccess}
      />

      <Table
        suppressHydrationWarning
        isHeaderSticky
        aria-label="Tabla de calificaciones"
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
          emptyContent={"Calificaciones no encontradas"}
          items={sortedItems}
          isLoading={isLoading}
          loadingContent={<Spinner label="Cargando..." />}
        >
          {(item) => (
            <TableRow key={item.id_caso}>
              {(columnKey) => (
                <TableCell>
                  <TableCellRendererCalifications
                    case={item as CaseWithKey}
                    columnKey={columnKey as keyof CaseWithKey}
                    onPreviewCase={handlePreviewCase}
                    onCalificateCase={handleCalificateCase}
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
