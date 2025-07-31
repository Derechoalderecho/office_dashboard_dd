"use client";

import { useState, useRef, useCallback } from "react";
import {
  CloudArrowUpIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button, Chip } from "@heroui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface InputFileProps {
  onFileSelected?: (file: File) => void;
  maxSize?: number; // en bytes
  accept?: string;
  id?: string;
  label?: string;
  sublabel?: string;
  description?: string;
  error?: string | null;
}

// Componente principal de carga de archivos
export default function InputFile({
  onFileSelected,
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  accept = "*/*",
  id = "file-upload",
  label = "Click para subir o arrastra y suelta",
  sublabel = "Todos los formatos de archivo (Máx. 10 MB)",
  description = "Una vez cargado, el documento estará disponible",
  error = null,
}: InputFileProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validar tamaño del archivo
    if (maxSize && file.size > maxSize) {
      if (onFileSelected) {
        onFileSelected(file);
      }
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
    if (validateFile(file) && onFileSelected) {
      onFileSelected(file);
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
            ${
              isDragging
                ? "border-primary bg-blue-50 scale-[1.02] shadow-lg"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
        >
          {/* Overlay mientras se arrastra el archivo */}
          <div
            className={`absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 transition-opacity duration-300 ease-in-out ${
              isDragging ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className={`transform flex flex-col items-center justify-center transition-transform duration-500 ease-in-out ${
                isDragging
                  ? "translate-y-0 scale-100"
                  : "translate-y-10 scale-90"
              }`}
            >
              <ArrowUpTrayIcon className="w-16 h-16 text-primary mb-4 animate-bounce" />
              <p className="text-lg font-medium text-primary text-center">
                Suelta para subir
              </p>
              <p className="text-sm text-primary/80 text-center mt-2">
                {sublabel}
              </p>
            </div>
          </div>

          {/* Contenido normal */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-5 transition-opacity duration-300 ease-in-out ${
              isDragging ? "opacity-0" : "opacity-100"
            }`}
          >
            <label
              htmlFor={id}
              className="h-full w-full flex flex-col items-center justify-center cursor-pointer"
            >
              <CloudArrowUpIcon className="w-12 h-12 mb-3 text-gray-400 transition-colors group-hover:text-primary" />
              <p className="mb-2 text-sm text-center text-gray-600">
                <span className="font-bold">{label}</span>
              </p>
              <p className="text-xs text-gray-500 mb-2">{sublabel}</p>
              <p className="text-xs text-gray-400 text-center">{description}</p>

              {error && (
                <div className="mt-4 p-2 bg-danger-50 rounded-md">
                  <p className="text-sm text-danger flex items-center">
                    {error}
                  </p>
                </div>
              )}

              <input
                id={id}
                name={id}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FileAttachmentProps {
  onFileSelected?: (file: File) => void;
  onFileRemove?: () => void;
  maxSize?: number; // en bytes
  maxSizeMB?: number; // tamaño máximo en MB (más fácil de especificar)
  maxSizeErrorMessage?: string; // mensaje de error personalizado
  accept?: string;
  id?: string;
  name?: string; // Nombre del campo en el formulario
  file?: File | null; // El archivo actual
  label: string;
  isRequired?: boolean;
  isPrimordial?: boolean;
  error?: string | null;
}

// Componente para anexos obligatorios con diseño horizontal
export function FileAttachment({
  onFileSelected,
  onFileRemove,
  maxSize, // en bytes
  maxSizeMB = 10, // 10MB por defecto
  maxSizeErrorMessage,
  accept = "*/*",
  id = "file-attachment",
  name,
  file,
  label,
  isRequired = false,
  isPrimordial = false,
  error = null,
}: FileAttachmentProps) {
  // Calcular el tamaño máximo en bytes (priorizar maxSize si está definido)
  const maxSizeBytes = maxSize || maxSizeMB * 1024 * 1024;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validar tamaño del archivo
      if (file.size > maxSizeBytes) {
        const errorMessage = maxSizeErrorMessage || 
          `El archivo excede el tamaño máximo permitido de ${formatFileSize(maxSizeBytes)}`;
        alert(errorMessage);
        return;
      }

      if (onFileSelected) {
        onFileSelected(file);
      }
    }
  };

  return (
    <div className="flex items-center justify-between w-full p-3 rounded-md bg-white border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <DocumentTextIcon className="h-6 w-6 text-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-500">{label}</span>
            {isRequired && <span className="text-danger text-xs">*</span>}
            {file && <CheckCircleIcon className="h-6 w-6 text-success" />}
            {isPrimordial && (
              <Chip
                variant="bordered"
                size="sm"
                className="border-indigo-500 text-indigo-400"
              >
                Primordial
              </Chip>
            )}
          </div>
          {file && (
            <span className="text-xs text-gray-500">
              {file.name} ({formatFileSize(file.size)})
            </span>
          )}
          {error && <span className="text-xs text-danger">{error}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {file ? (
          <>
            <Button
              onPress={onFileRemove}
              size="sm"
              color="danger"
              variant="light"
              isIconOnly
              aria-label="Eliminar archivo"
            >
              <TrashIcon className="h-6 w-6 text-danger" />
            </Button>
          </>
        ) : (
          <Button
            onPress={() => fileInputRef.current?.click()}
            size="sm"
            color="primary"
          >
            Subir
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          name={name || id}
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
