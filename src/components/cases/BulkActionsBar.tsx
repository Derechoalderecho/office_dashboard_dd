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

interface BulkActionsBarProps {
  selectedKeys: Selection;
  filteredItemsLength: number;
  onDeleteCases: (ids: number[]) => Promise<boolean>;
}

export const BulkActionsBar = ({
  selectedKeys,
  filteredItemsLength,
  onDeleteCases,
}: BulkActionsBarProps) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { handleDelete, isLoading } = useDeleteRows(onDeleteCases);

  const convertSelection = (selection: Selection): Set<number> | "all" => {
    if (selection === "all") return "all";
    return new Set(Array.from(selection).map(Number));
  };

  const alertMessage = getDeleteAlertMessage(
    convertSelection(selectedKeys),
    "caso"
  );

  return (
    <>
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => !isLoading && setIsAlertOpen(false)}
        onConfirm={() =>
          handleDelete(convertSelection(selectedKeys), () =>
            setIsAlertOpen(false)
          )
        }
        title="Confirmar eliminación"
        description={alertMessage}
        confirmText="Eliminar"
        type="danger"
        isLoading={isLoading}
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
              <Button
                isIconOnly
                color="danger"
                variant="light"
                onPress={() => setIsAlertOpen(true)}
              >
                <TrashIcon className="w-6 text-white" />
              </Button>
            </div>
          </CardBody>
        </Card>
      </aside>
    </>
  );
};
