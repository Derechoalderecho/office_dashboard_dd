"use client";

import { useState, useRef, useCallback } from "react";
import { Button, Spinner, addToast, Chip } from "@heroui/react";
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  ArrowUpTrayIcon,
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { uploadDocument, getDocumentById, DocumentResponse } from "@/actions/uploadDocsActions";
import { parseDateToLocal } from "@/utils/date";

interface DocumentUploaderProps {
  caseId: number;
  onDocumentUploaded?: (document: DocumentResponse) => void;
}

export default function DocumentUploader({ 
  caseId,
  onDocumentUploaded 
}: DocumentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<DocumentResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Max file size in bytes (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const showErrorToast = (message: string) => {
    addToast({
      title: "Error en la carga",
      description: message,
      color: "danger",
    });
  };

  const validateFile = (file: File): boolean => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    // Check file type
    if (fileExt !== 'docx' && fileExt !== 'pdf') {
      setError("Solo se permiten archivos .docx o .pdf");
      showErrorToast("Solo se permiten archivos .docx o .pdf");
      return false;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`El archivo es demasiado grande. El tamaño máximo es 5 MB.`);
      showErrorToast(`El archivo es demasiado grande. El tamaño máximo es 5 MB.`);
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(null);
    setError(null);
    
    if (validateFile(file)) {
      setSelectedFile(file);
      setIsAlertOpen(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    const files = e.dataTransfer.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      processSelectedFile(file);
    }
  }, []);

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const uploadResult = await uploadDocument(formData, caseId);
      
      if (uploadResult.success && uploadResult.data) {
        const documentId = uploadResult.data.id_documento;
        const documentResult = await getDocumentById(documentId);
        
        if (documentResult.success && documentResult.data) {
          setUploadedDocument(documentResult.data);
          
          // Call the callback if provided
          if (onDocumentUploaded && documentResult.data) {
            onDocumentUploaded(documentResult.data);
          }
          
          addToast({
            title: "Archivo subido correctamente",
            description: "El documento ha sido cargado con éxito",
            color: "success",
          });
        } else {
          const errorMsg = documentResult.error || "Error al obtener detalles del documento";
          setError(errorMsg);
          showErrorToast(errorMsg);
        }
      } else {
        const errorMsg = uploadResult.error || "Error al subir el documento";
        setError(errorMsg);
        showErrorToast(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Ocurrió un error durante la carga";
      setError(errorMsg);
      showErrorToast(errorMsg);
    } finally {
      setIsUploading(false);
      setIsAlertOpen(false);
      resetFileInput();
    }
  };

  const handleCancelUpload = () => {
    setIsAlertOpen(false);
    setSelectedFile(null);
    resetFileInput();
  };

  return (
    <div className="w-full">
      <div 
        className="flex flex-col items-center"
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
          className={`relative w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ease-in-out overflow-hidden
            ${isDragging 
              ? 'border-primary bg-blue-50 scale-[1.02] shadow-lg' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
        >
          {/* Overlay when dragging - now with absolute positioning and full coverage */}
          <div 
            className={`absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 transition-opacity duration-300 ease-in-out ${
              isDragging ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className={`transform flex flex-col items-center justify-center transition-transform duration-500 ease-in-out ${isDragging ? 'translate-y-0 scale-100' : 'translate-y-10 scale-90'}`}>
              <ArrowUpTrayIcon className="w-16 h-16 text-primary mb-4 animate-bounce" />
              <p className="text-lg font-medium text-primary text-center">Suelta para subir</p>
              <p className="text-sm text-primary/80 text-center mt-2">
                Archivos .docx o .pdf (Máx. 1 MB)
              </p>
            </div>
          </div>
          
          {/* Normal content - fades out during drag */}
          <div 
            className={`absolute inset-0 flex flex-col items-center justify-center p-5 transition-opacity duration-300 ease-in-out ${
              isDragging ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <label 
              htmlFor="document-upload" 
              className="h-full w-full flex flex-col items-center justify-center cursor-pointer"
            >
              <CloudArrowUpIcon className="w-12 h-12 mb-3 text-gray-400 transition-colors group-hover:text-primary" />
              <p className="mb-2 text-sm text-center text-gray-600">
                <span className="font-bold">Click para subir</span> o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500 mb-2">docx, pdf (Máx. 5 MB)</p>
              <p className="text-xs text-gray-400 text-center">
                Una vez cargado, el documento estará disponible para visualización y descarga
              </p>
              
              {error && (
                <div className="mt-4 p-2 bg-danger-50 rounded-md">
                  <p className="text-sm text-danger flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    {error}
                  </p>
                </div>
              )}
              
              <input
                id="document-upload"
                name="document-upload"
                type="file"
                accept=".docx,.pdf"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
          </div>
        </div>
      </div>

      <AlertDialog
        isOpen={isAlertOpen}
        onClose={handleCancelUpload}
        onConfirm={handleConfirmUpload}
        title="Confirmar carga de archivo"
        description={`¿Está seguro de subir este archivo? (${selectedFile?.name})`}
        confirmText="Subir archivo"
        cancelText="Cancelar"
        type="info"
        isLoading={isUploading}
      />
    </div>
  );
} 