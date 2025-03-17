import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "@heroui/react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
  error?: boolean;
}

export const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "danger",
  isLoading = false,
}: AlertDialogProps) => {
  const getColorByType = () => {
    switch (type) {
      case "danger":
        return "danger";
      case "warning":
        return "warning";
      case "info":
        return "primary";
      default:
        return "danger";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>
          <p>{description}</p>
        </ModalBody>
        <ModalFooter>
          <Button 
            color="default" 
            variant="light" 
            onPress={onClose}
            isDisabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            color={getColorByType()} 
            onPress={onConfirm}
            isLoading={isLoading}
            spinner={<Spinner size="sm" color="white" />}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
