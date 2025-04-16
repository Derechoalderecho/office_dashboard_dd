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
import { fetchAllCases, fetchCasesByUserId } from "@/services/caseService";
import { useFilteredCalifications } from "@/hooks/useFilteredCalifications";
import { ModalCalification } from "../ui/modal-calification";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { getUserIdFromFirebase } from "@/services/userService";
import { ModalCalificationDetails } from "../ui/modal-table";

const INITIAL_VISIBLE_COLUMNS = [
  "id_caso",
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
  const calificationDetailsModal = useDisclosure();

  // Role y auth
  const { role } = useUserRole();
  const { user } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);

  // Función para obtener el ID del usuario desde Firebase
  const fetchUserId = async () => {
    if (user?.uid) {
      const id = await getUserIdFromFirebase(user.uid);
      setUserId(id);
    }
  };

  // Efecto para obtener el ID del usuario cuando cambia el usuario o el rol
  useEffect(() => {
    if (user?.uid) {
      fetchUserId();
    }
  }, [user?.uid]);

  // Determinar si el usuario actual puede calificar
  const canGradeStudents = role === 'Docente' || role === 'Director' || role === 'Monitor';

  // Fetch cases from API
  const fetchCasesData = async () => {
    setIsLoading(true);
    try {
      let casesList;
      
      // Si es estudiante, solo mostrar sus casos asignados
      if (role === 'Estudiante' && userId) {
        casesList = await fetchCasesByUserId(userId);
      } else {
        // Para docentes y otros roles, mostrar todos los casos
        casesList = await fetchAllCases();
      }
      
      setCases(casesList as CaseWithKey[]);
    } catch (error) {
      console.error("Error al obtener casos:", error);
      addToast({
        title: "Error",
        description: "No se pudieron cargar los casos",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Solo cargar casos si ya tenemos el ID para estudiantes
    if (role === 'Estudiante' && !userId) {
      return;
    }
    fetchCasesData();
  }, [role, userId]);

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
    // Solo permitir calificar a usuarios con permiso
    if (!canGradeStudents) {
      addToast({
        title: "Acceso denegado",
        description: "No tienes permisos para calificar estudiantes",
        color: "danger",
      });
      return;
    }
    
    setSelectedCase(caseData);
    calificationModal.onOpen();
  };

  const handleViewCalification = (caseData: CaseWithKey) => {
    setSelectedCase(caseData);
    calificationDetailsModal.onOpen();
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

      <ModalCalificationDetails
        isOpen={calificationDetailsModal.isOpen}
        onClose={calificationDetailsModal.onClose}
        caseData={selectedCase}
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
          loadingContent={
            <div className="flex flex-col items-center justify-center py-8">
              <Spinner size="lg" color="primary" className="mb-4" />
              <p className="text-lg font-medium">Cargando datos...</p>
              <p className="text-sm text-gray-500">Por favor espere mientras se actualiza la información</p>
            </div>
          }
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
                    onViewCalification={handleViewCalification}
                    canGradeStudents={canGradeStudents}
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
