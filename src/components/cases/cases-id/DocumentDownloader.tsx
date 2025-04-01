"use client";

import { useState, useEffect, useRef } from "react";
import { CloudArrowDownIcon } from "@heroicons/react/24/outline";
import DocumentsModal from "./DocumentsModal";

interface DocumentDownloaderProps {
  caseId: number;
  documentId?: number;
  documentUrl?: string;
  refreshTrigger?: number;
  isModalOpen?: boolean;
  onModalOpenChange?: (isOpen: boolean) => void;
}

export default function DocumentDownloader({ 
  caseId,
  refreshTrigger = 0,
  isModalOpen: externalIsModalOpen,
  onModalOpenChange
}: DocumentDownloaderProps) {
  // Si externalIsModalOpen existe (está controlado externamente), lo usamos
  // de lo contrario, usamos el estado local
  const [internalIsModalOpen, setInternalIsModalOpen] = useState(false);
  const isModalOpen = externalIsModalOpen !== undefined ? externalIsModalOpen : internalIsModalOpen;
  const prevRefreshTrigger = useRef(refreshTrigger);
  const refreshRequested = useRef(false);
  
  // Actualizar el estado del modal controlado externamente
  const setIsModalOpen = (open: boolean) => {
    if (onModalOpenChange) {
      onModalOpenChange(open);
    } else {
      setInternalIsModalOpen(open);
    }
  };
  
  // Efecto para detectar cambios en refreshTrigger sin crear un ciclo infinito
  useEffect(() => {
    // Solo actuamos si refreshTrigger ha cambiado
    if (prevRefreshTrigger.current !== refreshTrigger) {
      prevRefreshTrigger.current = refreshTrigger;
      
      // Si el modal está abierto, marcar que necesitamos refrescar
      // Si no está abierto, abrir el modal para mostrar los documentos actualizados
      if (isModalOpen) {
        refreshRequested.current = true;
      } else {
        setIsModalOpen(true);
      }
    }
  }, [refreshTrigger, isModalOpen, setIsModalOpen]);
  
  const handleOpenModal = () => {
    // Resetear el flag de refresco al abrir el modal
    refreshRequested.current = false;
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <div className="w-full h-full">
      <button
        onClick={handleOpenModal}
        className="flex flex-col items-center px-5 justify-center w-full h-64 border-2 border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <CloudArrowDownIcon className="w-12 h-12 text-gray-400 mb-3" />
          <p className="mb-2 text-sm text-center text-gray-500">
            Click para ver documentos disponibles
          </p>
          <p className="text-xs text-gray-500">docx, pdf</p>
        </div>
      </button>

      <DocumentsModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        caseId={caseId.toString()}
        refreshFlag={refreshRequested.current}
        onRefreshed={() => {
          refreshRequested.current = false;
        }}
      />
    </div>
  );
} 