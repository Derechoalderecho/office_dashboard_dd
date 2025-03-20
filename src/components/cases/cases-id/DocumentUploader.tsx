"use client";

import { useState, useRef } from "react";
import { Button, Spinner, addToast, Chip } from "@heroui/react";
import { CloudArrowUpIcon, DocumentTextIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      // Check file type
      if (fileExt !== 'docx' && fileExt !== 'pdf') {
        setError("Solo se permiten archivos .docx o .pdf");
        setSelectedFile(null);
        showErrorToast("Solo se permiten archivos .docx o .pdf");
        return;
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(`El archivo es demasiado grande. El tamaño máximo es 5 MB.`);
        setSelectedFile(null);
        showErrorToast(`El archivo es demasiado grande. El tamaño máximo es 5 MB.`);
        return;
      }
      
      // File is valid
      setSelectedFile(file);
      setError(null);
      setIsAlertOpen(true);
    }
  };

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
      <div className="flex flex-col items-center">
        <label 
          htmlFor="document-upload" 
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-3" />
            <p className="mb-2 text-sm text-gray-500">
              Click para <span className="font-bold">subir</span> el archivo
            </p>
            <p className="text-xs text-gray-500">docx, pdf (Máx. 5 MB)</p>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>
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

      {uploadedDocument && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-white">
          <h3 className="font-medium text-lg mb-3">Documento cargado</h3>
          <div className="flex items-start gap-3">
            <DocumentTextIcon className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">{uploadedDocument.nombre_documento}{uploadedDocument.ext_documento}</p>
              <p className="text-sm text-gray-500 mb-1">Subido el {parseDateToLocal(uploadedDocument.fecha_asigna)}</p>
              <Chip
                size="sm"
                variant="flat"
                color={uploadedDocument.ext_documento === '.pdf' ? 'danger' : 'primary'}
                className="mt-1"
              >
                {uploadedDocument.ext_documento.substring(1).toUpperCase()}
              </Chip>
              <div className="mt-2">
                <a 
                  href={uploadedDocument.enlace} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Ver documento
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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