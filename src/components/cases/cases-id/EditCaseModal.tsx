"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea } from "@heroui/react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { updateCaseDetails } from "@/services/caseService";
import { Cases } from "@/types/cases";
import { AlertDialog } from "@/components/ui/alert-dialog";

interface EditCaseModalProps {
  caseData: Cases;
  onSuccess: () => void;
}

export default function EditCaseModal({ caseData, onSuccess }: EditCaseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    pretensiones: caseData.pretensiones || "",
    hechos: caseData.hechos || "",
    fundamentos: caseData.fundamentos || "",
    entidad: caseData.entidad || ""
  });
  
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async () => {
    setIsConfirmOpen(false);
    setIsLoading(true);
    
    try {
      const success = await updateCaseDetails(caseData.id_caso, formData);
      
      if (success) {
        setIsOpen(false);
        onSuccess();
      }
    } catch (error) {
      console.error("Error al actualizar detalles del caso:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button 
        color="primary" 
        size="sm" 
        variant="flat" 
        onPress={() => setIsOpen(true)}
        startContent={<PencilSquareIcon className="h-4 w-4" />}
      >
        Editar detalles
      </Button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="3xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Editar detalles del caso #{caseData.id_caso}
          </ModalHeader>
          
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label htmlFor="pretensiones" className="block text-sm font-medium mb-1">
                  Pretensiones
                </label>
                <Textarea
                  id="pretensiones"
                  name="pretensiones"
                  variant="bordered"
                  value={formData.pretensiones}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Ingrese las pretensiones del caso"
                />
              </div>
              
              <div>
                <label htmlFor="hechos" className="block text-sm font-medium mb-1">
                  Hechos
                </label>
                <Textarea
                  id="hechos"
                  name="hechos"
                  variant="bordered"
                  value={formData.hechos}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Ingrese los hechos del caso"
                />
              </div>
              
              <div>
                <label htmlFor="fundamentos" className="block text-sm font-medium mb-1">
                  Fundamentos
                </label>
                <Textarea
                  id="fundamentos"
                  name="fundamentos"
                  variant="bordered"
                  value={formData.fundamentos}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Ingrese los fundamentos del caso"
                />
              </div>
              
              <div>
                <label htmlFor="entidad" className="block text-sm font-medium mb-1">
                  Entidad
                </label>
                <Textarea
                  id="entidad"
                  name="entidad"
                  variant="bordered"
                  value={formData.entidad}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Ingrese la entidad relacionada"
                />
              </div>
            </div>
          </ModalBody>
          
          <ModalFooter>
            <Button 
              color="danger" 
              variant="light" 
              onPress={() => setIsOpen(false)}
              isDisabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              color="primary"
              onPress={() => setIsConfirmOpen(true)}
              isDisabled={isLoading}
              isLoading={isLoading}
            >
              Guardar cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      <AlertDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleSubmit}
        title="Confirmar cambios"
        description="¿Está seguro que desea actualizar los detalles de este caso?"
        confirmText="Guardar"
        cancelText="Cancelar"
        type="info"
        isLoading={isLoading}
      />
    </>
  );
}
