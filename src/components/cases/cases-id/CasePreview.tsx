"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button, Spinner, addToast } from "@heroui/react";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { 
  uploadTutelaDocument, 
  TutelaResponse, 
  getLatestTutelaFromDocuments,
  getTutelaDocumentById
} from "@/services/tutelaService";

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
  onTutelaUploaded,
}: CasePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isReplaceAlertOpen, setIsReplaceAlertOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tutelaData, setTutelaData] = useState<TutelaResponse | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Cargar la tutela existente al montar el componente
  useEffect(() => {
    const loadExistingTutela = async () => {
      if (!caseId) return;
      
      setIsInitialLoading(true);
      setError(null);
      
      try {
        console.log("Intentando cargar tutela existente para caso:", caseId);
        
        // Intentar recuperar el ID del documento de tutela desde localStorage
        const savedTutelaDocId = localStorage.getItem(`case_${caseId}_tutela_doc_id`);
        
        if (savedTutelaDocId) {
          console.log("📋 ID de tutela encontrado en localStorage:", savedTutelaDocId);
          // Si tenemos un ID guardado, intentamos cargar ese documento específico
          const { getTutelaDocumentById } = await import('@/services/tutelaService');
          const result = await getTutelaDocumentById(parseInt(savedTutelaDocId, 10));
          
          if (result.success && result.data) {
            setTutelaData(result.data);
            console.log("✅ Tutela cargada exitosamente desde ID guardado");
            setIsInitialLoading(false);
            return;
          } else {
            console.log("⚠️ No se pudo cargar la tutela desde ID guardado:", result.error);
            // Si falla, continuamos con el método alternativo
          }
        }
        
        // Si no hay ID guardado o falló la carga, intentamos obtener la tutela más reciente
        const result = await getLatestTutelaFromDocuments(caseId);
        
        if (result.success && result.data) {
          setTutelaData(result.data);
          console.log("✅ Tutela cargada exitosamente:", result.data.nombre_documento);
          
          // Guardar el ID del documento para futuras cargas
          if (result.data.id_documento) {
            localStorage.setItem(`case_${caseId}_tutela_doc_id`, result.data.id_documento.toString());
            console.log("💾 ID de tutela guardado en localStorage:", result.data.id_documento);
          }
        } else {
          console.log("❌ No se encontró tutela existente:", result.error);
          // No mostramos error al usuario ya que es normal que no haya tutela aún
        }
      } catch (err) {
        console.error("⚠️ Error al cargar tutela existente:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadExistingTutela();
  }, [caseId]);

  // Este useEffect se ejecuta cuando el componente se monta y cuando cambia canUpload
  // para asegurar que la tutela permanezca visible independientemente de cambios en el estado del caso
  useEffect(() => {
    // Si ya tenemos la tutela cargada o estamos en carga inicial, no hacemos nada
    if (tutelaData || isInitialLoading) return;
    
    // Si no tenemos tutela cargada y no estamos en carga inicial, intentamos cargarla
    const reloadTutelaIfNeeded = async () => {
      try {
        console.log("Recargando tutela después de cambio de estado para caso:", caseId);
        const result = await getLatestTutelaFromDocuments(caseId);
        
        if (result.success && result.data) {
          setTutelaData(result.data);
          console.log("✅ Tutela recargada exitosamente después de cambio de estado");
        }
      } catch (err) {
        console.error("⚠️ Error al recargar tutela después de cambio de estado:", err);
      }
    };
    
    reloadTutelaIfNeeded();
  }, [canUpload, caseId, tutelaData, isInitialLoading]);

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

  // Manejar el cambio de tutela existente
  const handleChangeTutela = () => {
    // Abrir diálogo de confirmación para cambiar tutela
    setIsReplaceAlertOpen(true);
  };

  // Confirmación para reemplazar tutela existente
  const confirmReplaceTutela = () => {
    // Limpiar estado para cambiar la tutela
    setTutelaData(null);
    setSelectedFile(null);
    setError(null);
    setIsReplaceAlertOpen(false);
    
    // Mostrar indicación visual de que se está cambiando la tutela
    addToast({
      title: "Cambio de tutela",
      description: "Seleccione el nuevo documento para reemplazar la tutela actual",
      color: "primary",
    });
    
    // Abrir selector de archivos con un pequeño retraso para permitir la actualización del estado
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
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
        
        // Guardar el ID del documento para futuras cargas
        if (result.data.id_documento) {
          localStorage.setItem(`case_${caseId}_tutela_doc_id`, result.data.id_documento.toString());
          console.log("💾 ID de tutela guardado en localStorage:", result.data.id_documento);
        }
        
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

  if (isInitialLoading) {
    return (
      <>
        <h6 className="font-medium text-lg mb-4">
          Previsualización de la tutela
        </h6>
        <div className="rounded-xl border-1 bg-white mb-6 p-5 flex justify-center items-center" style={{ height: "200px" }}>
          <div className="flex flex-col items-center">
            <Spinner color="primary" size="lg" className="mb-2" />
            <p className="text-sm text-gray-600">Cargando tutela existente...</p>
          </div>
        </div>
      </>
    );
  }

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
        type="info"
        isLoading={isLoading}
      />

      <AlertDialog
        isOpen={isReplaceAlertOpen}
        onClose={() => setIsReplaceAlertOpen(false)}
        onConfirm={confirmReplaceTutela}
        title="Reemplazar tutela"
        description="¿Está seguro que desea reemplazar la tutela actual? La tutela anterior seguirá en el historial de documentos pero ya no será la principal."
        confirmText="Reemplazar"
        type="warning"
        isLoading={isLoading}
      />

      {!tutelaData ? (
        <div
          className={`rounded-xl border-2 border-dashed mb-6 transition-all ${
            isDragging
              ? "border-primary bg-blue-50"
              : "border-gray-300 bg-white"
          } ${!canUpload ? "opacity-50 pointer-events-none" : ""}`}
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
                : "Carga tu documento de tutela"}
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
                El estado actual del caso no permite cargar tutelas o su rol no
                tiene permisos
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
                {tutelaData.nombre_documento}
                {tutelaData.ext_documento}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(tutelaData.fecha_asigna).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
              <Button
                color="primary"
                variant="light"
                size="sm"
                startContent={<CloudArrowUpIcon className="w-4 h-4" />}
                onPress={handleChangeTutela}
              >
                Cambiar
              </Button>
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
