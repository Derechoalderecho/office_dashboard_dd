"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { 
  Button, 
  Spinner, 
  addToast, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Tooltip
} from "@heroui/react";
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { 
  uploadTutelaDocument, 
  TutelaResponse, 
  getLatestTutelaFromDocuments,
  getTutelaDocumentById
} from "@/services/tutelaService";
import { uploadRadicadoDocument } from "@/actions/uploadDocsActions";
import { getLatestRadicadoDocument } from "@/services/documentService";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

interface CasePreviewProps {
  previewText?: string;
  caseId: number;
  canUpload?: boolean;
  caseState?: string;
  onTutelaUploaded?: (isFromRadicarButton?: boolean) => void;
}

export default function CasePreview({
  previewText,
  caseId,
  canUpload = true, // Por defecto permitimos la carga si no se especifica
  caseState,
  onTutelaUploaded,
}: CasePreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isReplaceAlertOpen, setIsReplaceAlertOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
        
        // Si el caso está en estado "Espera del juez", intentar cargar el último documento radicado
        if (caseState === "Espera del juez") {
          console.log("📥 Caso en estado 'Espera del juez', buscando último documento radicado");
          const radicadoDoc = await getLatestRadicadoDocument(caseId);
          
          if (radicadoDoc) {
            // Convertir DocumentResponse a TutelaResponse
            const tutelaData: TutelaResponse = {
              nombre_documento: radicadoDoc.nombre_documento || "",
              enlace: radicadoDoc.enlace || "",
              contenido_documento: radicadoDoc.contenido_documento || "",
              ext_documento: radicadoDoc.ext_documento || "",
              id_caso: radicadoDoc.id_caso,
              id_documento: radicadoDoc.id_documento,
              fecha_asigna: radicadoDoc.fecha_asigna || new Date().toISOString()
            };
            
            setTutelaData(tutelaData);
            console.log("✅ Documento radicado cargado exitosamente:", tutelaData.nombre_documento);
            
            // Guardar el ID del documento para futuras cargas
            localStorage.setItem(`case_${caseId}_tutela_doc_id`, tutelaData.id_documento.toString());
            console.log("💾 ID de documento radicado guardado en localStorage:", tutelaData.id_documento);
            
            setIsInitialLoading(false);
            return;
          } else {
            console.log("⚠️ No se encontró documento radicado, intentando cargar tutela normal");
          }
        }
        
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
    const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExt || "");
    const isDocument = ["docx", "pdf"].includes(fileExt || "");
    
    // Verificar si el caso está en estado "Radicar" para permitir imágenes
    const allowImages = canUpload; // En el estado "Radicar", canUpload será true

    // Check file type
    if ((!isDocument && !allowImages) || (!isDocument && !isImage && allowImages)) {
      const message = allowImages 
        ? "Solo se permiten archivos .docx, .pdf, .jpg, .jpeg, .png, .gif, .bmp o .webp" 
        : "Solo se permiten archivos .docx o .pdf";
      
      setError(message);
      addToast({
        title: "Error de formato",
        description: message,
        color: "danger",
      });
      return false;
    }

    // Check file size (10MB para imágenes, 5MB para documentos)
    const maxSize = isImage ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    const maxSizeText = isImage ? "10 MB" : "5 MB";
    
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. El tamaño máximo es ${maxSizeText}.`);
      addToast({
        title: "Error de tamaño",
        description:
          `El archivo es demasiado grande. El tamaño máximo es ${maxSizeText}.`,
        color: "danger",
      });
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      
      // Generar preview para imágenes
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExt || "");
      
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
      
      setIsAlertOpen(true);
    } else {
      setSelectedFile(null);
      setImagePreview(null);
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
  
  // Función para descargar el documento radicado usando URL firmada
  const handleDownloadDocument = async () => {
    if (!tutelaData || !tutelaData.id_documento) return;
    
    try {
      setIsLoading(true);
      
      // Determinar el folder basado en el estado del caso
      const folder = caseState === "Espera del juez" ? "radicados" : "documentos_casos";
      
      // Obtener la URL firmada del API
      const apiUrl = `${API_BASE_URL}/documentos/${tutelaData.id_documento}/download?folder=${folder}`;
      console.log(`Descargando documento con folder: ${folder}. URL: ${apiUrl}`);
      
      const response = await axios.get(apiUrl);
      
      if (response.status !== 200 || !response.data.url_firmada) {
        throw new Error(`No se encontró la URL firmada en la respuesta para el folder ${folder}`);
      }
      
      const signedUrl = response.data.url_firmada;
      console.log('URL firmada obtenida:', signedUrl);
      
      // Abrir la URL firmada en una nueva pestaña
      window.open(signedUrl, '_blank');
      
      addToast({
        title: "Descarga iniciada",
        description: `El documento se está abriendo en una nueva pestaña`,
        color: "success",
      });
    } catch (err) {
      console.error("Error al descargar documento:", err);
      addToast({
        title: "Error",
        description: "Ocurrió un error al intentar descargar el documento",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar el cambio de tutela o radicado existente
  const handleChangeTutela = () => {
    // Si estamos en estado de radicar, asegurarnos de que solo cambiamos la tutela sin radicarla
    if (localStorage.getItem(`case_${caseId}_radicar_action`) === 'true') {
      localStorage.removeItem(`case_${caseId}_radicar_action`);
    }
    
    // Si estamos en estado Espera del juez, establecer la bandera para cambiar radicado
    if (caseState === "Espera del juez") {
      localStorage.setItem(`case_${caseId}_change_tutela_action`, 'true');
    }
    
    // Abrir diálogo de confirmación para cambiar documento
    setIsReplaceAlertOpen(true);
  };

  // Confirmación para reemplazar documento existente
  const confirmReplaceTutela = () => {
    // Limpiar estado para cambiar el documento
    setTutelaData(null);
    setSelectedFile(null);
    setImagePreview(null);
    setError(null);
    setIsReplaceAlertOpen(false);
    
    // Mostrar indicación visual de que se está cambiando el documento
    const isRadicado = caseState === "Espera del juez";
    addToast({
      title: isRadicado ? "Cambio de radicado" : "Cambio de tutela",
      description: isRadicado 
        ? "Seleccione el nuevo documento para reemplazar el radicado actual" 
        : "Seleccione el nuevo archivo para reemplazar la tutela actual",
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

      // Verificar si estamos en estado "Radicar" y viene del botón de radicar
      const isRadicarAction = localStorage.getItem(`case_${caseId}_radicar_action`) === 'true';
      // Verificar si estamos cambiando el radicado en estado "Espera del juez"
      const isChangeTutelaAction = localStorage.getItem(`case_${caseId}_change_tutela_action`) === 'true';
      const isRadicarState = caseState === "Radicar";
      const isEsperaJuezState = caseState === "Espera del juez";
      
      let tutelaDocId;
      
      // Usar el endpoint específico para radicar tutelas cuando:
      // 1. Estamos en estado Radicar y viene del botón de radicar, o
      // 2. Estamos en estado Espera del juez y viene del botón de cambiar radicado
      if ((isRadicarState && isRadicarAction) || (isEsperaJuezState && isChangeTutelaAction)) {
        console.log("📤 Subiendo documento al endpoint /upload con folder=radicados");
        const result = await uploadRadicadoDocument(formData, caseId);
        
        if (result.success && result.data) {
          // Convertir DocumentResponse a TutelaResponse
          const tutelaData: TutelaResponse = {
            nombre_documento: result.data.nombre_documento || "",
            enlace: result.data.enlace || "",
            contenido_documento: "", // El endpoint /upload no devuelve contenido
            ext_documento: result.data.ext_documento || "",
            id_caso: result.data.id_caso,
            id_documento: result.data.id_documento,
            fecha_asigna: result.data.fecha_asigna
          };
          
          setTutelaData(tutelaData);
          tutelaDocId = result.data.id_documento;
        } else {
          setError(result.error || "Error desconocido al subir el documento");
          addToast({
            title: "Error",
            description: result.error || "Error desconocido al subir el documento",
            color: "danger",
          });
          return;
        }
      } else {
        console.log("📤 Subiendo tutela al endpoint /tutelas normal");
        const result = await uploadTutelaDocument(formData, caseId);
        
        if (result.success && result.data) {
          setTutelaData(result.data);
          tutelaDocId = result.data.id_documento;
        } else {
          setError(result.error || "Error desconocido al subir el documento");
          addToast({
            title: "Error",
            description: result.error || "Error desconocido al subir el documento",
            color: "danger",
          });
          return;
        }
      }
      
      // Si llegamos aquí, la carga fue exitosa
      
      // Guardar el ID del documento para futuras cargas
      if (tutelaDocId) {
        localStorage.setItem(`case_${caseId}_tutela_doc_id`, tutelaDocId.toString());
      }
      
      // Limpiar banderas de acción
      localStorage.removeItem(`case_${caseId}_radicar_action`);
      localStorage.removeItem(`case_${caseId}_allow_change_tutela`);
      localStorage.removeItem(`case_${caseId}_change_tutela_action`);
      
      // Mostrar mensaje de éxito
      const isRadicado = (isRadicarState && isRadicarAction) || (isEsperaJuezState && isChangeTutelaAction);
      addToast({
        title: "Éxito",
        description: isRadicado 
          ? "Documento radicado cargado correctamente" 
          : "Documento de tutela cargado correctamente",
        color: "success",
      });
      
      // Notificar al componente padre
      if (onTutelaUploaded) {
        // Determinar si la carga viene del botón de radicar
        onTutelaUploaded(isRadicarAction);
      }
      
      // Limpiar estados
      setSelectedFile(null);
      setImagePreview(null);
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

      {/* Usar Modal directamente en lugar de AlertDialog para poder mostrar contenido JSX */}
      <Modal isOpen={isAlertOpen} onClose={() => {
        setIsAlertOpen(false);
        setSelectedFile(null);
        setImagePreview(null);
      }}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Confirmar carga de archivo</ModalHeader>
          <ModalBody>
            <p className="mb-2">
              ¿Estás seguro de que deseas cargar el archivo{" "}
              <strong>{selectedFile?.name}</strong>?
            </p>
            {imagePreview && (
              <div className="my-3 border rounded-md overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Vista previa" 
                  className="max-h-64 max-w-full mx-auto object-contain"
                />
              </div>
            )}
            <p className="text-xs text-gray-500">
              Una vez cargado, el archivo será procesado y estará disponible
              para su revisión.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="light" 
              onPress={() => {
                setIsAlertOpen(false);
                setSelectedFile(null);
                setImagePreview(null);
              }}
              isDisabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              color="primary" 
              onPress={handleUpload}
              isLoading={isLoading}
              spinner={<Spinner size="sm" color="white" />}
            >
              Cargar archivo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isReplaceAlertOpen} onClose={() => setIsReplaceAlertOpen(false)}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Reemplazar tutela</ModalHeader>
          <ModalBody>
            <p>
              ¿Está seguro que desea reemplazar la tutela actual? La tutela anterior seguirá en el historial de documentos pero ya no será la principal.
            </p>
            {!canUpload && (
              <p className="mt-2 text-sm text-amber-600 font-medium">
                <strong>Nota:</strong> Este cambio solo reemplazará la previsualización de la tutela pero no la radicará.
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="light" 
              onPress={() => setIsReplaceAlertOpen(false)}
              isDisabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              color="warning" 
              onPress={confirmReplaceTutela}
              isLoading={isLoading}
              spinner={<Spinner size="sm" color="white" />}
            >
              Reemplazar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
                  {canUpload 
                    ? "Formatos aceptados: DOCX, PDF (máximo 5MB), JPG, PNG, GIF, BMP, WEBP (máximo 10MB)" 
                    : "Formatos aceptados: DOCX, PDF (máximo 5MB)"}
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
            {/* Mostrar botón Cambiar */}
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

          {/* Mostrar contenido según el tipo de archivo y estado del caso */}
          {caseState === "Espera del juez" ? (
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-blue-50 p-3 rounded-full">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Documento Radicado
              </h3>
              <p className="text-sm text-gray-600 mb-2 text-center">
                {tutelaData.nombre_documento}{tutelaData.ext_documento}
              </p>
              <p className="text-xs text-gray-500 mb-4 text-center">
                Radicado el {new Date(tutelaData.fecha_asigna).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Este documento no se puede previsualizar directamente. Puede descargarlo para verlo.
              </p>
              <Button
                color="primary"
                startContent={<ArrowDownTrayIcon className="w-5 h-5" />}
                onPress={handleDownloadDocument}
                className="w-full max-w-xs"
              >
                Descargar Documento
              </Button>
            </div>
          ) : tutelaData.ext_documento && [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"].includes(tutelaData.ext_documento.toLowerCase()) ? (
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
              <div className="flex items-center mb-3 w-full">
                <PhotoIcon className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm text-gray-700">{tutelaData.nombre_documento}{tutelaData.ext_documento}</span>
              </div>
              <img 
                src={tutelaData.enlace || ""} 
                alt={tutelaData.nombre_documento} 
                className="max-h-[450px] max-w-full object-contain rounded-md border border-gray-200"
              />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none overflow-y-auto h-[500px]">
              <div className="text-sm whitespace-pre-line font-sans text-gray-800">
                {tutelaData.contenido_documento}
              </div>
            </div>
          )}
        </div>
      )}

      {/* El input file debe estar fuera de las condiciones, para que siempre esté disponible */}
      <input
        type="file"
        ref={fileInputRef}
        id="tutela-file-input"
        className="hidden"
        accept=".docx,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
        onChange={handleFileChange}
        disabled={isLoading || !canUpload}
      />
    </>
  );
}
