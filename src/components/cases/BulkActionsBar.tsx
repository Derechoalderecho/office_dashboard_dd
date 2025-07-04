import {
  CheckBadgeIcon,
  UserCircleIcon,
  TagIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import {
  Card,
  CardBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  User,
  Selection,
  Button,
  addToast,
} from "@heroui/react";
import { useCallback, useState } from "react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { useDeleteRows } from "@/hooks/useDeleteRows";
import { getDeleteAlertMessage } from "@/utils/alertMessage";
import { updateCaseStatus } from "@/services/updateCaseStatus";
import { UserAssignmentModal } from "./UserAssignmentModal";
import { useAuth } from "@/hooks/useAuth";

interface BulkActionsBarProps {
  selectedKeys: Selection;
  filteredItemsLength: number;
  onDeleteCases: (ids: number[]) => Promise<boolean>;
  onStatusUpdated?: () => void;
  cases?: any[]; // Array de casos para actualización optimista
  updateCaseInUI?: (id: number, data: any) => void; // Función para actualizar un caso en la UI
}

// Mapeo de claves de estado a valores de API
const STATUS_MAP = {
  viability: "Viabilidad",
  action_required: "Acción necesaria",
  followed: "Seguimiento",
  no_approved: "No aprobado",
  pending: "Pendiente",
  review_tutela: "Revisar tutela",
  file: "Radicar",
  judge_wait: "Espera del juez"
};

// Mapeo de estados a colores para UI
const STATUS_COLORS = {
  "Acción necesaria": "#C4841D",
  "Seguimiento": "#006FEE",
  "No aprobado": "#F31260",
  "Pendiente": "#f43f5e",
  "Revisar tutela": "#f59e0b",
  "Radicar": "#10b981",
  "Espera del juez": "#0ea5e9"
};

export const BulkActionsBar = ({
  selectedKeys,
  filteredItemsLength,
  onDeleteCases,
  onStatusUpdated,
  cases = [],
  updateCaseInUI,
}: BulkActionsBarProps) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isStatusAlertOpen, setIsStatusAlertOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isUserAssignmentModalOpen, setIsUserAssignmentModalOpen] = useState(false);
  const { handleDelete, isLoading: isDeleteLoading } = useDeleteRows(onDeleteCases);
  const { internalUserId, role, loading: authLoading } = useAuth(); // Obtener el ID del usuario autenticado

  const convertSelection = (selection: Selection): Set<number> | "all" => {
    if (selection === "all") return "all";
    return new Set(Array.from(selection).map(Number));
  };

  const alertMessage = getDeleteAlertMessage(
    convertSelection(selectedKeys),
    "caso"
  );

  // Función para manejar el cambio de estado
  const handleStatusChange = async (statusKey: string) => {
    const status = STATUS_MAP[statusKey as keyof typeof STATUS_MAP];
    if (!status) return;
    
    // Mostrar loading mientras se obtiene el internalUserId
    if (!internalUserId) {
      setIsStatusLoading(true);
      // Esperar un momento para asegurar que el estado de autenticación se actualice
      const checkAuth = () => {
        if (internalUserId || authLoading === false) {
          setSelectedStatus(status);
          setIsStatusAlertOpen(true);
          setIsStatusLoading(false);
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    } else {
      setSelectedStatus(status);
      setIsStatusAlertOpen(true);
    }
  };

  // Función para confirmar y aplicar cambio de estado
  const confirmStatusChange = async () => {
    if (!selectedStatus) return;
    
    const selection = convertSelection(selectedKeys);
    console.log("=== INICIO DE ACTUALIZACIÓN DE ESTADO MÁSIVO ===");
    console.log("Estado seleccionado:", selectedStatus);
    console.log("IDs de casos seleccionados:", selection === "all" ? "all" : Array.from(selection));
    
    setIsStatusLoading(true);
    
    try {
      const selection = convertSelection(selectedKeys);
      
      if (selection === "all") {
        addToast({
          title: "Operación no soportada",
          description: "No se puede cambiar el estado de todos los casos. Por favor, seleccione casos específicos.",
          color: "warning",
        });
        setIsStatusLoading(false);
        setIsStatusAlertOpen(false);
        return;
      }
      
      // Actualización optimista en la UI si está disponible
      if (updateCaseInUI) {
        // Comprobar si selection es una instancia de Set (no es "all")
        if (selection instanceof Set) {
          for (const id of Array.from(selection)) {
            updateCaseInUI(id, { estado: selectedStatus });
          }
        }
      }
      
      // Verificar que tenemos un ID de usuario válido
      if (!internalUserId) {
        addToast({
          title: "Error",
          description: "No se pudo obtener el ID del usuario para registrar el cambio de estado.",
          color: "danger",
        });
        setIsStatusLoading(false);
        setIsStatusAlertOpen(false);
        return;
      }
      
      // Crear promesas para actualizar cada caso seleccionado
      // Necesitamos encontrar los casos seleccionados para obtener su estado actual
      const updatePromises = Array.from(selection).map(async id => {
        // Buscar el caso en el array de casos proporcionado por props
        const selectedCase = cases.find(c => c.id_caso === id || c.id === id);
        
        if (!selectedCase) {
          console.error(`No se encontró el caso con ID ${id} en los datos disponibles`);
          return Promise.resolve(false);
        }

        // Obtener el estado actual del caso para usarlo como estado_anterior
        const currentStatus = selectedCase.estado || selectedCase.estado_actual;
        const caseId = selectedCase.id_caso || selectedCase.id;
        
        if (!currentStatus) {
          console.error(`No se pudo determinar el estado actual del caso ${id}`);
          return Promise.resolve(false);
        }
        
        console.log(`=== Detalles de actualización de caso ===`);
        console.log(`ID del caso: ${caseId}`);
        console.log(`Estado actual: ${currentStatus}`);
        console.log(`Nuevo estado: ${selectedStatus}`);
        console.log(`ID de usuario que realiza el cambio: ${internalUserId}`);
        console.log(`Datos completos del caso:`, selectedCase);
        
        // Llamar a updateCaseStatus con el ID del caso, el nuevo estado y el ID del usuario
        return updateCaseStatus(id, selectedStatus, internalUserId);
      });
      
      console.log("\n=== Iniciando actualización de estados ===");
      console.log(`Total de casos a actualizar: ${updatePromises.length}`);
      
      // Ejecutar todas las actualizaciones
      const results = await Promise.allSettled(updatePromises);
      
      // Contar éxitos y fallos
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      const failCount = results.length - successCount;
      
      console.log("\n=== Resultados de la actualización ===");
      console.log(`Actualizaciones exitosas: ${successCount}`);
      console.log(`Actualizaciones fallidas: ${failCount}`);
      
      if (failCount > 0) {
        console.error("Errores durante la actualización:", 
          results.filter((r, i) => r.status === 'rejected' || r.value === false)
                .map((r, i) => ({
                  index: i,
                  status: r.status,
                  reason: r.status === 'rejected' ? r.reason : 'Devuelto false'
                }))
        );
      }
      
      if (successCount > 0) {
        addToast({
          title: "Estado actualizado",
          description: `Se actualizó el estado de ${successCount} caso${successCount !== 1 ? 's' : ''} a "${selectedStatus}".${failCount > 0 ? ` ${failCount} caso${failCount !== 1 ? 's' : ''} no pudo ser actualizado.` : ''}`,
          color: "success",
        });
        
        // Notificar al componente padre para actualizar los datos
        // Asegurarnos de que la actualización se ejecute después de que todas las operaciones hayan terminado
        setTimeout(() => {
          if (onStatusUpdated) {
            console.log("Notificando actualización de datos al componente padre");
            onStatusUpdated();
          }
        }, 500); // Pequeño retraso para asegurar que todas las operaciones asíncronas hayan terminado
      } else {
        addToast({
          title: "Error al actualizar",
          description: "No se pudo actualizar el estado de los casos seleccionados.",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      addToast({
        title: "Error",
        description: "Ocurrió un error al actualizar el estado de los casos.",
        color: "danger",
      });
    } finally {
      setIsStatusLoading(false);
      setIsStatusAlertOpen(false);
    }
  };

  // Obtener IDs de casos seleccionados
  const getSelectedCaseIds = (): number[] => {
    const selection = convertSelection(selectedKeys);
    if (selection === "all") {
      // En este caso, necesitaríamos obtener todos los IDs de los casos filtrados
      return []; // Por simplicidad, no implementamos "all" para asignación de usuarios
    }
    return Array.from(selection);
  };

  // Manejar apertura del modal de asignación de usuarios
  const handleOpenUserAssignmentModal = () => {
    if (selectedKeys === "all") {
      addToast({
        title: "Operación no soportada",
        description: "No se puede asignar usuarios a todos los casos. Por favor, seleccione casos específicos.",
        color: "warning",
      });
      return;
    }
    
    if (selectedKeys.size === 0) {
      addToast({
        title: "Selección requerida",
        description: "Debe seleccionar al menos un caso para asignar usuarios.",
        color: "warning",
      });
      return;
    }
    
    setIsUserAssignmentModalOpen(true);
  };

  // Manejar cierre del modal
  const handleCloseUserAssignmentModal = () => {
    setIsUserAssignmentModalOpen(false);
  };

  // Manejar asignación de usuarios completada
  const handleUserAssignmentComplete = () => {
    if (onStatusUpdated) {
      onStatusUpdated();
    }
  };

  return (
    <>
      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={() => !isDeleteLoading && setIsDeleteAlertOpen(false)}
        onConfirm={() =>
          handleDelete(convertSelection(selectedKeys), () =>
            setIsDeleteAlertOpen(false)
          )
        }
        title="Confirmar eliminación"
        description={alertMessage}
        confirmText="Eliminar"
        type="danger"
        isLoading={isDeleteLoading}
      />
      
      {/* Diálogo de confirmación para cambiar estado */}
      <AlertDialog
        isOpen={isStatusAlertOpen}
        onClose={() => !isStatusLoading && setIsStatusAlertOpen(false)}
        onConfirm={confirmStatusChange}
        title="Confirmar cambio de estado"
        description={
          !internalUserId 
            ? "Cargando información del usuario..." 
            : `¿Está seguro que desea cambiar el estado de ${selectedKeys === "all" ? "todos los casos" : `${selectedKeys.size} caso${selectedKeys.size !== 1 ? 's' : ''}`} a "${selectedStatus}"?`
        }
        confirmText={isStatusLoading ? "Actualizando..." : "Cambiar estado"}
        type="info"
        isLoading={isStatusLoading}
        disabled={!internalUserId}  
        error={!internalUserId}
      />
      
      {/* Modal de asignación de usuarios */}
      <UserAssignmentModal
        isOpen={isUserAssignmentModalOpen}
        onClose={handleCloseUserAssignmentModal}
        selectedCaseIds={getSelectedCaseIds()}
        onAssignUsers={handleUserAssignmentComplete}
      />
      
      <aside className="fixed bottom-0 z-50 left-1/2 transform -translate-x-1/2 mb-10">
        <Card shadow="lg" className="bg-[#383838]">
          <CardBody className="!flex flex-row items-center gap-40 justify-between">
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
                    <DropdownItem 
                      key="action_required"
                      onPress={() => handleStatusChange("action_required")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#C4841D] rounded-full"></div>
                        Acción necesaria
                      </div>
                    </DropdownItem>
                    <DropdownItem 
                      key="followed"
                      onPress={() => handleStatusChange("followed")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#006FEE] rounded-full"></div>
                        Seguimiento
                      </div>
                    </DropdownItem>
                    <DropdownItem 
                      key="no_approved"
                      onPress={() => handleStatusChange("no_approved")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#F31260] rounded-full"></div>
                        No aprobado
                      </div>
                    </DropdownItem>
                    <DropdownItem 
                      key="viability"
                      onPress={() => handleStatusChange("viability")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#9f33ea] rounded-full"></div>
                        Viabilidad
                      </div>
                    </DropdownItem>
                    <DropdownItem 
                      key="pending"
                      onPress={() => handleStatusChange("pending")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#f43f5e] rounded-full"></div>
                        Pendiente
                      </div>
                    </DropdownItem>
                    <DropdownItem 
                      key="review_tutela"
                      onPress={() => handleStatusChange("review_tutela")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#f59e0b] rounded-full"></div>
                        Revisar tutela
                      </div>
                    </DropdownItem>
                    <DropdownItem 
                      key="file"
                      onPress={() => handleStatusChange("file")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#10b981] rounded-full"></div>
                        Radicar
                      </div>
                    </DropdownItem>
                    <DropdownItem 
                      key="judge_wait"
                      onPress={() => handleStatusChange("judge_wait")}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#0ea5e9] rounded-full"></div>
                        Espera del juez
                      </div>
                    </DropdownItem>
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
              {role !== 'Estudiante' && (
                <>
              <div className="border-l border-white h-6 mx-2"></div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={handleOpenUserAssignmentModal}>
                <UserCircleIcon className="w-6 text-white" />
                <p className="text-white">Asignado</p>
              </div>
              </>
              )}
              <div className="border-l border-white h-6 mx-2"></div>
              <div className="flex items-center gap-1">
                <TagIcon className="w-6 text-white" />
                <p className="text-white">Tags</p>
              </div>
              {role !== 'Estudiante' && (
                <>
                  <div className="border-l border-white h-6 mx-2"></div>
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    onPress={() => setIsDeleteAlertOpen(true)}
                  >
                    <TrashIcon className="w-6 text-white" />
                  </Button>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </aside>
    </>
  );
};
