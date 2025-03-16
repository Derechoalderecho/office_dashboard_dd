import { CheckBadgeIcon, UserCircleIcon, TagIcon, TrashIcon } from "@heroicons/react/24/solid";
import { Card, CardBody, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, User, Selection, Button } from "@heroui/react";
import { useCallback } from "react";
interface BulkActionsBarProps {
  selectedKeys: Selection;
  filteredItemsLength: number;
  onDeleteCases: (ids: number[]) => void;
}

export const BulkActionsBar = ({ selectedKeys, filteredItemsLength, onDeleteCases }: BulkActionsBarProps) => {
  const handleDeleteCases = useCallback(() => {
    if (selectedKeys === "all") {
      // Si se seleccionaron todos los casos, podrías pedir confirmación antes de eliminarlos
      const confirmDelete = window.confirm(
        "¿Estás seguro de que deseas eliminar todos los casos?"
      );
      if (confirmDelete) {
        // Lógica para eliminar todos los casos
        onDeleteCases([]); // Pasa un array vacío o maneja la lógica para eliminar todos
      }
    } else if (selectedKeys.size > 0) {
      // Si se seleccionaron casos específicos
      const confirmDelete = window.confirm(
        `¿Estás seguro de que deseas eliminar ${selectedKeys.size} caso(s)?`
      );
      if (confirmDelete) {
        // Convertir las claves seleccionadas a un array de IDs
        const caseIds = Array.from(selectedKeys).map((key) => Number(key));
        onDeleteCases(caseIds);
      }
    }
  }, [selectedKeys, onDeleteCases]);
  return (
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
            <Button isIconOnly color="danger" variant="light" onPress={handleDeleteCases}>
              <TrashIcon className="w-6 text-white" />
            </Button>
          </div>
        </CardBody>
      </Card>
    </aside>
  );
};