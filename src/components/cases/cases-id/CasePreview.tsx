"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button, Spinner, addToast } from "@heroui/react";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { uploadTutelaDocument, TutelaResponse } from "@/services/tutelaService";

interface CasePreviewProps {
  previewText?: string;
  caseId: number;
  canUpload?: boolean;
  onTutelaUploaded?: () => void;
}

export default function CasePreview({
  previewText,
  caseId,
  canUpload = true, // Por defecto permitimos la carga si no se especifica
  onTutelaUploaded
}: CasePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tutelaData, setTutelaData] = useState<TutelaResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Función para validar archivo
  const validateFile = (file: File): boolean => {
    const fileExt = file.name.split(".").pop()?.toLowerCase();

    // Check file type
    if (fileExt !== "docx" && fileExt !== "pdf") {
      setError("Solo se permiten archivos .docx o .pdf");
      addToast({
        title: "Error de formato",
        description: "Solo se permiten archivos .docx o .pdf",
        color: "danger",
      });
      return false;
    }

    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es demasiado grande. El tamaño máximo es 5 MB.");
      addToast({
        title: "Error de tamaño",
        description:
          "El archivo es demasiado grande. El tamaño máximo es 5 MB.",
        color: "danger",
      });
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setIsAlertOpen(true);
    } else {
      setSelectedFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  // Funciones para manejar el arrastrar y soltar
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
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

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);

  const handleChange = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    // Notificar inicio de carga
    addToast({
      title: "Procesando",
      description: "Cargando documento de tutela...",
      color: "primary",
    });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const result = await uploadTutelaDocument(formData, caseId);

      if (result.success && result.data) {
        setTutelaData(result.data);
        addToast({
          title: "Éxito",
          description: "Documento cargado correctamente",
          color: "success",
        });
        
        // Notificar al componente padre que se ha subido una tutela
        if (onTutelaUploaded) {
          onTutelaUploaded();
        }
      } else {
        setError(result.error || "Error desconocido al subir el documento");
        addToast({
          title: "Error",
          description:
            result.error || "Error desconocido al subir el documento",
          color: "danger",
        });
      }
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud");
      addToast({
        title: "Error",
        description: err.message || "Error al procesar la solicitud",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
      setIsAlertOpen(false);

      // Limpiar el input file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <h6 className="font-medium text-lg mb-4">
        Previsualización de la tutela
      </h6>

      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={handleUpload}
        title="Confirmar carga"
        description={`¿Está seguro que desea cargar el documento "${selectedFile?.name}"? Este documento se procesará y mostrará como tutela.`}
        confirmText="Cargar"
        isLoading={isLoading}
      />

      {!tutelaData ? (
        <div
          className={`rounded-xl border-2 border-dashed mb-6 transition-all ${
            isDragging
              ? "border-primary bg-blue-50"
              : "border-gray-300 bg-white"
          } ${!canUpload ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={canUpload ? handleDragEnter : undefined}
          onDragLeave={canUpload ? handleDragLeave : undefined}
          onDragOver={canUpload ? handleDragOver : undefined}
          onDrop={canUpload ? handleDrop : undefined}
        >
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CloudArrowUpIcon
              className={`w-16 h-16 mb-4 ${
                isDragging ? "text-primary animate-bounce" : "text-gray-400"
              }`}
            />
            <h5 className="text-lg font-medium mb-2">
              {!canUpload 
                ? "No se permite cargar tutela en este momento" 
                : isDragging
                  ? "Suelta para cargar"
                  : "Carga tu documento de tutela"
              }
            </h5>
            {canUpload ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Arrastra y suelta un archivo aquí, o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Formatos aceptados: DOCX, PDF (máximo 5MB)
                </p>

                <Button
                  color="primary"
                  startContent={<ArrowUpTrayIcon className="w-4 h-4" />}
                  onPress={handleChange}
                  size="sm"
                  isDisabled={!canUpload}
                >
                  Seleccionar archivo
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                El estado actual del caso no permite cargar tutelas o su rol no tiene permisos
              </p>
            )}

            {error && (
              <div className="mt-4 p-2 bg-danger-50 rounded-md w-full max-w-xs">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border-1 bg-white mb-6 p-5 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <Spinner color="primary" size="lg" className="mb-2" />
                <p className="text-sm text-gray-600">Procesando documento...</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {tutelaData.nombre_documento}{tutelaData.ext_documento}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(tutelaData.fecha_asigna).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            {canUpload && (
              <Button
                color="primary"
                variant="light"
                size="sm"
                startContent={<CloudArrowUpIcon className="w-4 h-4" />}
                onPress={handleChange}
                isDisabled={!canUpload}
              >
                Cambiar
              </Button>
            )}
          </div>

          <div className="prose prose-sm max-w-none overflow-y-auto h-[500px]">
            <div className="text-sm whitespace-pre-line font-sans text-gray-800">
              {tutelaData.contenido_documento}
            </div>
          </div>
        </div>
      )}
      
      {/* El input file debe estar fuera de las condiciones, para que siempre esté disponible */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".docx,.pdf"
        onChange={handleFileChange}
        disabled={isLoading || !canUpload}
      />
    </>
  );
}
