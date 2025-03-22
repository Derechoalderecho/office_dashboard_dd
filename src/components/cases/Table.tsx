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
import { CalendarDate } from "@internationalized/date";
import { RangeValue, DateRange } from "@/types/sharedTypes";
import { columns } from "@/constants/casesConstants";
import TopContent from "./TopContent";
import BottomContent from "../shared/BottomContentTable";
import { useFilteredItems } from "@/hooks/useFilteredCases";
import { sortItems } from "@/utils/sortItems";
import { paginateItems } from "@/utils/paginateItems";
import { CaseWithKey } from "@/types/cases";
import { TableCellRendererCases } from "./TableCellRenderer";
import { BulkActionsBar } from "./BulkActionsBar";
import { fetchAllCases, deleteCasesByIds } from "@/services/caseService";
import { ModalCase } from "../ui/modal-table";
import { invalidateCache } from "@/utils/cacheUtils";

const INITIAL_VISIBLE_COLUMNS = [
  "fecha_crea",
  "fecha_actualiza",
  "tipo_proceso",
  "estado",
  "ciudadano",
  "usuarios",
  "tiempo_respuesta",
  "actions",
];

export default function TableCases() {
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
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cases, setCases] = useState<CaseWithKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedCase, setSelectedCase] = useState<CaseWithKey | null>(null);

  // Función para actualizar un caso directamente en la UI
  const updateCaseInUI = useCallback((id: number, data: Partial<CaseWithKey>) => {
    setCases(prevCases => 
      prevCases.map(caseItem => 
        caseItem.id_caso === id 
          ? { ...caseItem, ...data } 
          : caseItem
      )
    );
  }, []);

  // Definir fetchCases fuera de useEffect para poder reutilizarlo
  const fetchCases = async (showToast = false) => {
    try {
      setIsLoading(true);
      
      // Limpiar las selecciones actuales
      setSelectedKeys(new Set([]));
      
      // Invalidar todas las cachés relacionadas con casos
      invalidateCache('cases');
      invalidateCache('caseHistory');
      
      // Simular una pequeña demora para asegurar que la API tenga tiempo 
      // de procesar los cambios recientes antes de que hagamos un nuevo fetch
      if (showToast) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Obtener datos frescos
      const casesList = await fetchAllCases();
      
      // Actualizar el estado con los nuevos datos
      setCases(casesList as CaseWithKey[]);
      
      if (showToast) {
        addToast({
          title: "Datos actualizados",
          description: "La tabla ha sido actualizada con los datos más recientes",
          color: "success",
        });
      }
    } catch (error) {
      console.error("Error al actualizar los casos:", error);
      
      if (showToast) {
        addToast({
          title: "Error al actualizar",
          description: "No se pudieron actualizar los datos. Intente nuevamente.",
          color: "danger",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cases from API
  useEffect(() => {
    fetchCases();
  }, []);

  // Handle delete cases
  const handleDeleteCases = async (ids: number[]): Promise<boolean> => {
    try {
      const success = await deleteCasesByIds(ids);
      if (success) {
        // Update cases list after deletion
        const updatedCases = cases.filter(
          (caseItem) => !ids.includes(caseItem.id_caso)
        );
        setCases(updatedCases);
        setSelectedKeys(new Set([]));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting cases:", error);
      return false;
    }
  };

  // Handle date range change
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
  const { filteredItems, hasSearchFilter } = useFilteredItems({
    cases,
    filterValue,
    statusFilter: statusFilter as string | Set<string>,
    dateRange,
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

  const handlePreviewCase = (caseData: CaseWithKey) => {
    setSelectedCase(caseData);
    onOpen();
  };

  // Función para actualizar datos después de cambios de estado
  const handleStatusUpdated = () => {
    fetchCases(true); // Mostrar toast al actualizar después de cambio de estado
  };

  return (
    <>
      {(selectedKeys === "all" || selectedKeys.size > 0) && (
        <BulkActionsBar
          selectedKeys={selectedKeys}
          filteredItemsLength={filteredItems.length}
          onDeleteCases={handleDeleteCases}
          onStatusUpdated={handleStatusUpdated}
          cases={cases}
          updateCaseInUI={updateCaseInUI}
        />
      )}

      <ModalCase
        isOpen={isOpen}
        onClose={onOpenChange}
        caseData={selectedCase}
      />

      <Table
        suppressHydrationWarning
        isHeaderSticky
        aria-label="Tabla de casos"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-w-[100%]",
          td: "whitespace-normal break-words",
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
            <TableRow key={item.id_caso}>
              {(columnKey) => (
                <TableCell>
                  <TableCellRendererCases
                    user={item as CaseWithKey}
                    columnKey={columnKey as keyof CaseWithKey}
                    onPreviewCase={handlePreviewCase}
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
