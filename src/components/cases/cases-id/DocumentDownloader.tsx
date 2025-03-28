"use client";

import { useState } from "react";
import { CloudArrowDownIcon } from "@heroicons/react/24/outline";
import DocumentsModal from "./DocumentsModal";

interface DocumentDownloaderProps {
  caseId: number;
  documentId?: number;
  documentUrl?: string;
}

export default function DocumentDownloader({ 
  caseId
}: DocumentDownloaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
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
      />
    </div>
  );
} 