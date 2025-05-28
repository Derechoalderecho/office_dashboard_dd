"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button, 
  Spinner,
  Chip, 
  Input,
  Select,
  SelectItem,
  addToast
} from "@heroui/react";
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  XMarkIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon
} from "@heroicons/react/24/outline";
import { DocumentResponse, downloadDocument } from "@/actions/uploadDocsActions";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDocuments } from '@/store/slices/documentSlice';
import { fetchCase } from '@/store/slices/caseSlice';
import { parseDateToLocal } from "@/utils/date";
import { API_BASE_URL } from "@/config/api";

type SortOption = "newest" | "oldest" | "name" | "type";

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  refreshFlag?: boolean;
  onRefreshed?: () => void;
}

export default function DocumentsModal({ 
  isOpen, 
  onClose, 
  caseId,
  refreshFlag = false,
  onRefreshed
}: DocumentsModalProps) {
  const dispatch = useAppDispatch();
  const { documents, loading, error } = useAppSelector((state) => state.document);
  const { currentCase, loading: caseLoading } = useAppSelector((state) => state.case);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentResponse[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [hasLoadingError, setHasLoadingError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    try {
      // Convertir caseId a número y obtener documentos a través de Redux
      const numericCaseId = parseInt(caseId, 10);
      if (isNaN(numericCaseId)) {
        throw new Error('ID de caso inválido');
      }
      
      // Cargar el caso y sus documentos sin usar caché
      (async () => {
        try {
          // Importar dinámicamente para evitar problemas de circular import
          const { fetchCaseByIdFresh } = await import('@/services/caseService');
          const freshCase = await fetchCaseByIdFresh(numericCaseId);
          
          if (freshCase?.documentos) {
            // Actualizar documentos en Redux
            dispatch(setDocuments(freshCase.documentos));
            console.log("Documentos cargados (fresh):", freshCase.documentos.length);
            setHasLoadingError(false);
          }
        } catch (error: any) {
          console.error("Error al cargar caso:", error);
          // Si el error es 404, simplemente establecemos una lista vacía de documentos
          if (error.status === 404 || (error.message && error.message.includes("404"))) {
            dispatch(setDocuments([]));
            setHasLoadingError(false);
          } else {
            setHasLoadingError(true);
          }
        }
      })();
    } catch (error: any) {
      console.error("Error obteniendo documentos:", error.message);
      setHasLoadingError(true);
    }
  }, [isOpen, caseId, dispatch]);

  useEffect(() => {
    if (isOpen && refreshFlag) {
      try {
        console.log("Refrescando documentos del caso...");
        
        // Recargar el caso para obtener los documentos actualizados
        const numericCaseId = parseInt(caseId, 10);
        if (!isNaN(numericCaseId)) {
          // Forzar refresco ignorando la caché
          (async () => {
            try {
              // Usar fetchCaseByIdFresh para obtener datos sin caché
              const { fetchCaseByIdFresh } = await import('@/services/caseService');
              try {
                const updatedCase = await fetchCaseByIdFresh(numericCaseId);
                
                if (updatedCase?.documentos) {
                  console.log("Caso actualizado con éxito:", 
                    updatedCase.documentos.length, "documentos");
                    
                  // Actualizamos directamente los documentos sin esperar otro efecto
                  dispatch(setDocuments(updatedCase.documentos));
                  setFilteredDocuments(sortDocuments(updatedCase.documentos, sortBy));
                  setHasLoadingError(false);
                }
              } catch (error: any) {
                console.error("Error al actualizar caso:", error);
                // Si el error es 404, simplemente establecemos una lista vacía de documentos
                if (error.status === 404 || (error.message && error.message.includes("404"))) {
                  dispatch(setDocuments([]));
                  setFilteredDocuments([]);
                  setHasLoadingError(false);
                } else {
                  setHasLoadingError(true);
                }
              }
            } finally {
              // Notificar que se ha completado el refresco
              if (onRefreshed) {
                onRefreshed();
              }
            }
          })();
        } else {
          if (onRefreshed) onRefreshed();
        }
      } catch (error) {
        console.error("Error al refrescar documentos:", error);
        setHasLoadingError(true);
        if (onRefreshed) onRefreshed();
      }
    }
  }, [isOpen, refreshFlag, caseId, dispatch, onRefreshed, sortBy]);

  useEffect(() => {
    if (currentCase?.documentos && isOpen) {
      dispatch(setDocuments(currentCase.documentos));
      setFilteredDocuments(sortDocuments(currentCase.documentos, sortBy));
      setHasLoadingError(false);
    }
  }, [currentCase, isOpen, dispatch, sortBy]);

  useEffect(() => {
    if (documents.length > 0) {
      let filtered = documents;
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = documents.filter(doc => 
          doc.nombre_documento.toLowerCase().includes(term) ||
          doc.ext_documento.toLowerCase().includes(term)
        );
      }
      
      setFilteredDocuments(sortDocuments(filtered, sortBy));
    } else {
      setFilteredDocuments([]);
    }
  }, [searchTerm, sortBy, documents]);

  const sortDocuments = (docs: DocumentResponse[], sortOption: SortOption): DocumentResponse[] => {
    const sorted = [...docs];
    
    switch (sortOption) {
      case "newest":
        return sorted.sort((a, b) => 
          new Date(b.fecha_asigna).getTime() - new Date(a.fecha_asigna).getTime()
        );
      case "oldest":
        return sorted.sort((a, b) => 
          new Date(a.fecha_asigna).getTime() - new Date(b.fecha_asigna).getTime()
        );
      case "name":
        return sorted.sort((a, b) => 
          a.nombre_documento.localeCompare(b.nombre_documento)
        );
      case "type":
        return sorted.sort((a, b) => 
          a.ext_documento.localeCompare(b.ext_documento)
        );
      default:
        return sorted;
    }
  };

  const handleDownload = async (document: DocumentResponse) => {
    setDownloadingId(document.id_documento);
    
    try {
      // Determinar el folder correcto basado en el enlace original del documento
      let folder = 'documentos_casos'; // Valor por defecto
      
      // Si el documento tiene un enlace, intentamos extraer el folder de la URL
      if (document.enlace) {
        const urlParts = document.enlace.split('/');
        // Buscamos el índice de 'bucket_consultorios' y tomamos el siguiente elemento
        const bucketIndex = urlParts.findIndex(part => part === 'bucket_consultorios');
        if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
          const extractedFolder = urlParts[bucketIndex + 1];
          // Si el folder contiene un signo de interrogación, lo eliminamos
          if (extractedFolder.includes('?')) {
            folder = extractedFolder.split('?')[0];
          } else {
            folder = extractedFolder;
          }
          console.log('Folder extraído de la URL:', folder);
        }
      } 
      // Si no hay enlace o no pudimos extraer el folder, usamos el nombre del documento
      else if (document.nombre_documento) {
        const nombre = document.nombre_documento.toLowerCase();
        if (nombre.includes('radicado')) {
          folder = 'radicados';
        } else if (nombre.includes('tutela')) {
          folder = 'tutelas';
        }
      }
      console.log('Folder determinado por el nombre del documento:', folder);
      
      // Verificar que el folder sea válido (solo 'documentos_casos', 'radicados' o 'tutelas')
      if (folder !== 'documentos_casos' && folder !== 'radicados' && folder !== 'tutelas') {
        console.warn(`Folder no válido: ${folder}, usando documentos_casos`);
        folder = 'documentos_casos';
      }
      
      // Obtener la URL firmada del API
      const apiUrl = `${API_BASE_URL}/documentos/${document.id_documento}/download?folder=${folder}`;
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
        description: `${document.nombre_documento}${document.ext_documento} se está descargando`,
        color: "success"
      });
      
      setDownloadingId(null);
    } catch (error: any) {
      console.error("Error en la descarga:", error);
      addToast({
        title: "Error de descarga",
        description: error.message || "No se pudo descargar el documento",
        color: "danger"
      });
      setDownloadingId(null);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-50 flex items-center justify-center rounded-lg">
            <Spinner size="lg" color="primary" />
          </div>
        )}
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Documentos del caso</h2>
            <Chip color="primary" variant="flat">
              {documents.length} Documentos
            </Chip>
          </div>
        </ModalHeader>
        
        <ModalBody className="overflow-y-auto max-h-[500px]">
          {!loading && !hasLoadingError && documents.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onValueChange={handleSearch}
                startContent={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                className="flex-grow"
              />
              <Select
                label="Ordenar por"
                onChange={(e) => handleSortChange(e.target.value)}
                startContent={<ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />}
                className="w-full sm:w-auto sm:min-w-[180px]"
                defaultSelectedKeys={["newest"]}
              >
                <SelectItem key="newest">Más recientes</SelectItem>
                <SelectItem key="oldest">Más antiguos</SelectItem>
                <SelectItem key="name">Nombre</SelectItem>
                <SelectItem key="type">Tipo</SelectItem>
              </Select>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" color="primary" />
            </div>
          ) : hasLoadingError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ExclamationCircleIcon className="w-12 h-12 text-danger mb-4" />
              <p className="text-danger">Error al cargar los documentos. Intente nuevamente.</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              {searchTerm ? (
                <p className="text-gray-500">No se encontraron documentos con ese término de búsqueda</p>
              ) : (
                <p className="text-gray-500">No hay documentos disponibles para este caso</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id_documento} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-start gap-3">
                    <DocumentTextIcon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-medium">{doc.nombre_documento}{doc.ext_documento}</p>
                      <p className="text-sm text-gray-500">
                        Subido el {parseDateToLocal(doc.fecha_asigna)}
                      </p>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={doc.ext_documento === '.pdf' ? 'danger' : 'primary'}
                        className="mt-1"
                      >
                        {doc.ext_documento.substring(1).toUpperCase()}
                      </Chip>
                    </div>
                  </div>
                  <Button
                    color="primary"
                    isLoading={downloadingId === doc.id_documento}
                    spinner={<Spinner size="sm" color="white" />}
                    onPress={() => handleDownload(doc)}
                    startContent={<ArrowDownTrayIcon className="w-5 h-5" />}
                    className="sm:self-end"
                  >
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button 
            variant="light" 
            onPress={onClose}
            startContent={<XMarkIcon className="w-5 h-5" />}
          >
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 